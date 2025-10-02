use axum::{extract::State, Json};
use chrono::Utc;

use crate::{models::HealthResponse, AppState};

pub async fn health_check(State(_state): State<AppState>) -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        service: "catalog".to_string(),
        version: "1.0.0".to_string(),
        timestamp: Utc::now(),
    })
}