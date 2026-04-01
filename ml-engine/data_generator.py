import pandas as pd
import numpy as np

def generate_synthetic_data(num_samples=10000, seed=42):
    np.random.seed(seed)
    
    # 1. Base Features
    followers = np.random.randint(1000, 1000000, size=num_samples)
    
    # 2. Simulated Engagement
    # Base ER is tuned to have a wider spread in the 2-8% range
    base_er = np.random.uniform(0.01, 0.09, size=num_samples) / (np.log10(followers) / 2)
    
    avg_likes = (followers * base_er * np.random.uniform(0.9, 1.1, size=num_samples)).astype(int)
    avg_comments = (avg_likes * np.random.uniform(0.015, 0.045, size=num_samples)).astype(int)
    
    # 3. Authenticity Markers
    follower_growth_std = np.random.uniform(50, 4500, size=num_samples) 
    comment_uniqueness_ratio = np.random.uniform(0.1, 0.95, size=num_samples)
    fake_follower_ratio = np.random.uniform(0.0, 0.45, size=num_samples)
    
    # 4. Feature Engineering
    engagement_rate = (avg_likes + avg_comments) / (followers + 1)
    
    # 5. Target Variable Refinement (Correcting distribution)
    # Higher quality creators should naturally get scores > 75.
    
    # Normalization (0-1)
    norm_er = np.clip((engagement_rate - 0.005) / (0.10 - 0.005), 0, 1) 
    norm_uniq = np.clip((comment_uniqueness_ratio - 0.1) / (0.95 - 0.15), 0, 1)
    norm_vol = np.clip(1 - (follower_growth_std / 4000), 0, 1)
    norm_fake = np.clip(1 - (fake_follower_ratio / 0.40), 0, 1)
    
    # REFINE WEIGHTS: 45% engagement, 35% uniqueness, 10% low growth, 10% low fake
    score = (norm_er * 45) + (norm_uniq * 35) + (norm_vol * 10) + (norm_fake * 10)
    
    # Controlled Gaussian noise
    noise = np.random.normal(0, 0.2, size=num_samples)
    final_score = np.clip(score + noise, 0, 100)
    
    df = pd.DataFrame({
        'followers': followers,
        'avg_likes': avg_likes,
        'avg_comments': avg_comments,
        'follower_growth_std': follower_growth_std,
        'comment_uniqueness_ratio': comment_uniqueness_ratio,
        'fake_follower_ratio': fake_follower_ratio,
        'authenticity_score': final_score
    })
    
    return df

if __name__ == "__main__":
    print("Generating REFINED synthetic dataset (Engagement 45%, Uniqueness 35%)...")
    df = generate_synthetic_data()
    df.to_csv("refined_creator_data_v2.csv", index=False)
    print(f"Dataset generated with {len(df)} samples.")
    print(f"Score Range: {df['authenticity_score'].min():.2f} - {df['authenticity_score'].max():.2f}")
    print(f"Mean Score: {df['authenticity_score'].mean():.2f}")
    print(df.head())
