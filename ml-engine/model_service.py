import numpy as np
import pandas as pd
import joblib
import os
import time

class AuthenticityModelService:
    def __init__(self, model_dir="models/"):
        # 1. Paths
        model_path = os.path.join(model_dir, "authenticity_rf_model.pkl")
        scaler_path = os.path.join(model_dir, "feature_scaler.pkl")
        features_path = os.path.join(model_dir, "feature_names.pkl")
        means_path = os.path.join(model_dir, "dataset_means.pkl")
        
        # 2. Lazy Training Check
        if not all(os.path.exists(p) for p in [model_path, scaler_path, features_path, means_path]):
            from trainer import train_model
            train_model()
            
        # 3. Load Model and Metadata
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.feature_names = joblib.load(features_path)
        self.dataset_means = joblib.load(means_path)
        
        # Extract Global Feature Importances
        self.feature_importances = dict(zip(self.feature_names, self.model.feature_importances_))
        
        print(f"Refined ML Model Initialized with {len(self.feature_names)} features.")

    def predict(self, input_data: dict):
        """
        Input: {followers, avg_likes, avg_comments, follower_growth_std, comment_uniqueness_ratio, fake_follower_ratio}
        """
        # 1. Feature Engineering (Matches trainer.py)
        # engagement_rate
        er = (input_data['avg_likes'] + input_data['avg_comments']) / (input_data['followers'] + 1)
        
        # like_to_comment_ratio
        ltcr = input_data['avg_likes'] / (input_data['avg_comments'] + 1)
        
        # interaction features
        eng_uniq = er * input_data['comment_uniqueness_ratio']
        growth_eng = input_data['follower_growth_std'] / (er + 0.001)
        
        # Prepare feature mapping
        processed_features = {
            'followers': input_data['followers'],
            'avg_likes': input_data['avg_likes'],
            'avg_comments': input_data['avg_comments'],
            'engagement_rate': er,
            'like_to_comment_ratio': ltcr,
            'growth_variance': input_data['follower_growth_std'],
            'comment_uniqueness_ratio': input_data['comment_uniqueness_ratio'],
            'engagement_uniqueness': eng_uniq,
            'growth_engagement_ratio': growth_eng
        }
        
        # 2. Sequential Scaling (Must match trainer.py order)
        feature_vector = [processed_features[f] for f in self.feature_names]
        scaled_vector = self.scaler.transform([feature_vector])
        
        # 3. Prediction (Score)
        score = self.model.predict(scaled_vector)[0]
        score = np.clip(score, 0, 100) # Ensure 0-100 range
        
        # 4. Confidence Score (Standard deviation across trees)
        tree_preds = np.array([tree.predict(scaled_vector)[0] for tree in self.model.estimators_])
        std_dev = np.std(tree_preds)
        # Normalize: High std (e.g. 15+) -> Low confidence (0)
        # Typical std on good model is 1–5
        confidence = 100 * (1 - min(std_dev / 15.0, 1.0))
        
        # 5. Verdict Logic
        verdict = self._get_verdict(score)
        risk_level = self._get_risk_level(score)
        
        # 6. Explanation Layer
        explanation = self._generate_explanation(processed_features, scaled_vector[0])
        
        # 7. Insights (Legacy/Additional)
        insights = self._generate_insights(processed_features, score)
        
        return {
            "score": round(score, 2),
            "confidence": round(confidence, 2),
            "risk_level": risk_level,
            "verdict": verdict,
            "processed_features": {f: round(val, 4) for f, val in processed_features.items()},
            "explanation": explanation,
            "insights": insights
        }

    def _get_verdict(self, score):
        if score >= 75: return "Recommended for brand collaboration"
        if score >= 50: return "Moderate risk — evaluate carefully"
        return "High risk — not recommended"

    def _get_risk_level(self, score):
        if score >= 75: return "Low"
        if score >= 50: return "Medium"
        return "High"

    def _generate_explanation(self, p_features, scaled_features):
        """
        Identify top influencers and compare to dataset mean.
        Uses scaled features to determine 'importance' for this specific sample.
        """
        # Calculate local importance: Global Weight * Absolute Scaled Value (influence magnitude)
        local_influence = {
            f: self.feature_importances[f] * abs(scaled_features[i]) 
            for i, f in enumerate(self.feature_names)
        }
        
        # Sort top 3
        top_3 = sorted(local_influence.items(), key=lambda x: x[1], reverse=True)[:3]
        
        explanations = []
        for feature, _ in top_3:
            val = p_features[feature]
            mean = self.dataset_means[feature]
            
            # Simple mapping for display names
            display_name = feature.replace('_', ' ').capitalize()
            
            # Growth volatility logic (Inverse impact)
            is_inverse = feature in ['growth_variance', 'growth_engagement_ratio', 'fake_follower_ratio']
            
            if val > mean * 1.2:
                impact = "negatively" if is_inverse else "positively"
                context = "higher than average"
            elif val < mean * 0.8:
                impact = "positively" if is_inverse else "negatively"
                context = "lower than expected"
            else:
                impact = "consistently"
                context = "consistent with organic benchmarks"
            
            stmt = f"{display_name} is {context}, {impact} influencing the authenticity score."
            explanations.append(stmt)
            
        return explanations

    def _generate_insights(self, features, score):
        # Basic heuristic insights (complementing the ML explanation)
        insights = []
        if features['engagement_rate'] > 0.04:
            insights.append("Engagement rate is strong relative to follower count.")
        if features['comment_uniqueness_ratio'] > 0.7:
            insights.append("High comment uniqueness indicates an active, real audience.")
        if features['growth_variance'] > 3000:
            insights.append("Atypical growth clusters detected; further audit recommended.")
        return insights[:3]

# Singleton instance
service = None

def get_service():
    global service
    if service is None:
        service = AuthenticityModelService()
    return service
