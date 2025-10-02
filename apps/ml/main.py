from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from datetime import datetime
import numpy as np

app = FastAPI(title="NextGen ML Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str
    version: str

class RecommendationRequest(BaseModel):
    user_id: str
    limit: Optional[int] = 10
    categories: Optional[List[str]] = None

class Product(BaseModel):
    id: str
    name: str
    category: str
    price: float
    score: float

class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: List[Product]
    model_version: str
    timestamp: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow().isoformat(),
        service="ml",
        version="1.0.0"
    )

@app.post("/v1/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    # Mock recommendation logic
    mock_products = [
        Product(
            id="1",
            name="فرش دستباف کاشان",
            category="خانه و آشپزخانه",
            price=5000000.0,
            score=0.95
        ),
        Product(
            id="2",
            name="گوشی هوشمند",
            category="موبایل و تبلت",
            price=15000000.0,
            score=0.88
        )
    ]
    
    return RecommendationResponse(
        user_id=request.user_id,
        recommendations=mock_products[:request.limit],
        model_version="1.0.0",
        timestamp=datetime.utcnow().isoformat()
    )

@app.get("/v1/predict")
async def predict():
    """Generic prediction endpoint"""
    return {"prediction": "mock_result", "confidence": 0.85}

if __name__ == "__main__":
    port = int(os.getenv("PORT", "3003"))
    uvicorn.run(app, host="0.0.0.0", port=port)