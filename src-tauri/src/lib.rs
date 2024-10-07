// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    any::Any,
    collections::HashMap,
    time::{Instant, SystemTime},
};

use chrono::{DateTime, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tokio_postgres::{
    types::{FromSql, Timestamp, ToSql, Type},
    Error, NoTls,
};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> HashMap<String, String> {
    format!("Hello, {}! You've been greeted from Rust!", name);
    let mut map: HashMap<String, String> = HashMap::new();
    map.insert("name".to_string(), "John".to_string());
    map.insert("age".to_string(), "20".to_string());
    return map;
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
enum SqlValue {
    String(Option<String>),
    Int(Option<i32>),
    Float32(Option<f32>),
    Float64(Option<f64>),
    Bool(Option<bool>),
    Timestamp(Option<NaiveDateTime>),
    Null,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ColInfo {
    name: String,
    col_type: String,
    order_idx: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ExecuteQueryResult {
    columns: Vec<ColInfo>,
    rows: Vec<HashMap<String, SqlValue>>,
}

#[tauri::command]
async fn pg_execute_query(
    host: String,
    port: u16,
    username: String,
    password: String,
    database: String,
    query: String,
    params: Vec<SqlValue>,
) -> Result<ExecuteQueryResult, String> {
    let connection_string = format!(
        "postgres://{}:{}@{}:{}/{}",
        username, password, host, port, database
    );

    // Connect to the database.
    let (client, connection) = tokio_postgres::connect(&connection_string, NoTls)
        .await
        .map_err(|e| e.to_string())?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    let params: Vec<&(dyn ToSql + Sync)> = params
        .iter()
        .map(|p| match p {
            SqlValue::String(s) => s as &(dyn ToSql + Sync),

            SqlValue::Int(i) => i as &(dyn ToSql + Sync),
            SqlValue::Float32(f) => f as &(dyn ToSql + Sync),
            SqlValue::Float64(f) => f as &(dyn ToSql + Sync),
            SqlValue::Bool(b) => b as &(dyn ToSql + Sync),
            SqlValue::Timestamp(t) => t as &(dyn ToSql + Sync),

            SqlValue::Null => &"",
        })
        .collect();

    // Execute the query and fetch the results.
    let rows = client
        .query(&query, &params)
        .await
        .map_err(|e| e.to_string())?;

    let mut result: ExecuteQueryResult = ExecuteQueryResult {
        columns: Vec::new(),
        rows: Vec::new(),
    };

    if rows.is_empty() {
        return Ok(result);
    }

    for (i, column) in rows[0].columns().iter().enumerate() {
        result.columns.push(ColInfo {
            name: column.name().to_string(),
            col_type: column.type_().name().to_string(),
            order_idx: i as i32,
        });
    }

    for row in rows {
        let mut row_map: HashMap<String, SqlValue> = HashMap::new();
        for (i, column) in row.columns().iter().enumerate() {
            let value = match column.type_() {
                &Type::VARCHAR => SqlValue::String(row.get::<_, Option<String>>(i)),
                // &Type::TIMESTAMP => SqlValue::String(row.get::<_, Option<String>>(i)),
                &Type::TEXT => SqlValue::String(row.get::<_, Option<String>>(i)),
                &Type::NAME => SqlValue::String(row.get::<_, Option<String>>(i)),
                &Type::INT4 => SqlValue::Int(row.get::<_, Option<i32>>(i)),
                &Type::BOOL => SqlValue::Bool(row.get::<_, Option<bool>>(i)),
                &Type::FLOAT4 => SqlValue::Float32(row.get::<_, Option<f32>>(i)),
                &Type::FLOAT8 => SqlValue::Float64(row.get::<_, Option<f64>>(i)),
                &Type::TIMESTAMP => SqlValue::Timestamp(row.get::<_, Option<NaiveDateTime>>(i)),

                _ => {
                    println!(">>> Unknown type: {:?}", column.type_());
                    SqlValue::Null
                }
            };

            println!("{:?} {:?}", column.name(), value);
            row_map.insert(column.name().to_string(), value);
        }
        result.rows.push(row_map);
    }

    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![pg_execute_query, greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
