import React from 'react'
import { Smartphone, Monitor, Globe, QrCode, X, CheckCircle, Wifi, Bell, ShieldCheck } from 'lucide-react'

interface MobileGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export const MobileGuideModal: React.FC<MobileGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Hướng Dẫn Cài Đặt & Sử Dụng Trên Điện Thoại
              </h2>
              <p className="text-xs text-slate-400">iOS (iPhone / iPad) & Android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-300">
          {/* Step 1: Kết nối LAN hoặc chạy Web */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Wifi className="w-4 h-4" />
              <span>Bước 1: Kết nối chung mạng Wi-Fi với máy tính</span>
            </div>
            <p className="text-slate-400">
              Khi bạn khởi động lệnh <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">npm run dev -- --host</code> trên máy tính, Vite sẽ cung cấp địa chỉ IP LAN (ví dụ: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">http://192.168.1.x:5173</code>).
            </p>
          </div>

          {/* Step 2: Cài PWA ra màn hình chính */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Smartphone className="w-4 h-4" />
              <span>Bước 2: Cài app ra Màn hình chính (Home Screen)</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <p className="flex items-start gap-1.5">
                <strong className="text-white">• Trên iPhone (Safari):</strong> Bấm nút <strong>Chia sẻ (Share)</strong> <span className="text-slate-400">➔</span> Chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.
              </p>
              <p className="flex items-start gap-1.5">
                <strong className="text-white">• Trên Android (Chrome):</strong> Bấm biểu tượng <strong>3 chấm</strong> ở góc trên <span className="text-slate-400">➔</span> Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào màn hình chính"</strong>.
              </p>
            </div>
          </div>

          {/* Step 3: Bật âm thanh & quyền chạy ngầm */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Bell className="w-4 h-4" />
              <span>Bước 3: Cho phép âm thanh & thông báo</span>
            </div>
            <p className="text-slate-400">
              Trên trình duyệt điện thoại, bấm nút "Thử chuông" 1 lần để cấp quyền tự động phát âm thanh và giọng đọc (Web Speech API).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span className="text-[11px]">
              Dữ liệu nhắc hẹn được lưu trữ an toàn ngay trên bộ nhớ trình duyệt điện thoại của bạn, không lo bị lộ thông tin.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  )
}
