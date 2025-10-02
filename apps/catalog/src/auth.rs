use std::env;

use axum::{
    async_trait,
    extract::{FromRequestParts, Request},
    http::request::Parts,
    RequestExt,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub email: String,
    pub role: String,
    pub exp: usize,
}

#[derive(Debug)]
pub struct AuthUser {
    pub id: String,
    pub email: String,
    pub role: String,
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Extract Authorization header
        let auth_header = parts
            .headers
            .get("authorization")
            .and_then(|header| header.to_str().ok())
            .ok_or_else(|| AppError::Unauthorized("Missing authorization header".to_string()))?;

        // Check if it starts with "Bearer "
        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or_else(|| AppError::Unauthorized("Invalid authorization header format".to_string()))?;

        // Decode JWT token
        let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "your-secret-key".to_string());
        let decoding_key = DecodingKey::from_secret(jwt_secret.as_bytes());
        let validation = Validation::default();

        let token_data = decode::<Claims>(token, &decoding_key, &validation)
            .map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?;

        Ok(AuthUser {
            id: token_data.claims.sub,
            email: token_data.claims.email,
            role: token_data.claims.role,
        })
    }
}