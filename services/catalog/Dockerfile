FROM rust:1.75 AS builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm src/main.rs

# Copy source code
COPY src ./src

# Build the actual binary
RUN touch src/main.rs
RUN cargo build --release

FROM debian:bookworm-slim AS runtime

# Install necessary runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the built binary
COPY --from=builder /app/target/release/catalog-service /usr/local/bin/catalog-service

# Create a non-root user
RUN useradd -m -u 1000 appuser
USER appuser

EXPOSE 3002

CMD ["catalog-service"]