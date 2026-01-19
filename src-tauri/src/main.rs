// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::process::Command;
use std::collections::HashMap;
use once_cell::sync::Lazy;

// Database structures
#[derive(Debug, Deserialize, Clone)]
struct PackageDatabase {
    groups: Vec<PackageGroup>,
}

#[derive(Debug, Deserialize, Clone)]
struct PackageGroup {
    group: String,
    vendor: String,
    packages: Vec<PackageInfo>,
}

#[derive(Debug, Deserialize, Clone)]
struct PackageInfo {
    package_name: String,
    app_name: String,
    description: String,
    safe_to_remove: bool,
    risk_level: String,
    battery_impact: String,
    ram_impact: String,
    reversible: bool,
    notes: String,
}

// Load database at startup
static PACKAGE_DB: Lazy<HashMap<String, (PackageInfo, String)>> = Lazy::new(|| {
    let json_str = include_str!("android_package_database.json");
    let db: PackageDatabase = serde_json::from_str(json_str).unwrap_or(PackageDatabase { groups: vec![] });
    
    let mut map = HashMap::new();
    for group in db.groups {
        let vendor = group.vendor.clone();
        for package in group.packages {
            map.insert(package.package_name.clone(), (package, vendor.clone()));
        }
    }
    map
});

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Device {
    id: String,
    model: String,
    manufacturer: String,
    android_version: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct AppPackage {
    package_name: String,
    label: String,
    is_system_app: bool,
    is_enabled: bool,
    category: Option<String>,
    description: Option<String>,
    safety_level: Option<String>,
    // New fields from database
    safe_to_remove: Option<bool>,
    risk_level: Option<String>,
    battery_impact: Option<String>,
    ram_impact: Option<String>,
    reversible: Option<bool>,
    notes: Option<String>,
    group: Option<String>,
}

// Check if ADB is available
#[tauri::command]
fn check_adb() -> Result<bool, String> {
    let output = Command::new("adb")
        .arg("version")
        .output()
        .map_err(|e| format!("ADB not found. Please install Android Platform Tools: {}", e))?;

    Ok(output.status.success())
}

// Get connected devices
#[tauri::command]
async fn get_devices() -> Result<Vec<Device>, String> {
    println!("[DEBUG] Starting get_devices...");
    
    let output = Command::new("adb")
        .args(&["devices", "-l"])
        .output()
        .map_err(|e| format!("Failed to execute adb: {}", e))?;

    if !output.status.success() {
        println!("[DEBUG] ADB command failed");
        return Err("ADB command failed".to_string());
    }

    let output_str = String::from_utf8_lossy(&output.stdout);
    println!("[DEBUG] ADB output:\n{}", output_str);
    
    let mut devices = Vec::new();

    for line in output_str.lines().skip(1) {
        println!("[DEBUG] Processing line: {}", line);
        
        if line.trim().is_empty() || !line.contains("device") {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }

        let device_id = parts[0].to_string();
        println!("[DEBUG] Found device: {}", device_id);

        // Get device properties
        let model = get_device_property(&device_id, "ro.product.model")
            .unwrap_or_else(|_| "Unknown".to_string());
        let manufacturer = get_device_property(&device_id, "ro.product.manufacturer")
            .unwrap_or_else(|_| "Unknown".to_string());
        let android_version = get_device_property(&device_id, "ro.build.version.release")
            .unwrap_or_else(|_| "Unknown".to_string());

        println!("[DEBUG] Device info - Model: {}, Manufacturer: {}, Android: {}", 
                 model, manufacturer, android_version);

        devices.push(Device {
            id: device_id,
            model,
            manufacturer,
            android_version,
        });
    }

    println!("[DEBUG] Total devices found: {}", devices.len());
    Ok(devices)
}

// Get device property via ADB
fn get_device_property(device_id: &str, property: &str) -> Result<String, String> {
    let output = Command::new("adb")
        .args(&["-s", device_id, "shell", "getprop", property])
        .output()
        .map_err(|e| format!("Failed to get property: {}", e))?;

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

// List all packages on device
#[tauri::command]
async fn list_packages(device_id: String) -> Result<Vec<AppPackage>, String> {
    println!("[DEBUG] Starting list_packages for device: {}", device_id);
    
    // Get all packages
    let output = Command::new("adb")
        .args(&["-s", &device_id, "shell", "pm", "list", "packages", "-f"])
        .output()
        .map_err(|e| format!("Failed to list packages: {}", e))?;

    if !output.status.success() {
        println!("[DEBUG] pm list packages command failed");
        return Err("Failed to list packages".to_string());
    }

    let output_str = String::from_utf8_lossy(&output.stdout);
    println!("[DEBUG] Got {} bytes of output", output_str.len());
    
    // Get disabled packages list once
    println!("[DEBUG] Getting disabled packages list...");
    let disabled_output = Command::new("adb")
        .args(&["-s", &device_id, "shell", "pm", "list", "packages", "-d"])
        .output()
        .map_err(|e| format!("Failed to get disabled packages: {}", e))?;
    
    let disabled_packages = String::from_utf8_lossy(&disabled_output.stdout);
    println!("[DEBUG] Got {} disabled packages", disabled_packages.lines().count());
    
    let mut packages = Vec::new();
    let mut line_count = 0;

    for line in output_str.lines() {
        line_count += 1;
        
        if let Some(package_info) = line.strip_prefix("package:") {
            let parts: Vec<&str> = package_info.split('=').collect();
            if parts.len() != 2 {
                continue;
            }
            
            let path = parts[0];
            let package_name = parts[1].trim().to_string();

            if package_name.is_empty() {
                continue;
            }

            if packages.len() < 5 {
                println!("[DEBUG] Processing package {}: {}", packages.len() + 1, package_name);
            }

            // Get app label (simplified - just use last part of package name)
            let parts: Vec<&str> = package_name.split('.').collect();
            let mut label = parts.last().map(|s| *s).unwrap_or(&package_name).to_string();

            // Check if system app based on path
            let is_system_app = path.contains("/system/") || path.contains("/vendor/") || path.contains("/product/");

            // Check if enabled (package is enabled if NOT in disabled list)
            let is_enabled = !disabled_packages.contains(&package_name);

            // Get info from database
            let (category, description, safety_level, safe_to_remove, risk_level, battery_impact, ram_impact, reversible, notes, group) = 
                if let Some((db_info, vendor)) = PACKAGE_DB.get(&package_name) {
                    // Use app name from database if available
                    label = db_info.app_name.clone();
                    (
                        Some(vendor.clone()),
                        Some(db_info.description.clone()),
                        Some(map_risk_to_safety(&db_info.risk_level)),
                        Some(db_info.safe_to_remove),
                        Some(db_info.risk_level.clone()),
                        Some(db_info.battery_impact.clone()),
                        Some(db_info.ram_impact.clone()),
                        Some(db_info.reversible),
                        Some(db_info.notes.clone()),
                        Some(get_group_from_package(&package_name)),
                    )
                } else {
                    get_bloatware_info(&package_name)
                };

            packages.push(AppPackage {
                package_name,
                label,
                is_system_app,
                is_enabled,
                category,
                description,
                safety_level,
                safe_to_remove,
                risk_level,
                battery_impact,
                ram_impact,
                reversible,
                notes,
                group,
            });
        }
    }

    println!("[DEBUG] Total lines processed: {}", line_count);
    println!("[DEBUG] Total packages found: {}", packages.len());

    // Sort by label
    packages.sort_by(|a, b| a.label.to_lowercase().cmp(&b.label.to_lowercase()));

    Ok(packages)
}

// Get app label
fn get_app_label(device_id: &str, package_name: &str) -> Result<String, String> {
    // Try to get the app label using dumpsys
    let output = Command::new("adb")
        .args(&[
            "-s",
            device_id,
            "shell",
            "dumpsys",
            "package",
            package_name,
        ])
        .output()
        .ok();

    if let Some(output) = output {
        let output_str = String::from_utf8_lossy(&output.stdout);
        
        // Try to find the label in the output
        for line in output_str.lines() {
            if line.contains("labelRes=") || line.contains("applicationInfo") {
                // This is basic - just return a cleaned package name for now
                break;
            }
        }
    }

    // Return a cleaned version of the package name
    let parts: Vec<&str> = package_name.split('.').collect();
    let last_part = parts.last().map(|s| *s).unwrap_or(package_name);
    Ok(last_part.to_string())
}

// Check if package is system app
fn is_system_package(device_id: &str, package_name: &str) -> bool {
    let output = Command::new("adb")
        .args(&["-s", device_id, "shell", "pm", "path", package_name])
        .output();

    if let Ok(output) = output {
        let path = String::from_utf8_lossy(&output.stdout);
        path.contains("/system/") || path.contains("/vendor/")
    } else {
        false
    }
}

// Check if package is enabled
fn is_package_enabled(device_id: &str, package_name: &str) -> bool {
    let output = Command::new("adb")
        .args(&[
            "-s",
            device_id,
            "shell",
            "pm",
            "list",
            "packages",
            "-d",
        ])
        .output();

    if let Ok(output) = output {
        let disabled_packages = String::from_utf8_lossy(&output.stdout);
        !disabled_packages.contains(package_name)
    } else {
        true
    }
}

// Get bloatware info from database
fn get_bloatware_info(package_name: &str) -> (Option<String>, Option<String>, Option<String>, Option<bool>, Option<String>, Option<String>, Option<String>, Option<bool>, Option<String>, Option<String>) {
    // This will be loaded from JSON file later
    // For now, basic Xiaomi bloatware detection
    if package_name.contains("miui") {
        return (
            Some("MIUI".to_string()),
            Some("Xiaomi system app".to_string()),
            Some("caution".to_string()),
            Some(false),
            Some("MEDIUM".to_string()),
            Some("MEDIUM".to_string()),
            Some("MEDIUM".to_string()),
            Some(false),
            Some("System app".to_string()),
            Some("miui_core".to_string()),
        );
    } else if package_name.contains("xiaomi") {
        return (
            Some("Xiaomi".to_string()),
            Some("Xiaomi app".to_string()),
            Some("safe".to_string()),
            Some(true),
            Some("LOW".to_string()),
            Some("MEDIUM".to_string()),
            Some("MEDIUM".to_string()),
            Some(true),
            Some("Can be removed".to_string()),
            Some("xiaomi_apps".to_string()),
        );
    } else if package_name.contains("facebook") || package_name.contains("meta") {
        return (
            Some("Social".to_string()),
            Some("Facebook/Meta bloatware".to_string()),
            Some("safe".to_string()),
            Some(true),
            Some("LOW".to_string()),
            Some("HIGH".to_string()),
            Some("HIGH".to_string()),
            Some(true),
            Some("Safe to remove".to_string()),
            Some("third_party".to_string()),
        );
    }

    (None, None, None, None, None, None, None, None, None, None)
}

// Map risk level to safety level
fn map_risk_to_safety(risk_level: &str) -> String {
    match risk_level {
        "HIGH" => "unsafe".to_string(),
        "MEDIUM" => "caution".to_string(),
        "LOW" => "safe".to_string(),
        _ => "unknown".to_string(),
    }
}

// Get group from package name for database lookup
fn get_group_from_package(package_name: &str) -> String {
    if package_name.starts_with("com.google.android.gms") || package_name.starts_with("com.google.android.gsf") || package_name == "com.android.vending" {
        "google_core".to_string()
    } else if package_name.starts_with("com.google.android") {
        "google_app".to_string()
    } else if package_name.starts_with("com.miui") {
        if package_name.contains("analytics") || package_name.contains("msa") {
            "miui_ads".to_string()
        } else {
            "miui_core".to_string()
        }
    } else if package_name.starts_with("com.xiaomi") {
        "xiaomi_apps".to_string()
    } else if package_name.starts_with("com.facebook") || package_name.starts_with("com.netflix") {
        "third_party".to_string()
    } else {
        "other".to_string()
    }
}

// Uninstall packages (batch)
#[tauri::command]
async fn uninstall_packages(device_id: String, packages: Vec<String>) -> Result<String, String> {
    let mut results = Vec::new();

    for package in packages {
        let output = Command::new("adb")
            .args(&[
                "-s",
                &device_id,
                "shell",
                "pm",
                "uninstall",
                "-k",
                "--user",
                "0",
                &package,
            ])
            .output()
            .map_err(|e| format!("Failed to uninstall {}: {}", package, e))?;

        let result = String::from_utf8_lossy(&output.stdout);
        results.push(format!("{}: {}", package, result.trim()));
    }

    Ok(results.join("\n"))
}

// Disable packages (batch)
#[tauri::command]
async fn disable_packages(device_id: String, packages: Vec<String>) -> Result<String, String> {
    let mut results = Vec::new();

    for package in packages {
        let output = Command::new("adb")
            .args(&[
                "-s",
                &device_id,
                "shell",
                "pm",
                "disable-user",
                "--user",
                "0",
                &package,
            ])
            .output()
            .map_err(|e| format!("Failed to disable {}: {}", package, e))?;

        let result = String::from_utf8_lossy(&output.stdout);
        results.push(format!("{}: {}", package, result.trim()));
    }

    Ok(results.join("\n"))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            check_adb,
            get_devices,
            list_packages,
            uninstall_packages,
            disable_packages,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
