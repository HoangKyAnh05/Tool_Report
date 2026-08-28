# Video Reminder - Tool Nhắc Hẹn Phát Video & Giọng Đọc (Desktop & Mobile)

Ứng dụng nhắc hẹn thông minh kết hợp phát video tự động, đọc thông báo giọng nói (Text-to-Speech), chạy ngầm trong khay hệ thống (System Tray) trên PC và hỗ trợ sử dụng trên điện thoại (Mobile Web / PWA).

---

## 🌟 Tính Năng Nổi Bật

1. **Nhắc hẹn kết hợp phát video tự động**:
   - Khi đến đúng giờ hẹn (hàng ngày, 1 lần hoặc theo các thứ trong tuần), ứng dụng sẽ tự động bung lên từ khay hệ thống, bật chế độ `Always on Top` (hoặc Fullscreen) và tự động phát video đã cài đặt.
   - Hỗ trợ chọn video trực tiếp từ máy tính (`.mp4`, `.mkv`, `.webm`, `.avi`), các video mẫu chuẩn (bài tập giãn cơ, thư giãn mắt, uống nước) hoặc nhập đường dẫn link trực tuyến.

2. **Giọng nói thông báo (Text-to-Speech)**:
   - Tự động đọc câu nhắc nhở bạn soạn sẵn: *"Đến giờ tập thể dục rồi!"*, *"Đến giờ họp dự án A!"*,...
   - Tự động phát âm thanh chuông báo thức êm dịu, dễ chịu.

3. **Chạy ẩn hoàn toàn & Khay hệ thống (System Tray)**:
   - Khi bấm nút Đóng hoặc Thu nhỏ, ứng dụng sẽ ẩn về System Tray ở góc phải thanh Taskbar mà không tắt.
   - Nhấp đúp vào icon khay hệ thống để mở lại giao diện.
   - Báo thức vẫn kích hoạt đúng giờ ngay cả khi đang thu nhỏ hoặc làm việc với app khác.

4. **Tạo Shortcut ngoài Desktop chạy ẩn Terminal**:
   - Cung cấp script tạo icon Desktop, nhấp mở app trực tiếp mà không hiện cửa sổ Command Prompt / Terminal đen.

5. **Hỗ trợ Điện thoại (iOS / Android)**:
   - Giao diện Responsive tối ưu cho điện thoại.
   - Hỗ trợ kết nối qua IP mạng LAN Wi-Fi và cài ra Màn hình chính dạng ứng dụng Web PWA.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Trên PC

### 1. Khởi chạy ứng dụng ở chế độ phát triển
```bash
npm run dev
```

### 2. Tạo Shortcut ngoài Desktop (Không hiện Terminal)
Chạy lệnh sau trong PowerShell hoặc terminal của dự án:
```bash
npm run create-shortcut
```
*(Icon "Video Reminder" sẽ xuất hiện ngay trên màn hình Desktop của bạn, bấm vào là chạy ngầm mượt mà).*

---

## 📱 Hướng Dẫn Dùng Trên Điện Thoại

1. Đảm bảo điện thoại và máy tính kết nối **chung 1 mạng Wi-Fi**.
2. Trên máy tính, chạy:
   ```bash
   npm run dev -- --host
   ```
3. Mở trình duyệt trên điện thoại và truy cập địa chỉ IP hiển thị (VD: `http://192.168.1.5:5173`).
4. **Cài ra Màn hình chính**:
   - **iPhone (Safari)**: Bấm nút **Chia sẻ** -> Chọn **Thêm vào MH chính** (Add to Home Screen).
   - **Android (Chrome)**: Bấm nút **3 chấm** -> Chọn **Cài đặt ứng dụng** / **Thêm vào màn hình chính**.

---

## 📂 Cấu Trúc Thư Mục

```
Tool_Report/
├── electron/
│   ├── main.ts              # Electron Main process, System Tray, Alarms, Video Protocol
│   └── preload.ts           # Preload script an toàn bảo mật IPC
├── src/
│   ├── components/
│   │   ├── TitleBar.tsx     # Header bar hiện đại cho desktop
│   │   ├── ClockHeader.tsx  # Đồng hồ số real-time & widget đếm ngược
│   │   ├── ReminderList.tsx # Danh sách thẻ nhắc hẹn & bật/tắt
│   │   ├── ReminderModal.tsx# Form thêm/sửa lịch hẹn, chọn video & giọng đọc
│   │   ├── AlarmModal.tsx   # Màn hình phát video toàn màn hình khi chuông reo
│   │   ├── SettingsModal.tsx# Cài đặt tốc độ giọng đọc, âm lượng, backup JSON
│   │   └── MobileGuideModal.tsx # Hướng dẫn cài trên điện thoại
│   ├── data/
│   │   └── sampleVideos.ts  # Danh sách video mẫu có sẵn
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── utils/
│   │   ├── audioTts.ts      # Web Speech API & Web Audio chime
│   │   └── storage.ts       # LocalStorage lưu trữ dữ liệu
│   ├── App.tsx              # Component trung tâm & bộ đếm thời gian
│   └── main.tsx
├── scripts/
│   ├── create-desktop-shortcut.ps1 # Script tạo icon Desktop chạy ẩn
│   └── launch-silent.vbs           # VBScript chạy nền không bật terminal
├── package.json
└── vite.config.ts
```

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, TypeScript, TailwindCSS, Lucide Icons, Canvas Confetti.
- **Desktop Runtime**: Electron 44.
- **Build Tool**: Vite 8.
