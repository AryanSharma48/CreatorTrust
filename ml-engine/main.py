from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from model_service import get_service, AuthenticityModelService
import uvicorn
import time
import logging
from contextlib import asynccontextmanager

# 1. Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 2. State & Lifespan
model_service: AuthenticityModelService = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model_service
    logger.info("Initializing Finalized ML Engine Response Layer...")
    model_service = get_service()
    yield
    logger.info("Shutting down ML Engine...")

app = FastAPI(
    title="CreatorTrust ML Scoring API - Final Locked Response",
    lifespan=lifespan
)

# 3. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Models
class CreatorInput(BaseModel):
    followers: int = Field(..., gt=0)
    avg_likes: int = Field(..., ge=0)
    avg_comments: int = Field(..., ge=0)
    follower_growth_std: float = Field(..., ge=0)
    comment_uniqueness_ratio: float = Field(..., ge=0.0, le=1.0)
    fake_follower_ratio: float = Field(0.0, ge=0.0, le=1.0)

class PredictResponse(BaseModel):
    score: float
    score_label: str
    confidence: float
    confidence_label: str
    risk_level: str
    verdict: str
    key_takeaway: str
    suitability_insight: str
    raw_features: dict
    processed_features: dict
    explanation: list[str]
    top_factors: list[str]
    latency_ms: float

@app.get("/health")
async def health():
    return {"status": "healthy", "engine": "Refined-RF-v5-Final", "timestamp": time.time()}

@app.post("/predict", response_model=PredictResponse)
async def predict(data: CreatorInput):
    start_time = time.time()
    try:
        if model_service is None:
            raise HTTPException(status_code=503, detail="Model Loading Error")
            
        result = model_service.predict(data.dict())
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
        
        return result
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "CreatorTrust ML Scoring API - Final Polished Output",
        "version": "5.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
