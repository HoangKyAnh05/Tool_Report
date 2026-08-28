// Image Theme Engine for Reminder Alarms
// Provides high-quality, authentic royalty-free images matching the reminder title/content
// Supports cycling through multiple options & searching online images

export interface ThemeImage {
  keywords: string[]
  title: string
  imageUrl: string
  category: string
}

export const THEME_IMAGES: ThemeImage[] = [
  // 📱 ĐIỆN THOẠI / LƯỚT WEB / SMARTPHONE / XEM ĐIỆN THOẠI / TIKTOK / FACEBOOK / MẠNG XÃ HỘI
  {
    keywords: ['điện thoại', 'xem điện thoại', 'smartphone', 'lướt web', 'phone', 'mobi', 'xem đt', 'dế yêu', 'màn hình'],
    title: 'Xem Điện Thoại & Lướt Mạng Xã Hội',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
    category: 'Điện thoại & Công nghệ',
  },
  {
    keywords: ['điện thoại', 'smartphone', 'lướt', 'ứng dụng', 'app', 'tin nhắn', 'nhắn tin'],
    title: 'Lướt Ứng Dụng Smartphone & Cập Nhật Tin Tức',
    imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1200&q=80',
    category: 'Điện thoại & Công nghệ',
  },
  {
    keywords: ['điện thoại', 'iphone', 'xem điện thoại', 'cầm điện thoại', 'chụp ảnh'],
    title: 'Cầm Smartphone Hiện Đại & Khám Phá',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    category: 'Điện thoại & Công nghệ',
  },
  {
    keywords: ['điện thoại', 'tiktok', 'facebook', 'youtube', 'xem video', 'lướt tin tức'],
    title: 'Thư Giãn Cùng Điện Thoại Thông Minh',
    imageUrl: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=1200&q=80',
    category: 'Điện thoại & Công nghệ',
  },
  {
    keywords: ['điện thoại', 'công nghệ', 'màn hình', 'smartphone', 'kết nối'],
    title: 'Màn Hình Smartphone Sắc Nét & Kết Nối Bạn Bè',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    category: 'Điện thoại & Công nghệ',
  },
  {
    keywords: ['điện thoại', 'tra cứu', 'thông báo', 'nhắc nhở'],
    title: 'Kiểm Tra Thông Báo & Tin Nhắn Điện Thoại',
    imageUrl: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=1200&q=80',
    category: 'Điện thoại & Công nghệ',
  },

  // 🎤 HỌC HÁT / CA HÁT / ÂM NHẠC / KARAOKE
  {
    keywords: ['hát', 'học hát', 'ca hát', 'âm nhạc', 'sing', 'singing', 'karaoke', 'luyện thanh', 'nhạc', 'vocal', 'thu âm', 'micro'],
    title: 'Học Hát & Biểu Diễn Âm Nhạc',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
    category: 'Âm nhạc & Ca hát',
  },
  {
    keywords: ['hát', 'karaoke', 'nhạc cụ', 'micro', 'phòng thu'],
    title: 'Phòng Thu Âm Nhạc & Micro Sân Khấu',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    category: 'Âm nhạc & Ca hát',
  },
  {
    keywords: ['hát', 'sân khấu', 'biểu diễn', 'ca sĩ', 'âm thanh'],
    title: 'Sân Khấu Ánh Sáng & Biểu Diễn Tràn Đầy Cảm Hứng',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    category: 'Âm nhạc & Ca hát',
  },
  {
    keywords: ['nhạc', 'tai nghe', 'giai điệu', 'thưởng thức nhạc'],
    title: 'Giai Điệu Âm Nhạc Thư Thái Với Tai Nghe',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    category: 'Âm nhạc & Ca hát',
  },
  {
    keywords: ['đàn', 'guitar', 'chơi đàn', 'gảy đàn'],
    title: 'Luyện Đàn Guitar & Hòa Tấu Giai Điệu',
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80',
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
  {
    keywords: ['thư viện', 'sách', 'kho tàng', 'nghiên cứu'],
    title: 'Thư Viện Sách Tri Thức Rộng Lớn',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    category: 'Học tập',
  },
  {
    keywords: ['học', 'tiếng anh', 'ngoại ngữ', 'nghe giảng'],
    title: 'Khám Phá Tri Thức Mới & Phát Triển Bản Thân',
    imageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=1200&q=80',
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
  {
    keywords: ['chạy bộ', 'running', 'chạy', 'công viên'],
    title: 'Chạy Bộ Buổi Sáng Đầy Năng Lượng',
    imageUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=80',
    category: 'Thể thao & Vận động',
  },
  {
    keywords: ['gym', 'tạ', 'thể hình', 'cơ bắp'],
    title: 'Phòng Gym Hiện Đại Đạt Mục Tiêu Sức Khỏe',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80',
    category: 'Thể thao & Vận động',
  },

  // 💧 UỐNG NƯỚC / HYDRATION
  {
    keywords: ['nước', 'uống nước', 'cốc nước', 'bù nước', 'water', 'khoáng'],
    title: 'Cốc Nước Khoáng Mát Lạnh Bổ Sung Năng Lượng',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=1200&q=80',
    category: 'Sức khỏe',
  },
  {
    keywords: ['nước', 'uống', 'chai nước', 'thanh lọc'],
    title: 'Uống Nước Đầy Đủ Để Cơ Thể Tràn Sức Sống',
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=80',
    category: 'Sức khỏe',
  },
  {
    keywords: ['nước lọc', 'ấm', 'uống nước ấm', 'sức khỏe'],
    title: 'Bổ Sung Nước Đều Đặn Cho Ngày Làm Việc',
    imageUrl: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=1200&q=80',
    category: 'Sức khỏe',
  },

  // 🍱 ĂN UỐNG / ĂN CƠM / BỮA ĂN / NẤU ĂN
  {
    keywords: ['ăn', 'ăn cơm', 'ăn tối', 'ăn trưa', 'ăn sáng', 'bữa tối', 'bữa trưa', 'bữa sáng', 'nấu ăn', 'cơm', 'thức ăn', 'nấu'],
    title: 'Bữa Ăn Ngon Miệng & Đầy Đủ Dinh Dưỡng',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    category: 'Ăn uống',
  },
  {
    keywords: ['ăn uống', 'salad', 'rau', 'healthy', 'dinh dưỡng'],
    title: 'Món Ăn Dinh Dưỡng Tươi Ngon & Lành Mạnh',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    category: 'Ăn uống',
  },
  {
    keywords: ['nấu ăn', 'bếp', 'nấu', 'đầu bếp', 'món ngon'],
    title: 'Nấu Những Món Ngon Cho Bữa Cơm Ấm Cúng',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    category: 'Ăn uống',
  },
  {
    keywords: ['bữa sáng', 'ăn sáng', 'bánh mì', 'trứng'],
    title: 'Bữa Sáng Năng Lượng Khởi Đầu Ngày Mới',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80',
    category: 'Ăn uống',
  },

  // 🌙 ĐI NGỦ / NGHỈ NGƠI
  {
    keywords: ['ngủ', 'đi ngủ', 'giấc ngủ', 'nghỉ trưa', 'sleep', 'bed', 'nghỉ ngơi'],
    title: 'Phòng Ngủ Ấm Áp & Giấc Ngủ Ngon',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80',
    category: 'Nghỉ ngơi',
  },
  {
    keywords: ['nghỉ trưa', 'giường', 'thư giãn', 'ngủ sâu'],
    title: 'Thư Giãn Nạp Lại Năng Lượng Cho Cơ Thể',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    category: 'Nghỉ ngơi',
  },
  {
    keywords: ['ngủ ngon', 'đêm', 'ánh sáng dịu', 'gối êm'],
    title: 'Không Gian Yên Bình Cho Giấc Ngủ Trọn Vẹn',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    category: 'Nghỉ ngơi',
  },

  // 💻 LÀM VIỆC / CODE / HỌP / DỰ ÁN
  {
    keywords: ['làm việc', 'họp', 'meeting', 'dự án', 'công việc', 'báo cáo', 'code', 'lập trình', 'dev'],
    title: 'Bàn Làm Việc Chuyên Nghiệp & Tập Trung Cao',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    category: 'Công việc',
  },
  {
    keywords: ['code', 'lập trình', 'developer', 'máy tính', 'gõ code'],
    title: 'Lập Trình Viên Làm Việc Với Dòng Mã',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    category: 'Công việc',
  },
  {
    keywords: ['laptop', 'văn phòng', 'bàn làm việc'],
    title: 'Không Gian Văn Phòng Sáng Tạo & Năng Động',
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
    category: 'Công việc',
  },

  // 🏊 BƠI LỘI / ĐI BƠI
  {
    keywords: ['bơi', 'đi bơi', 'bơi lội', 'hồ bơi', 'bể bơi', 'swim'],
    title: 'Hồ Bơi Làn Nước Xanh Mát',
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
    category: 'Thể thao',
  },
  {
    keywords: ['bơi', 'nước trong', 'bể bơi', 'lặn'],
    title: 'Tập Bơi Thể Thao Rèn Luyện Thể Lực Tốt',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80',
    category: 'Thể thao',
  },

  // ☕ CÀ PHÊ / TRÀ
  {
    keywords: ['cà phê', 'cafe', 'coffee', 'trà', 'uống trà', 'thưởng trà'],
    title: 'Tách Cà Phê Thơm Lừng Tỉnh Táo',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    category: 'Thư giãn',
  },
  {
    keywords: ['trà', 'quán cafe', 'nhâm nhi', 'thảnh thơi'],
    title: 'Nhâm Nhi Ly Cà Phê Đậm Đà Năng Lượng',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    category: 'Thư giãn',
  },

  // 💊 UỐNG THUỐC / SỨC KHỎE
  {
    keywords: ['uống thuốc', 'thuốc', 'viên thuốc', 'khám', 'bác sĩ', 'vitamin', 'y tế'],
    title: 'Uống Thuốc Đúng Giờ & Chăm Sóc Sức Khỏe',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
    category: 'Y tế & Sức khỏe',
  },
  {
    keywords: ['vitamin', 'thực phẩm chức năng', 'bổ sung'],
    title: 'Bổ Sung Vitamin Giữ Cơ Thể Khỏe Khoắn',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=1200&q=80',
    category: 'Y tế & Sức khỏe',
  },

  // 🎮 CHƠI GAME / PUBG / ESPORTS / GIẢI TRÍ
  {
    keywords: ['pubg', 'game', 'chơi game', 'bắn súng', 'battlegrounds', 'liên quân', 'tốc chiến', 'free fire', 'gaming', 'esport'],
    title: 'PUBG Battlegrounds & Game Sinh Tồn Đỉnh Cao',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    category: 'Game & Thể thao điện tử',
  },
  {
    keywords: ['pubg', 'game', 'tay cầm', 'máy chơi game', 'chiến game'],
    title: 'Giờ Chơi Game & Thư Giãn Tinh Thần',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    category: 'Game & Thể thao điện tử',
  },
  {
    keywords: ['pubg', 'gaming', 'setup', 'pc gaming', 'rgb', 'màn hình game'],
    title: 'Góc Gaming RGB Sống Động Thỏa Sức Chiến Game',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    category: 'Game & Thể thao điện tử',
  },

  // 🧹 DỌN DẸP / VỆ SINH NHÀ CỬA
  {
    keywords: ['dọn dẹp', 'lau nhà', 'quét nhà', 'vệ sinh', 'giặt đồ', 'rửa bát', 'nhà cửa'],
    title: 'Dọn Dẹp Nhà Cửa Gọn Gàng Sạch Sẽ',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    category: 'Gia đình & Đời sống',
  },

  // 🐾 THÚ CƯNG / CHÓ MÈO
  {
    keywords: ['chó', 'mèo', 'thú cưng', 'pet', 'dắt chó', 'cho chó ăn', 'cho mèo ăn'],
    title: 'Chăm Sóc & Vui Đùa Cùng Thú Cưng Đáng Yêu',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    category: 'Thú cưng',
  },
  {
    keywords: ['mèo', 'mèo con', 'chơi với mèo'],
    title: 'Chú Mèo Dễ Thương Thư Giãn',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
    category: 'Thú cưng',
  },

  // 🛒 MUA SẮM / ĐI CHỢ
  {
    keywords: ['mua sắm', 'đi chợ', 'siêu thị', 'shopping', 'mua đồ'],
    title: 'Đi Chợ & Mua Sắm Nhu Yếu Phẩm Tươi Ngon',
    imageUrl: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1200&q=80',
    category: 'Mua sắm',
  },
]

export const DEFAULT_IMAGE = {
  title: 'Nhắc Hẹn Thông Minh',
  imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
  category: 'Lịch nhắc hẹn',
}

/**
 * Get all matching theme images for a title, ranked by relevance score
 */
export function getAllMatchingThemeImages(title: string = '', strict: boolean = false): ThemeImage[] {
  if (!title) return strict ? [] : THEME_IMAGES

  const lowerTitle = title.toLowerCase().trim()
  const words = lowerTitle.split(/\s+/).filter(w => w.length > 1)

  const scored = THEME_IMAGES.map((item) => {
    let score = 0
    for (const kw of item.keywords) {
      if (lowerTitle.includes(kw)) {
        score += 35
      }
      for (const w of words) {
        if (kw === w) {
          score += 20
        } else if (kw.includes(w) || w.includes(kw)) {
          score += 8
        }
      }
    }
    return { item, score }
  })

  // Filter items with positive score and sort descending
  const matched = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.item)

  if (matched.length > 0) {
    return matched
  }

  return strict ? [] : THEME_IMAGES
}

/**
 * Find the most relevant theme image for a reminder title
 */
export function getThemeImageForTitle(title: string = ''): { title: string; imageUrl: string; category: string } {
  const matches = getAllMatchingThemeImages(title)
  if (matches.length > 0) {
    const first = matches[0]
    return {
      title: first.title,
      imageUrl: first.imageUrl,
      category: first.category,
    }
  }
  return DEFAULT_IMAGE
}

/**
 * Get the next theme image in the list, enabling infinite cycle "đổi tới khi nào tôi ưng thì thôi"
 */
export function getNextThemeImage(
  title: string = '',
  currentImageUrl?: string
): { title: string; imageUrl: string; category: string } {
  const pool = getAllMatchingThemeImages(title)
  if (!pool || pool.length === 0) return DEFAULT_IMAGE

  if (!currentImageUrl) {
    return {
      title: pool[0].title,
      imageUrl: pool[0].imageUrl,
      category: pool[0].category,
    }
  }

  // Find index of current image in pool
  const currentIndex = pool.findIndex(img => img.imageUrl === currentImageUrl)
  if (currentIndex === -1) {
    // Current image was not in top pool, return the first
    return {
      title: pool[0].title,
      imageUrl: pool[0].imageUrl,
      category: pool[0].category,
    }
  }

  // Next image in circular order
  const nextIndex = (currentIndex + 1) % pool.length
  const nextItem = pool[nextIndex]
  return {
    title: nextItem.title,
    imageUrl: nextItem.imageUrl,
    category: nextItem.category,
  }
}

/**
 * Search online Google / Web images directly.
 * 1. Uses Electron direct IPC (on PC app)
 * 2. Uses /api/search-images (on Web server)
 * 3. Uses public CORS search (on static web)
 * 4. Combines with strict curated matches
 */
export async function searchOnlineImages(query: string): Promise<Array<{ title: string; imageUrl: string; source: string }>> {
  const trimmed = query.trim()
  if (!trimmed) return []

  // 1. Electron IPC on PC app (No CORS restrictions, loads real Google/DuckDuckGo photos)
  if (typeof window !== 'undefined' && window.electronAPI?.searchOnlineImages) {
    try {
      const electronResults = await window.electronAPI.searchOnlineImages(trimmed)
      if (Array.isArray(electronResults) && electronResults.length > 0) {
        return electronResults
      }
    } catch (e) {
      console.warn('Electron IPC search error:', e)
    }
  }

  // 2. Server API route (when hosted on Render / local Node server)
  try {
    const res = await fetch(`/api/search-images?q=${encodeURIComponent(trimmed)}`, {
      signal: AbortSignal.timeout(4500),
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch (e) {
    // Server not available on static hosts (e.g. GitHub Pages)
  }

  // 3. Fallback online search via Wikimedia API
  try {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      trimmed
    )}&gsrlimit=16&prop=pageimages&piprop=original|thumbnail&pithumbsize=600&format=json&origin=*`

    const response = await fetch(apiUrl, { signal: AbortSignal.timeout(3500) })
    if (response.ok) {
      const data = await response.json()
      if (data?.query?.pages) {
        const pages = Object.values(data.query.pages) as any[]
        const wikiResults: Array<{ title: string; imageUrl: string; source: string }> = []
        for (const page of pages) {
          const imgUrl = page?.thumbnail?.source || page?.original?.source
          if (imgUrl && !imgUrl.endsWith('.svg') && !imgUrl.endsWith('.ogg')) {
            wikiResults.push({
              title: page.title?.replace(/^File:/, '')?.replace(/\.[^/.]+$/, '') || trimmed,
              imageUrl: imgUrl,
              source: 'Google / Web',
            })
          }
        }
        if (wikiResults.length > 0) {
          return wikiResults
        }
      }
    }
  } catch (err) {
    console.warn('Wikimedia live search error:', err)
  }

  // 4. Local curated theme matches (STRICT keyword match only!)
  const strictMatches = getAllMatchingThemeImages(trimmed, true)
  if (strictMatches.length > 0) {
    return strictMatches.map(m => ({
      title: m.title,
      imageUrl: m.imageUrl,
      source: 'Bộ sưu tập HD',
    }))
  }

  return []
}
