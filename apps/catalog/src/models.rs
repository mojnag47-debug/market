use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Product {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: String,
    pub price: f64,
    pub compare_price: Option<f64>,
    pub stock: i32,
    pub sku: Option<String>,
    pub barcode: Option<String>,
    pub image_urls: Vec<String>,
    pub is_active: bool,
    pub is_featured: bool,
    pub category_id: String,
    pub seller_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateProductRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    
    #[validate(length(min = 1))]
    pub description: String,
    
    #[validate(range(min = 0.0))]
    pub price: f64,
    
    pub compare_price: Option<f64>,
    
    #[validate(range(min = 0))]
    pub stock: i32,
    
    pub sku: Option<String>,
    pub barcode: Option<String>,
    pub image_urls: Option<Vec<String>>,
    pub is_featured: Option<bool>,
    
    pub category_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductResponse {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: String,
    pub price: f64,
    pub compare_price: Option<f64>,
    pub stock: i32,
    pub sku: Option<String>,
    pub barcode: Option<String>,
    pub image_urls: Vec<String>,
    pub is_active: bool,
    pub is_featured: bool,
    pub category_id: String,
    pub seller_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Product> for ProductResponse {
    fn from(product: Product) -> Self {
        Self {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            compare_price: product.compare_price,
            stock: product.stock,
            sku: product.sku,
            barcode: product.barcode,
            image_urls: product.image_urls,
            is_active: product.is_active,
            is_featured: product.is_featured,
            category_id: product.category_id,
            seller_id: product.seller_id,
            created_at: product.created_at,
            updated_at: product.updated_at,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchQuery {
    pub q: Option<String>,
    pub category: Option<String>,
    pub min_price: Option<f64>,
    pub max_price: Option<f64>,
    pub in_stock: Option<bool>,
    pub featured: Option<bool>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResponse {
    pub products: Vec<ProductResponse>,
    pub total: i64,
    pub limit: i64,
    pub offset: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub service: String,
    pub version: String,
    pub timestamp: DateTime<Utc>,
}