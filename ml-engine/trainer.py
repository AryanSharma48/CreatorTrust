import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
from data_generator import generate_synthetic_data

def engineer_features(df: pd.DataFrame):
    """
    Apply engineering and interaction features consistently.
    """
    # 1. Base Features
    df['engagement_rate'] = (df['avg_likes'] + df['avg_comments']) / (df['followers'] + 1)
    df['like_to_comment_ratio'] = df['avg_likes'] / (df['avg_comments'] + 1)
    df['growth_variance'] = df['follower_growth_std']
    
    # 2. Interaction Features
    df['engagement_uniqueness'] = df['engagement_rate'] * df['comment_uniqueness_ratio']
    df['growth_engagement_ratio'] = df['follower_growth_std'] / (df['engagement_rate'] + 0.001)
    
    # Select feature set for model
    # Ordered list is critical for the scaler
    features = [
        'followers', 'avg_likes', 'avg_comments', 'engagement_rate', 
        'like_to_comment_ratio', 'growth_variance', 'comment_uniqueness_ratio',
        'engagement_uniqueness', 'growth_engagement_ratio'
    ]
    
    return df[features]

def train_model(seed=42):
    # 1. Load/Generate Data
    print("Loading/Generating refined data...")
    df = generate_synthetic_data(num_samples=2500, seed=seed)
    
    # 2. Features and Target
    X = engineer_features(df)
    y = df['authenticity_score']
    
    # 3. Train-Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=seed)
    
    # 4. Feature Scaling (All features included)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Store list of features for consistent inference
    feature_names = list(X.columns)
    
    # 5. Model: RandomForestRegressor (Tuned)
    print("Training Tuned RandomForestRegressor...")
    model = RandomForestRegressor(
        n_estimators=200, 
        max_depth=10, 
        min_samples_split=5,
        random_state=seed, 
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)
    
    # 6. Evaluation
    y_pred = model.predict(X_test_scaled)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"--- Refined Model Performance ---")
    print(f"MAE: {mae:.4f}")
    print(f"R2 Score: {r2:.4f}")
    
    # 7. Model Persistence
    print("Saving model and scaler...")
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/authenticity_rf_model.pkl")
    joblib.dump(scaler, "models/feature_scaler.pkl")
    joblib.dump(feature_names, "models/feature_names.pkl")
    
    # 8. Store dataset means for explanation layer
    dataset_means = X.mean().to_dict()
    joblib.dump(dataset_means, "models/dataset_means.pkl")
    
    return model, scaler

if __name__ == "__main__":
    train_model()
