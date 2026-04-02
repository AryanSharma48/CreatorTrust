"""
Mock Blockchain Contract Service
Simulates smart contract lifecycle: start → lock funds → verify → release payment
"""
import random
import time
from pydantic import BaseModel, Field

# Global contract state (in-memory simulation)
contract_state = {
    "funds_locked": False,
    "condition_met": False,
    "status": "Not Started",
    "budget": 0,
    "engagement_threshold": 0,
    "transaction_hash": None,
    "created_at": None,
    "verified_at": None,
    "released_at": None
}


def generate_tx_hash() -> str:
    """Generate a fake blockchain transaction hash"""
    return "0x" + ''.join(random.choices('ABCDEF0123456789', k=64))


def reset_contract():
    """Reset contract to initial state"""
    global contract_state
    contract_state = {
        "funds_locked": False,
        "condition_met": False,
        "status": "Not Started",
        "budget": 0,
        "engagement_threshold": 0,
        "transaction_hash": None,
        "created_at": None,
        "verified_at": None,
        "released_at": None
    }
    return contract_state


def start_contract(budget: float, engagement_threshold: float) -> dict:
    """Start a new campaign contract and lock funds"""
    global contract_state
    contract_state["funds_locked"] = True
    contract_state["condition_met"] = False
    contract_state["status"] = "Funds Locked"
    contract_state["budget"] = budget
    contract_state["engagement_threshold"] = engagement_threshold
    contract_state["transaction_hash"] = generate_tx_hash()
    contract_state["created_at"] = time.time()
    contract_state["verified_at"] = None
    contract_state["released_at"] = None
    return contract_state.copy()


def verify_contract(score: float, engagement: float) -> dict:
    """Verify if contract conditions are met based on ML score and engagement"""
    global contract_state
    
    if not contract_state["funds_locked"]:
        raise ValueError("No active contract. Start a campaign first.")
    
    if score >= 70 and engagement >= contract_state["engagement_threshold"]:
        contract_state["condition_met"] = True
        contract_state["status"] = "Ready for Release"
    else:
        contract_state["condition_met"] = False
        contract_state["status"] = "Conditions Not Met"
    
    contract_state["verified_at"] = time.time()
    return contract_state.copy()


def release_payment() -> dict:
    """Release payment if conditions are met"""
    global contract_state
    
    if not contract_state["funds_locked"]:
        raise ValueError("No funds are locked.")
    
    if not contract_state["condition_met"]:
        raise ValueError("Conditions not met. Cannot release payment.")
    
    contract_state["funds_locked"] = False
    contract_state["status"] = "Payment Released"
    contract_state["released_at"] = time.time()
    return contract_state.copy()


def get_contract_status() -> dict:
    """Get current contract state"""
    return contract_state.copy()


# Pydantic models for API validation
class StartContractInput(BaseModel):
    budget: float = Field(..., gt=0, description="Campaign budget in INR")
    engagement_threshold: float = Field(..., ge=0, description="Minimum engagement threshold")


class VerifyContractInput(BaseModel):
    score: float = Field(..., ge=0, le=100, description="ML authenticity score")
    engagement: float = Field(..., ge=0, description="Actual/expected engagement")


class ContractStateResponse(BaseModel):
    funds_locked: bool
    condition_met: bool
    status: str
    budget: float
    engagement_threshold: float
    transaction_hash: str | None
    created_at: float | None
    verified_at: float | None
    released_at: float | None
