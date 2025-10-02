mod handlers;
mod models;
mod database;
mod auth;
mod error;

use std::env;
use std::net::SocketAddr;

use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::database::Database;
use crate::handlers::{health, products};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenv::dotenv().ok();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "catalog_service=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize database
    let database = Database::new().await?;
    
    // Run migrations
    database.migrate().await?;

    // Create app state
    let app_state = AppState {
        db: database,
    };

    // Build our application with routes
    let app = Router::new()
        // Health check
        .route("/health", get(health::health_check))
        
        // Product routes
        .route("/catalog", post(products::create_product))
        .route("/catalog/:id", get(products::get_product))
        .route("/catalog/search", get(products::search_products))
        .route("/catalog", get(products::list_products))
        
        // Add CORS
        .layer(CorsLayer::permissive())
        
        // Add tracing
        .layer(TraceLayer::new_for_http())
        
        // Add state
        .with_state(app_state);

    // Get port from environment or default to 3002
    let port = env::var("PORT").unwrap_or_else(|_| "3002".to_string());
    let addr = format!("0.0.0.0:{}", port)
        .parse::<SocketAddr>()
        .expect("Invalid address");

    tracing::info!("🚀 Catalog service listening on {}", addr);

    // Run the server
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

#[derive(Clone)]
pub struct AppState {
    pub db: Database,
}