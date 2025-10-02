use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;
use chrono::Utc;
use validator::Validate;

use crate::{
    error::AppError,
    models::{CreateProductRequest, Product, ProductResponse, SearchQuery, SearchResponse},
    AppState,
};

// Create a new product
pub async fn create_product(
    State(state): State<AppState>,
    Json(payload): Json<CreateProductRequest>,
) -> Result<Json<ProductResponse>, AppError> {
    // Validate input
    payload.validate()?;

    // Generate ID and slug
    let id = Uuid::new_v4().to_string();
    let slug = generate_slug(&payload.name);
    let now = Utc::now();

    // TODO: Validate auth token and get seller_id from JWT
    let seller_id = None; // This should come from JWT token

    // Insert product into database
    let product = sqlx::query_as!(
        Product,
        r#"
        INSERT INTO products (
            id, name, slug, description, price, compare_price, stock, sku, barcode, 
            image_urls, is_active, is_featured, category_id, seller_id, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
        "#,
        id,
        payload.name,
        slug,
        payload.description,
        payload.price,
        payload.compare_price,
        payload.stock,
        payload.sku,
        payload.barcode,
        &payload.image_urls.unwrap_or_default(),
        true, // is_active
        payload.is_featured.unwrap_or(false),
        payload.category_id,
        seller_id,
        now,
        now
    )
    .fetch_one(&state.db.pool)
    .await?;

    Ok(Json(ProductResponse::from(product)))
}

// Get a single product by ID
pub async fn get_product(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ProductResponse>, AppError> {
    let product = sqlx::query_as!(
        Product,
        "SELECT * FROM products WHERE id = $1 AND is_active = true",
        id
    )
    .fetch_optional(&state.db.pool)
    .await?;

    match product {
        Some(product) => Ok(Json(ProductResponse::from(product))),
        None => Err(AppError::NotFound("Product not found".to_string())),
    }
}

// Search products with filters
pub async fn search_products(
    State(state): State<AppState>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<SearchResponse>, AppError> {
    let limit = query.limit.unwrap_or(20).min(100); // Max 100 items per page
    let offset = query.offset.unwrap_or(0);

    // Build dynamic query
    let mut sql = "SELECT * FROM products WHERE is_active = true".to_string();
    let mut params = Vec::new();
    let mut param_count = 1;

    // Add search filters
    if let Some(q) = &query.q {
        sql.push_str(&format!(" AND (name ILIKE ${} OR description ILIKE ${})", param_count, param_count + 1));
        let search_term = format!("%{}%", q);
        params.push(search_term.clone());
        params.push(search_term);
        param_count += 2;
    }

    if let Some(category) = &query.category {
        sql.push_str(&format!(" AND category_id = ${}", param_count));
        params.push(category.clone());
        param_count += 1;
    }

    if let Some(min_price) = query.min_price {
        sql.push_str(&format!(" AND price >= ${}", param_count));
        params.push(min_price.to_string());
        param_count += 1;
    }

    if let Some(max_price) = query.max_price {
        sql.push_str(&format!(" AND price <= ${}", param_count));
        params.push(max_price.to_string());
        param_count += 1;
    }

    if let Some(in_stock) = query.in_stock {
        if in_stock {
            sql.push_str(" AND stock > 0");
        }
    }

    if let Some(featured) = query.featured {
        sql.push_str(&format!(" AND is_featured = ${}", param_count));
        params.push(featured.to_string());
        param_count += 1;
    }

    // Add ordering and pagination
    sql.push_str(" ORDER BY created_at DESC");
    sql.push_str(&format!(" LIMIT ${} OFFSET ${}", param_count, param_count + 1));
    params.push(limit.to_string());
    params.push(offset.to_string());

    // Execute query - Note: This is simplified, in production you'd use a proper query builder
    let products: Vec<Product> = sqlx::query_as(&sql)
        .bind(&params.get(0).unwrap_or(&String::new()))
        .bind(&params.get(1).unwrap_or(&String::new()))
        .bind(&params.get(2).unwrap_or(&String::new()))
        .bind(&params.get(3).unwrap_or(&String::new()))
        .bind(&params.get(4).unwrap_or(&String::new()))
        .bind(&params.get(5).unwrap_or(&String::new()))
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db.pool)
        .await
        .unwrap_or_default();

    // Count total products (simplified)
    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM products WHERE is_active = true")
        .fetch_one(&state.db.pool)
        .await?;

    let response = SearchResponse {
        products: products.into_iter().map(ProductResponse::from).collect(),
        total,
        limit,
        offset,
    };

    Ok(Json(response))
}

// List all products (paginated)
pub async fn list_products(
    State(state): State<AppState>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<SearchResponse>, AppError> {
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.offset.unwrap_or(0);

    let products = sqlx::query_as!(
        Product,
        "SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        limit,
        offset
    )
    .fetch_all(&state.db.pool)
    .await?;

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM products WHERE is_active = true")
        .fetch_one(&state.db.pool)
        .await?;

    let response = SearchResponse {
        products: products.into_iter().map(ProductResponse::from).collect(),
        total,
        limit,
        offset,
    };

    Ok(Json(response))
}

// Helper function to generate URL-friendly slug from name
fn generate_slug(name: &str) -> String {
    name.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<&str>>()
        .join("-")
}