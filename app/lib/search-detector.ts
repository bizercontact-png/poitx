// کلمات کلیدی که نیاز به جستجوی اینترنت دارن
const SEARCH_TRIGGERS = [
  'آخرین خبر',
  'اخبار',
  'جستجو کن',
  'سرچ کن',
  'بگرد',
  'پیدا کن',
  'اطلاعات',
  'اطلاعات جدید',
  'تاریخچه',
  'زندگی‌نامه',
  'تحقیق',
  'بررسی کن',
  'چیست',
  'کیست',
  'کجاست',
  'چه زمانی',
  'قیمت',
  'قیمت امروز',
  'نرخ ارز',
  'قیمت دلار',
  'قیمت طلا',
  'آب و هوا',
  'پیش‌بینی هوا',
  'امروز',
  'فردا',
  'هفته آینده',
  'سال ۲۰۲۶',
  'سال ۲۰۲۵',
  'جدیدترین',
  'آپدیت',
  'ورزشی',
  'نتایج بازی',
  'لیگ برتر',
  'جام جهانی'
]

// الگوهای تشخیص نیاز به جستجو
const PATTERNS = [
  /^(اخبار|خبرهای) .+/i,
  /^(آخرین) .+ (اخبار|خبرها)/i,
  /(.+) (چیست|کیست|کجاست|چه زمانی)$/i,
  /(قیمت|نرخ) (.+)/i,
  /آب و هوا (.+)/i,
  /پیش‌بینی هوا (.+)/i,
  /تحقیق (درباره|در مورد) (.+)/i,
  /اطلاعات (در مورد|درباره) (.+)/i,
  /جستجو (کن )?(برای )?(.+)/i
]

export function needsSearch(query: string): boolean {
  // چک کردن کلمات کلیدی
  for (const trigger of SEARCH_TRIGGERS) {
    if (query.includes(trigger)) {
      return true
    }
  }

  // چک کردن الگوها
  for (const pattern of PATTERNS) {
    if (pattern.test(query)) {
      return true
    }
  }

  // تشخیص سوالات به‌روز
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  
  if (query.includes(currentYear.toString()) || 
      query.includes('امروز') || 
      query.includes('فردا') ||
      query.includes('دیروز')) {
    return true
  }

  return false
}

export function extractSearchQuery(query: string): string {
  // استخراج عبارت جستجو از متن
  let searchQuery = query

  // حذف کلمات اضافی
  const patterns = [
    /^(اخبار|خبرهای) /i,
    /^آخرین (اخبار|خبرهای) /i,
    / (.+) (چیست|کیست|کجاست|چه زمانی)$/i,
    /(قیمت|نرخ) /i,
    /آب و هوا /i,
    /پیش‌بینی هوا /i,
    /تحقیق (درباره|در مورد) /i,
    /اطلاعات (در مورد|درباره) /i,
    /جستجو (کن )?(برای )?/i
  ]

  for (const pattern of patterns) {
    searchQuery = searchQuery.replace(pattern, '')
  }

  return searchQuery.trim()
}
