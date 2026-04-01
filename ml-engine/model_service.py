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
        
        # 2. Check and Load Metadata
        if not all(os.path.exists(p) for p in [model_path, scaler_path, features_path, means_path]):
            from trainer import train_model
            train_model()
            
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.feature_names = joblib.load(features_path)
        self.dataset_means = joblib.load(means_path)
        self.feature_importances = dict(zip(self.feature_names, self.model.feature_importances_))
        
        print(f"Finalized CreatorTrust ML Response Layer Initialized.")

    def predict(self, input_data: dict):
        """
        Input: {followers, avg_likes, avg_comments, follower_growth_std, comment_uniqueness_ratio, fake_follower_ratio}
        """
        # 1. Feature Engineering
        er = (input_data['avg_likes'] + input_data['avg_comments']) / (input_data['followers'] + 1)
        ltcr = input_data['avg_likes'] / (input_data['avg_comments'] + 1)
        eng_uniq = er * input_data['comment_uniqueness_ratio']
        growth_eng = input_data['follower_growth_std'] / (er + 0.001)
        
        processed_features = {
            'engagement_rate': er,
            'comment_uniqueness_ratio': input_data['comment_uniqueness_ratio'],
            'growth_variance': input_data['follower_growth_std'],
            'like_to_comment_ratio': ltcr,
            'engagement_uniqueness': eng_uniq,
            'growth_engagement_ratio': growth_eng
        }
        
        full_features = {
            'followers': input_data['followers'],
            'avg_likes': input_data['avg_likes'],
            'avg_comments': input_data['avg_comments'],
            **processed_features
        }
        
        # 2. Scaling and Model Prediction
        feature_vector = [full_features[f] for f in self.feature_names]
        scaled_vector = self.scaler.transform([feature_vector])
        
        # Raw Prediction
        raw_score = self.model.predict(scaled_vector)[0]
        
        # 3. Calibration
        scaled_score = raw_score * 1.15
        if er > 0.06 and input_data['comment_uniqueness_ratio'] > 0.85:
            scaled_score += 10.0
        elif er > 0.04 or input_data['comment_uniqueness_ratio'] > 0.8:
            scaled_score += 5.0
            
        final_score = np.clip(scaled_score, 0, 100)
        
        # 4. Confidence Score
        tree_preds = np.array([tree.predict(scaled_vector)[0] for tree in self.model.estimators_])
        std_dev = np.std(tree_preds)
        confidence = 100 * (1 - min(std_dev / 10.0, 1.0))
        
        # 5. LABELS & VERDICTS (Finalized Polish)
        score_label = self._get_score_label(final_score)
        confidence_label = self._get_confidence_label(confidence)
        risk_level = self._get_risk_level(final_score)
        verdict = self._get_verdict(final_score)
        key_takeaway = self._get_key_takeaway(final_score, risk_level)
        suitability_insight = self._get_suitability_insight(processed_features, final_score)
        
        # 6. EXPLAINABILITY (Finalized Factors & Explanation)
        top_factors = self._generate_top_factors(full_features, scaled_vector[0])
        explanation = self._generate_explanation(full_features, scaled_vector[0])
        
        # Clean processed features for transparency
        clean_processed = {f: round(val, 4) for f, val in processed_features.items()}
        
        return {
            "score": round(final_score, 2),
            "score_label": score_label,
            "confidence": round(confidence, 2),
            "confidence_label": confidence_label,
            "risk_level": risk_level,
            "verdict": verdict,
            "key_takeaway": key_takeaway,
            "suitability_insight": suitability_insight,
            "raw_features": {
                "followers": input_data['followers'],
                "avg_likes": input_data['avg_likes'],
                "avg_comments": input_data['avg_comments']
            },
            "processed_features": clean_processed,
            "explanation": explanation,
            "top_factors": top_factors
        }

    def _get_score_label(self, score):
        if score >= 75: return "Excellent"
        if score >= 60: return "Good"
        if score >= 45: return "Average"
        return "Risky"

    def _get_confidence_label(self, confidence):
        if confidence >= 80: return "High Confidence"
        if confidence >= 50: return "Moderate Confidence"
        return "Low Confidence"

    def _get_verdict(self, score):
        if score >= 75: return "Recommended for brand collaboration"
        if score >= 50: return "Moderate risk — evaluate carefully"
        return "High risk — not recommended"

    def _get_risk_level(self, score):
        if score >= 75: return "Low"
        if score >= 50: return "Medium"
        return "High"

    def _get_key_takeaway(self, score, risk):
        if score >= 85:
            return "Strong organic engagement with low fraud risk."
        if score >= 65:
            return "Solid creator profile with high audience authenticity."
        if risk == "Medium":
            return "Moderate performance with some authenticity concerns."
        return "High risk due to inconsistent growth and low engagement."

    def _get_suitability_insight(self, features, score):
        if score >= 85:
            return "Exceptional creator with a dedicated, organic audience. Ideal for premium partnerships."
        if score >= 75:
            return "Highly suitable for campaigns requiring deep organic interaction."
        if score >= 50:
            return "A functional creator profile with balanced metrics. Suitable for utility or reach campaigns."
        if features['growth_variance'] > 4000:
            return "Inconsistent growth patterns detected. Engagement does not match follower velocity."
        return "Creator profile shows significant markers of inorganic audience growth or bot activity."

    def _generate_top_factors(self, full_features, scaled_features):
        local_influence = {
            f: self.feature_importances[f] * abs(scaled_features[i]) 
            for i, f in enumerate(self.feature_names)
        }
        top_3 = sorted(local_influence.items(), key=lambda x: x[1], reverse=True)[:3]
        
        factors = []
        for feature, _ in top_3:
            val = full_features[feature]
            mean = self.dataset_means[feature]
            is_inverse = feature in ['growth_variance', 'growth_engagement_ratio', 'fake_follower_ratio']
            
            # Final Standardized labels
            if feature == 'engagement_rate':
                label = "Engagement Rate"
            elif feature == 'comment_uniqueness_ratio' or feature == 'engagement_uniqueness':
                label = "Audience Authenticity"
            elif feature == 'growth_variance' or feature == 'growth_engagement_ratio':
                label = "Growth Pattern"
            elif feature == 'like_to_comment_ratio':
                label = "Interaction Quality"
            else:
                label = feature.replace('_', ' ').capitalize()
            
            if val > mean * 1.15:
                status = "High" if not is_inverse else "Unstable"
            elif val < mean * 0.85:
                status = "Low" if not is_inverse else "Stable"
            else:
                status = "Strong" if not is_inverse else "Stable"
                
            factors.append(f"{status} {label}")
            
        return list(dict.fromkeys(factors))[:3]

    def _generate_explanation(self, full_features, scaled_features):
        local_influence = {
            f: self.feature_importances[f] * abs(scaled_features[i]) 
            for i, f in enumerate(self.feature_names)
        }
        top_2 = sorted(local_influence.items(), key=lambda x: x[1], reverse=True)[:2]
        
        explanations = []
        seen_names = set()
        
        # Sort all features by influence and pick top 2 unique names
        sorted_influence = sorted(local_influence.items(), key=lambda x: x[1], reverse=True)
        
        for feature, _ in sorted_influence:
            if len(explanations) >= 2:
                break
                
            val = full_features[feature]
            mean = self.dataset_means.get(feature, val)
            is_inverse = feature in ['growth_variance', 'growth_engagement_ratio', 'fake_follower_ratio']
            
            if feature == 'engagement_rate':
                display_name = "Engagement rate"
            elif feature in ['comment_uniqueness_ratio', 'engagement_uniqueness', 'comment_uniqueness']:
                display_name = "Audience authenticity"
            elif feature in ['growth_variance', 'growth_engagement_ratio', 'follower_growth_std']:
                display_name = "Growth pattern"
            elif feature == 'like_to_comment_ratio':
                display_name = "Interaction depth"
            else:
                display_name = feature.replace('_', ' ').capitalize()
            
            if display_name in seen_names:
                continue
            seen_names.add(display_name)
            
            if val > mean * 1.1:
                context = "higher than average"
                impact = "negatively" if is_inverse else "positively"
            elif val < mean * 0.9:
                context = "lower than average"
                impact = "positively" if is_inverse else "negatively"
            else:
                context = "consistent with benchmarks"
                impact = "positively"
            
            explanations.append(f"{display_name} is {context}, {impact} influencing the score.")
            
        return explanations

# Singleton Singleton instance instance instance instance instance instance instance instance
service = None

def get_service():
    global service
    if service is None:
        service = AuthenticityModelService()
    return service
