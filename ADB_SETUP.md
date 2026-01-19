# ADB Installation Guide

## What is ADB?

**Android Debug Bridge (ADB)** là công cụ command-line để giao tiếp với Android devices. App này cần ADB để list và remove bloatware.

---

## Windows Installation

### Option 1: Chocolatey (Khuyến nghị - dễ nhất)

```powershell
# Cài Chocolatey (nếu chưa có): https://chocolatey.org/install
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Cài ADB
choco install adb -y

# Verify
adb version
```

### Option 2: Manual Install (Google Official)

1. **Download**: https://developer.android.com/tools/releases/platform-tools
2. Giải nén vào `C:\platform-tools\`
3. **Add to PATH**:
   - Nhấn `Win + X` → **System** → **Advanced system settings**
   - **Environment Variables** → **System variables** → **Path** → **Edit**
   - **New** → Thêm: `C:\platform-tools\`
   - **OK** để lưu
4. **Restart PowerShell/CMD**
5. Test: `adb version`

### Option 3: Scoop Package Manager

```powershell
# Cài Scoop: https://scoop.sh
iwr -useb get.scoop.sh | iex

# Cài ADB
scoop install adb

# Verify
adb version
```

---

## macOS Installation

### Option 1: Homebrew (Khuyến nghị)

```bash
# Cài Homebrew (nếu chưa có): https://brew.sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Cài ADB
brew install android-platform-tools

# Verify
adb version
```

### Option 2: Manual Install

1. Download: https://developer.android.com/tools/releases/platform-tools
2. Giải nén vào thư mục (ví dụ: `~/platform-tools/`)
3. Add to PATH:
```bash
echo 'export PATH="$HOME/platform-tools:$PATH"' >> ~/.zshrc
source ~/.zshrc
```
4. Test: `adb version`

---

## Linux Installation

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install android-tools-adb android-tools-fastboot
adb version
```

### Fedora

```bash
sudo dnf install android-tools
adb version
```

### Arch Linux

```bash
sudo pacman -S android-tools
adb version
```

### Manual Install (All distros)

1. Download: https://developer.android.com/tools/releases/platform-tools
2. Extract to `/opt/platform-tools/`
```bash
sudo unzip platform-tools-linux.zip -d /opt/
echo 'export PATH="$PATH:/opt/platform-tools"' >> ~/.bashrc
source ~/.bashrc
adb version
```

---

## 🔧 Verify Installation

```bash
# Check ADB version
adb version

# Should see something like:
# Android Debug Bridge version 1.0.41
# Version 35.0.2-12147458
```

---

## 📱 Enable USB Debugging on Phone

### Xiaomi/MIUI/HyperOS:

1. **Settings** → **About phone**
2. Tap **MIUI version** 7 times → Developer mode unlocked
3. **Settings** → **Additional settings** → **Developer options**
4. Enable **USB debugging**
5. Enable **Install via USB** (optional, for reinstalling)
6. Connect phone to PC via USB
7. On phone, tap **Allow** when "Allow USB debugging?" appears
8. Check "Always allow from this computer"

### Samsung (One UI):

1. **Settings** → **About phone** → **Software information**
2. Tap **Build number** 7 times
3. Go back → **Developer options**
4. Enable **USB debugging**
5. Connect and allow on phone

### Stock Android:

1. **Settings** → **About phone**
2. Tap **Build number** 7 times
3. **Settings** → **System** → **Developer options**
4. Enable **USB debugging**

---

## ✅ Test Connection

```bash
# List connected devices
adb devices

# You should see:
# List of devices attached
# abc123xyz    device

# If you see "unauthorized", check phone and tap "Allow"
```

### Troubleshooting "unauthorized":

```bash
# Kill ADB server
adb kill-server

# Restart ADB server
adb start-server

# Try again
adb devices
```

### No device detected?

1. Try different USB cable (some cables are charge-only)
2. Try different USB port (prefer USB 2.0 ports)
3. On phone: Select **File Transfer** mode (not Charging only)
4. Revoke USB debugging authorizations:
   - **Developer options** → **Revoke USB debugging authorizations**
   - Reconnect and allow again

---

## 🚀 Ready to Use!

Once you see your device in `adb devices`, you're ready to use Android Debloater!

```powershell
# Run the app
cd d:\WORKS\Xiaomi\xiaomi-debloater
npm run tauri:dev
```

---

## 📚 Common ADB Commands

```bash
# List all packages
adb shell pm list packages

# Uninstall app for current user
adb shell pm uninstall --user 0 com.package.name

# Disable app
adb shell pm disable-user --user 0 com.package.name

# Get device info
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release

# Install APK
adb install app.apk

# Reinstall removed app
adb shell cmd package install-existing com.package.name
```

---

## ⚠️ Important Notes

- **Always keep USB debugging OFF** when not in use (security)
- **Don't allow USB debugging for unknown computers**
- Some antivirus may flag ADB as suspicious (it's safe if from official source)
- ADB works over WiFi too, but USB is more reliable

---

## 🆘 Need Help?

- Official docs: https://developer.android.com/tools/adb
- XDA Forums: https://forum.xda-developers.com/
- Reddit: r/Android, r/Xiaomi

Happy debloating! 🎉
