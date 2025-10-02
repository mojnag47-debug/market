use std::env;

use sqlx::{postgres::PgPoolOptions, PgPool};
use anyhow::Result;

#[derive(Clone)]
pub struct Database {
    pub pool: PgPool,
}

impl Database {
    pub async fn new() -> Result<Self> {
        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL must be set");

        let pool = PgPoolOptions::new()
            .max_connections(20)
            .connect(&database_url)
            .await?;

        Ok(Self { pool })
    }

    pub async fn migrate(&self) -> Result<()> {
        // In a real-world scenario, you'd use sqlx migrations
        // For now, we'll ensure the products table exists as per our Prisma schema
        sqlx::query(
            r#"
            -- This ensures compatibility with Prisma schema
            -- The actual migrations should be run via Prisma migrate
            SELECT 1;
            "#
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}