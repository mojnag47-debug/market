use reqwest;
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create a reqwest::Client
    let client = reqwest::Client::new();

    println!("Making HTTP requests with reqwest::Client...");

    // Example 1: Simple GET request
    println!("\n1. Simple GET request:");
    let response = client
        .get("https://httpbin.org/get")
        .send()
        .await?;
    
    println!("Status: {}", response.status());
    let body = response.text().await?;
    println!("Response: {}", &body[..200.min(body.len())]); // Show first 200 chars

    // Example 2: GET request with query parameters
    println!("\n2. GET request with query parameters:");
    let response = client
        .get("https://httpbin.org/get")
        .query(&[("key1", "value1"), ("key2", "value2")])
        .send()
        .await?;
    
    println!("Status: {}", response.status());
    let json: serde_json::Value = response.json().await?;
    println!("Query args: {}", json["args"]);

    // Example 3: POST request with JSON
    println!("\n3. POST request with JSON:");
    let mut json_data = HashMap::new();
    json_data.insert("name", "Rust Developer");
    json_data.insert("language", "Rust");
    
    let response = client
        .post("https://httpbin.org/post")
        .json(&json_data)
        .send()
        .await?;
    
    println!("Status: {}", response.status());
    let response_json: serde_json::Value = response.json().await?;
    println!("Posted data: {}", response_json["json"]);

    // Example 4: Custom headers
    println!("\n4. Request with custom headers:");
    let response = client
        .get("https://httpbin.org/headers")
        .header("User-Agent", "Rust-reqwest-example/1.0")
        .header("X-Custom-Header", "Hello from Rust!")
        .send()
        .await?;
    
    println!("Status: {}", response.status());
    let headers_response: serde_json::Value = response.json().await?;
    println!("Custom headers: {}", headers_response["headers"]);

    println!("\nAll requests completed successfully!");
    Ok(())
}
