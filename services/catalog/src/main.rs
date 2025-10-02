use axum::{
    extract::Path,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tower_http::cors::CorsLayer;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
struct Product {
    id: Uuid,
    name: String,
    description: String,
    price: f64,
    category: String,
    stock: i32,
    created_at: String,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    timestamp: String,
    service: String,
    version: String,
}

#[tokio::main]
async fn main() {
    env_logger::init();
    dotenv::dotenv().ok();

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/v1/products", get(get_products))
        .route("/api/v1/products/:id", get(get_product))
        .layer(CorsLayer::permissive());

    let port = std::env::var("PORT").unwrap_or_else(|_| "3002".to_string());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port))
        .await
        .unwrap();
    
    println!("🚀 Catalog service running on http://localhost:{}", port);
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
        service: "catalog".to_string(),
        version: "0.1.0".to_string(),
    })
}

async fn get_products() -> Json<Vec<Product>> {
    // Mock data for now
    let products = vec![
        Product {
            id: Uuid::new_v4(),
            name: "فرش دستباف کاشان".to_string(),
            description: "فرش دستباف اصیل کاشان با نقش سنتی".to_string(),
            price: 5000000.0,
            category: "خانه و آشپزخانه".to_string(),
            stock: 5,
            created_at: chrono::Utc::now().to_rfc3339(),
        },
    ];
    
    Json(products)
}

async fn get_product(Path(id): Path<Uuid>) -> Result<Json<Product>, StatusCode> {
    // Mock product lookup
    let product = Product {
        id,
        name: "محصول نمونه".to_string(),
        description: "توضیحات محصول".to_string(),
        price: 100000.0,
        category: "دسته بندی".to_string(),
        stock: 10,
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    Ok(Json(product))
}