# Android Debloater

Remove bloatware from Xiaomi and Android devices safely - No root required!

## ✨ Features

- 🔍 **List all apps** on connected Android devices
- 🗑️ **Uninstall/Disable bloatware** without root access
- 📦 **Batch operations** - Remove multiple apps at once
- 🛡️ **Safety indicators** - Know which apps are safe to remove
- 💾 **Backup/Restore** - Save and restore your debloat profiles
- 🎨 **Beautiful UI** - Modern interface with dark/light theme
- 🚀 **Cross-platform** - Works on Windows, macOS, and Linux
- ⚡ **Fast & Lightweight** - Built with Tauri (Rust + React)

## 🎯 How It Works

This app uses **ADB (Android Debug Bridge)** to communicate with your Android device and execute safe uninstall commands:

```bash
adb shell pm uninstall --user 0 <package-name>
```

This method:
- ✅ Does NOT require root access
- ✅ Only removes apps for the current user (user 0)
- ✅ Apps can be reinstalled from Play Store
- ✅ Won't break your system

## 📋 Prerequisites

1. **Android Device**:
   - Enable **Developer Options** (tap Build Number 7 times in Settings > About Phone)
   - Enable **USB Debugging** in Developer Options
   - Connect device via USB

2. **ADB (Android Debug Bridge)**:
   - Download: [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools)
   - Extract and add to PATH, or place in same folder as this app

3. **Computer**:
   - Windows 10/11, macOS 10.15+, or Linux
   - WebView2 (auto-installed on Windows 11)

## 🚀 Installation

### Option 1: Download Release (Recommended)
1. Download the latest release from [Releases page](../../releases)
2. Install ADB Platform Tools
3. Run the app!

### Option 2: Build from Source

**Prerequisites:**
- Node.js 18+
- Rust 1.70+
- **Visual Studio Build Tools (Windows)** - Required!

**Quick Install (Windows):**
```powershell
# Run this script to auto-install VS Build Tools
.\install-buildtools.ps1
```

Or download manually: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Select "Desktop development with C++"
- Restart your computer after installation

**Steps:**
```bash
# Clone the repository
git clone https://github.com/yourusername/xiaomi-debloater.git
cd xiaomi-debloater

# Install dependencies
npm install

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

**See [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for detailed setup guide.**

## 🎮 Usage

1. **Connect your Android device** via USB
2. **Enable USB Debugging** on your device
3. **Launch the app**
4. Click **Refresh** to detect devices
5. **Select your device** from the list
6. **Browse apps** and select bloatware to remove
7. Click **Uninstall** to remove selected apps

### Tips:
- 🟢 **Green shield** = Safe to remove
- 🟡 **Yellow warning** = Use caution (may need for some features)
- 🔴 **Red warning** = Do NOT remove (system critical)

## 📱 Supported Devices

- ✅ Xiaomi / Redmi / POCO (MIUI, HyperOS)
- ✅ Samsung (One UI)
- ✅ OnePlus (OxygenOS)
- ✅ OPPO / Realme (ColorOS)
- ✅ Vivo (FuntouchOS)
- ✅ Any Android device with USB debugging

## ⚠️ Safety Notice

- **Always review** which apps you're removing
- **Start with green-labeled apps** for maximum safety
- **Backup important data** before debloating
- Apps can be **reinstalled** from Play Store if needed
- **Factory reset** will restore all removed apps

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: Rust (Tauri 2.0)
- **Build Tool**: Vite
- **State Management**: Zustand
- **Icons**: Lucide React

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

Found a bug? [Open an issue](../../issues)

## ❤️ Credits

Built with ❤️ using [Tauri](https://tauri.app)

---

**Disclaimer**: Use at your own risk. While this app uses safe methods, removing system apps can affect device functionality. Always know what you're removing!
