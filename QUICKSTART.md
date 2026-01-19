# 🚀 Quick Start Guide

## Bước 1: Chuẩn bị điện thoại

1. Vào **Settings** > **About Phone**
2. Nhấn vào **MIUI Version** hoặc **Build Number** 7 lần để bật **Developer Options**
3. Vào **Settings** > **Additional Settings** > **Developer Options**
4. Bật **USB Debugging**
5. Kết nối điện thoại với máy tính qua USB
6. Chọn **Allow** khi điện thoại hỏi "Allow USB debugging?"

## Bước 2: Cài đặt ADB

### Windows:
1. Tải **Android Platform Tools**: https://developer.android.com/tools/releases/platform-tools
2. Giải nén vào `C:\platform-tools\`
3. Thêm vào PATH:
   - Nhấn `Win + X` > **System** > **Advanced system settings**
   - **Environment Variables** > **Path** > **Edit** > **New**
   - Thêm: `C:\platform-tools\`
4. Kiểm tra: Mở CMD và gõ `adb version`

### macOS:
```bash
brew install android-platform-tools
adb version
```

### Linux:
```bash
sudo apt install android-tools-adb  # Ubuntu/Debian
sudo pacman -S android-tools        # Arch
adb version
```

## Bước 3: Kiểm tra kết nối

Mở Terminal/CMD và gõ:
```bash
adb devices
```

Bạn sẽ thấy:
```
List of devices attached
abc123xyz    device
```

Nếu thấy `unauthorized`, kiểm tra lại điện thoại và nhấn **Allow**.

## Bước 4: Chạy app

### Development Mode:
```bash
cd xiaomi-debloater
npm run tauri:dev
```

### Build Production:
```bash
npm run tauri:build
```

File build sẽ ở: `src-tauri/target/release/`

## Bước 5: Debloat!

1. App sẽ tự động phát hiện điện thoại
2. Chọn device từ danh sách
3. Browse các app và chọn bloatware cần gỡ
4. Click **Uninstall** để gỡ bỏ

## 🛡️ Apps an toàn để gỡ (Xiaomi)

✅ **Rất an toàn:**
- GetApps (com.xiaomi.mipicks)
- Mi Drop (com.xiaomi.midrop)
- Notes (com.miui.notes)
- Weather (com.miui.weather2)
- Cleaner (com.miui.cleanmaster)
- Scanner (com.xiaomi.scanner)
- Music (com.miui.player)
- Video (com.miui.videoplayer)
- Yellow Page (com.miui.yellowpage)

⚠️ **Cẩn thận:**
- Mi Cloud (com.miui.cloudservice) - Nếu dùng backup
- Browser (com.android.browser) - Nếu không có browser khác
- Security (com.miui.securitycenter) - Có thể ảnh hưởng permissions

🚫 **KHÔNG gỡ:**
- Google Play Store
- Google Play Services
- System UI
- Settings

## 🔄 Khôi phục app đã gỡ

Nếu gỡ nhầm, có 3 cách:

### Cách 1: Cài lại từ Play Store
- Tìm app trên Play Store và cài lại

### Cách 2: Factory Reset
- Tất cả app sẽ trở lại (nhưng mất dữ liệu)

### Cách 3: Reinstall qua ADB
```bash
adb shell cmd package install-existing <package-name>
```

## ⚡ Mẹo hay

1. **Backup trước khi gỡ**: Click nút **Backup** để lưu profile
2. **Batch remove**: Chọn nhiều app cùng lúc rồi gỡ
3. **Search**: Dùng search box để tìm app nhanh
4. **Filter**: Ẩn/hiện system apps
5. **Safety level**: Chỉ gỡ apps có biểu tượng 🟢 (safe)

## 🐛 Troubleshooting

### "ADB not found"
- Cài Android Platform Tools
- Thêm vào PATH
- Restart terminal

### "No devices detected"
- Bật USB Debugging
- Chọn "File Transfer" mode trên điện thoại
- Thử cable USB khác
- `adb kill-server && adb start-server`

### "Unauthorized"
- Nhấn "Allow" trên điện thoại
- Untick và tick lại USB Debugging
- Revoke USB debugging authorizations và thử lại

### "Error: Failure [not installed for 0]"
- App đã bị gỡ rồi
- Hoặc không tồn tại

## 📞 Support

- GitHub Issues: [Link]
- Telegram Group: [Link]
- Reddit: r/Xiaomi

Chúc bạn debloat thành công! 🎉
