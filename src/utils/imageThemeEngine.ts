// Image Theme Engine for Reminder Alarms
// Provides high-quality, authentic royalty-free images matching the reminder title/content

export interface ThemeImage {
  keywords: string[]
  title: string
  imageUrl: string
  category: string
}

export const THEME_IMAGES: ThemeImage[] = [
  // 🎤 HỌC HÁT / CA HÁT / ÂM NHẠC / KARAOKE
  {
    keywords: ['hát', 'học hát', 'ca hát', 'âm nhạc', 'sing', 'singing', 'karaoke', 'luyện thanh', 'nhạc', 'vocal', 'thu âm', 'micro'],
    title: 'Học Hát & Biểu Diễn Âm Nhạc',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
    category: 'Âm nhạc & Ca hát',
  },
  {
    keywords: ['hát', 'karaoke', 'nhạc cụ', 'đàn', 'guitar', 'piano'],
    title: 'Phòng Thu Âm Nhạc & Micro Sân Khấu',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    category: 'Âm nhạc & Ca hát',
  },

  // 📚 HỌC BÀI / ĐỌC SÁCH / TIẾNG ANH / HỌC TẬP
  {
    keywords: ['học', 'học bài', 'đọc sách', 'sách', 'ôn thi', 'bài tập', 'tiếng anh', 'english', 'study', 'reading'],
    title: 'Góc Học Tập & Đọc Sách Yên Tĩnh',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    category: 'Học tập',
  },
  {
    keywords: ['thi', 'ôn tập', 'viết', 'vở', 'ghi chép'],
    title: 'Tập Trung Ôn Bài & Ghi Chép Kiến Thức',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    category: 'Học tập',
  },

  // 🏃 THỂ DỤC / VẬN ĐỘNG / GYM / YOGA / CHẠY BỘ
  {
    keywords: ['thể dục', 'tập thể dục', 'gym', 'vận động', 'giãn cơ', 'workout', 'cardio', 'chạy bộ', 'thể thao'],
    title: 'Tập Luyện Thể Dục Rèn Luyện Thể Lực',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    category: 'Thể thao & Vận động',
  },
  {
    keywords: ['yoga', 'thiền', 'hít thở', 'thư thái'],
    title: 'Yoga & Thư Giãn Tinh Thần',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    category: 'Thể thao & Vận động',
  },

  // 💧 UỐNG NƯỚC / HYDRATION
  {
    keywords: ['nước', 'uống nước', 'cốc nước', 'bù nước', 'water', 'khoáng'],
    title: 'Cốc Nước Khoáng Mát Lạnh Bổ Sung Năng Lượng',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=1200&q=80',
    category: 'Sức khỏe',
  },

  // 🍱 ĂN UỐNG / ĂN CƠM / BỮA ĂN / NẤU ĂN
  {
    keywords: ['ăn', 'ăn cơm', 'ăn tối', 'ăn trưa', 'ăn sáng', 'bữa tối', 'bữa trưa', 'bữa sáng', 'nấu ăn', 'cơm', 'thức ăn', 'nấu'],
    title: 'Bữa Ăn Ngon Miệng & Đầy Đủ Dinh Dưỡng',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    category: 'Ăn uống',
  },

  // 🌙 ĐI NGỦ / NGHỈ NGƠI
  {
    keywords: ['ngủ', 'đi ngủ', 'giấc ngủ', 'nghỉ trưa', 'sleep', 'bed', 'nghỉ ngơi'],
    title: 'Phòng Ngủ Ấm Áp & Giấc Ngủ Ngon',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80',
    category: 'Nghỉ ngơi',
  },

  // 💻 LÀM VIỆC / CODE / HỌP / DỰ ÁN
  {
    keywords: ['làm việc', 'họp', 'meeting', 'dự án', 'công việc', 'báo cáo', 'code', 'lập trình', 'dev'],
    title: 'Bàn Làm Việc Chuyên Nghiệp & Tập Trung Cao',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    category: 'Công việc',
  },

  // 🏊 BƠI LỘI / ĐI BƠI
  {
    keywords: ['bơi', 'đi bơi', 'bơi lội', 'hồ bơi', 'bể bơi', 'swim'],
    title: 'Hồ Bơi Làn Nước Xanh Mát',
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
    category: 'Thể thao',
  },

  // ☕ CÀ PHÊ / TRÀ
  {
    keywords: ['cà phê', 'cafe', 'coffee', 'trà', 'uống trà', 'thưởng trà'],
    title: 'Tách Cà Phê Thơm Lừng Tỉnh Táo',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    category: 'Thư giãn',
  },

  // 💊 THUỐC / Y TẾ
  {
    keywords: ['thuốc', 'uống thuốc', 'khám', 'vitamin', 'y tế', 'bác sĩ'],
    title: 'Uống Thuốc Đúng Giờ Giữ Gìn Sức Khỏe',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
    category: 'Sức khỏe',
  },

  // 🚽 VỆ SINH / TẮM GỘI
  {
    keywords: ['vệ sinh', 'đi vệ sinh', 'toilet', 'wc', 'tắm', 'gội', 'đánh răng', 'rửa mặt', 'skincare'],
    title: 'Vệ Sinh Cá Nhân & Chăm Sóc Sức Khỏe',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    category: 'Vệ sinh cá nhân',
  },

  // 🐾 THÚ CƯNG
  {
    keywords: ['thú cưng', 'chó', 'mèo', 'pet', 'dắt chó'],
    title: 'Chăm Sóc Thú Cưng Đáng Yêu',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80',
    category: 'Thú cưng',
  },

  // 🎮 GIẢI TRÍ / GAME
  {
    keywords: ['game', 'chơi game', 'giải trí', 'xem phim', 'xem video', 'thư giãn'],
    title: 'Giờ Nghỉ Ngơi & Giải Trí Tự Do',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    category: 'Giải trí',
  },

  // 🧹 DỌN DẸP / NHÀ CỬA
  {
    keywords: ['dọn', 'dọn dẹp', 'lau nhà', 'quét nhà', 'vệ sinh phòng', 'gọn gàng'],
    title: 'Dọn Dẹp Không Gian Nhà Cửa Sạch Sẽ',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    category: 'Đời sống',
  },
]

const DEFAULT_IMAGE = {
  title: 'Nhắc Hẹn Thông Minh',
  imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
  category: 'Lịch nhắc hẹn',
}

/**
 * Find the most relevant theme image for a reminder title
 */
export function getThemeImageForTitle(title: string = ''): { title: string; imageUrl: string; category: string } {
  if (!title) return DEFAULT_IMAGE

  const lowerTitle = title.toLowerCase().trim()
  const words = lowerTitle.split(/\s+/).filter(w => w.length > 1)

  let bestMatch: ThemeImage | null = null
  let maxScore = 0

  for (const item of THEME_IMAGES) {
    let score = 0
    for (const kw of item.keywords) {
      if (lowerTitle.includes(kw)) {
        score += 25
      }
      for (const w of words) {
        if (kw === w) {
          score += 15
        } else if (kw.includes(w) || w.includes(kw)) {
          score += 6
        }
      }
    }

    if (score > maxScore) {
      maxScore = score
      bestMatch = item
    }
  }

  if (bestMatch && maxScore > 0) {
    return {
      title: bestMatch.title,
      imageUrl: bestMatch.imageUrl,
      category: bestMatch.category,
    }
  }

  return DEFAULT_IMAGE
}
