from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from model_service import get_service, AuthenticityModelService
import uvicorn
import time
import logging

# 1. Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CreatorTrust ML Scoring API - Refined")

# 2. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Request/Response Models
class CreatorInput(BaseModel):
    followers: int = Field(..., gt=0)
    avg_likes: int = Field(..., ge=0)
    avg_comments: int = Field(..., ge=0)
    follower_growth_std: float = Field(..., ge=0)
    comment_uniqueness_ratio: float = Field(..., ge=0.0, le=1.0)
    fake_follower_ratio: float = Field(0.0, ge=0.0, le=1.0)

class PredictResponse(BaseModel):
    score: float
    confidence: float
    risk_level: str
    verdict: str
    processed_features: dict
    explanation: list[str]
    insights: list[str]
    latency_ms: float

# 4. State
model_service: AuthenticityModelService = None

@app.on_event("startup")
async def startup_event():
    global model_service
    logger.info("Initializing refined ML Engine...")
    model_service = get_service()

@app.get("/health")
async def health():
    return {"status": "healthy", "engine": "RandomForestRegressor-v2", "timestamp": time.time()}

@app.post("/predict", response_model=PredictResponse)
async def predict(data: CreatorInput):
    start_time = time.time()
    try:
        if model_service is None:
            raise HTTPException(status_code=503, detail="Model Loading Error")
            
        # Inference
        result = model_service.predict(data.dict())
        
        # Performance metadata
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
        
        return result
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "CreatorTrust Authenticity Scoring API - Refined Edition",
        "accuracy_target": "R2 >= 0.85",
        "vervion": "2.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
