from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from model_service import get_service, AuthenticityModelService
from contract_service import (
    start_contract, verify_contract, release_payment, get_contract_status, reset_contract,
    StartContractInput, VerifyContractInput, ContractStateResponse
)
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

# 3. CORS - Allow Vercel deployment and localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",  # All Vercel preview deployments
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Regex for all Vercel subdomains
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
    logger.info(f"PREDICT REQUEST: {data.dict()}")
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

# ============ CONTRACT ENDPOINTS ============

@app.post("/contract/start", response_model=ContractStateResponse)
async def contract_start(data: StartContractInput):
    """Start a new campaign contract and lock funds"""
    logger.info(f"CONTRACT START: budget={data.budget}, threshold={data.engagement_threshold}")
    try:
        result = start_contract(data.budget, data.engagement_threshold)
        return result
    except Exception as e:
        logger.error(f"Contract start error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/contract/verify", response_model=ContractStateResponse)
async def contract_verify(data: VerifyContractInput):
    """Verify contract conditions based on ML score and engagement"""
    logger.info(f"CONTRACT VERIFY: score={data.score}, engagement={data.engagement}")
    try:
        result = verify_contract(data.score, data.engagement)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Contract verify error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/contract/release", response_model=ContractStateResponse)
async def contract_release():
    """Release payment if conditions are met"""
    logger.info("CONTRACT RELEASE requested")
    try:
        result = release_payment()
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Contract release error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/contract/status", response_model=ContractStateResponse)
async def contract_status():
    """Get current contract state"""
    return get_contract_status()


@app.post("/contract/reset", response_model=ContractStateResponse)
async def contract_reset():
    """Reset contract to initial state"""
    logger.info("CONTRACT RESET")
    return reset_contract()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
