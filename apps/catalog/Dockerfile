# Build stage
FROM rust:1.75 AS builder

WORKDIR /app

# Copy Cargo files
COPY apps/catalog/Cargo.toml ./
COPY apps/catalog/Cargo.lock* ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies
RUN cargo build --release
RUN rm src/main.rs

# Copy source code
COPY apps/catalog/src ./src

# Build application
RUN touch src/main.rs && cargo build --release

# Runtime stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user and set permissions
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && mkdir -p /app \
    && chown -R appuser:appuser /app \
    && rm -rf /var/lib/apt/lists/*

USER appuser

# Copy the binary
COPY --from=builder --chown=appuser:appuser /app/target/release/catalog-service ./catalog-service

# Create non-root user
RUN groupadd -r catalog && useradd -r -g catalog catalog
USER catalog

EXPOSE 3002

CMD ["./catalog-service"]