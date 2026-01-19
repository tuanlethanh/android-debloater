# Changelog

All notable changes to Android Debloater will be documented in this file.

## [1.0.0] - 2026-01-19

### ✨ Features
- Initial release
- ADB integration for device communication
- List all installed packages on Android devices
- Uninstall apps without root (pm uninstall --user 0)
- Disable apps without root (pm disable-user)
- Batch operations - Remove multiple apps at once
- Bloatware database with safety indicators
  - Safe to remove (green shield)
  - Use caution (yellow warning)
  - Do not remove (red warning)
- Search and filter apps
- Show/hide system apps toggle
- Dark/Light theme support
- Modern, responsive UI with TailwindCSS
- Cross-platform support (Windows, macOS, Linux)
- Backup/Restore functionality (TODO)

### 🗃️ Bloatware Database
- Xiaomi/MIUI bloatware definitions
- Generic Android bloatware
- Safety recommendations
- App descriptions and categories

### 🛠️ Technical
- Built with Tauri 2.0 (Rust backend)
- React 18 + TypeScript frontend
- Vite build tool
- Zustand state management
- Lightweight (~5-10MB bundle size)

### 📝 Documentation
- Comprehensive README
- Quick start guide
- ADB installation instructions
- Safety recommendations
- Troubleshooting guide

### 🚧 Known Limitations
- Icons need to be generated for build
- Backup/Restore UI incomplete
- App labels parsed from package names (need better parsing)
- No app icons displayed yet

## [Upcoming]

### Planned Features
- [ ] App icons in list
- [ ] Better app label parsing
- [ ] Profile templates (Minimal, Moderate, Aggressive)
- [ ] Restore apps feature
- [ ] Activity log
- [ ] Multi-language support (Vietnamese, English)
- [ ] Check for updates
- [ ] Export removed apps list to clipboard
- [ ] Undo last operation
- [ ] Favorite/bookmark apps for quick access
