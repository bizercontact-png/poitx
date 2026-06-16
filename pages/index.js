import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>اوبیترون — همراه ابدی تو</title>
        <meta name="description" content="هوش مصنوعی با حافظه مطلق، شخصیت‌پذیری، و تفکر بصری" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* هدر */}
      <header className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            اوبیترون
          </span>
          <span className="text-xs bg-blue-500/20 px-2 py-1 rounded-full text-blue-300">نسخه ۰.۱</span>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:border-blue-400 transition">
            ورود
          </button>
          <button className="px-4 py-2 text-sm bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            شروع رایگان
          </button>
        </div>
      </header>

      {/* بخش اصلی */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            همراه ابدی تو
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
          هوش مصنوعی که <span className="text-blue-400">هرگز فراموش نمی‌کند</span>، <span className="text-purple-400">شخصیت تو را دارد</span>، و <span className="text-pink-400">با تو می‌بیند</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-blue-600 text-lg rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25">
            یک ماه رایگان شروع کن
          </button>
          <button className="px-8 py-4 border border-gray-600 text-lg rounded-xl hover:border-blue-400 transition">
            چگونه کار می‌کند؟
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">⚡ بدون نیاز به کارت بانکی — فقط یک ایمیل</p>
      </section>

      {/* مزایا */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          چرا <span className="text-blue-400">اوبیترون</span>؟
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-blue-500 transition">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2">حافظه مطلق</h3>
            <p className="text-gray-400 text-sm">هر مکالمه، هر ترجیح، هر هدف — اوبیترون هرگز فراموش نمی‌کند.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-blue-500 transition">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-bold mb-2">شخصیت‌پذیری</h3>
            <p className="text-gray-400 text-sm">صدا، چهره، لحن، و سبک را خودت انتخاب کن. اوبیترون «مال تو» می‌شود.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-blue-500 transition">
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="text-xl font-bold mb-2">تفکر بصری</h3>
            <p className="text-gray-400 text-sm">مفاهیم انتزاعی را به تصویر تبدیل کن. ببین، نه فقط بخوان.</p>
          </div>
        </div>
      </section>

      {/* نحوه کار */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          سه قدم تا <span className="text-purple-400">همراهی ابدی</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">۱</div>
            <h3 className="text-xl font-semibold mb-2">ثبت‌نام</h3>
            <p className="text-gray-400 text-sm">با یک ایمیل شروع کن. رایگان، بدون تعهد.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">۲</div>
            <h3 className="text-xl font-semibold mb-2">شخصی‌سازی</h3>
            <p className="text-gray-400 text-sm">نام، صدا، و شخصیت اوبیترون را انتخاب کن.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">۳</div>
            <h3 className="text-xl font-semibold mb-2">همراهی</h3>
            <p className="text-gray-400 text-sm">از امروز، دیگر تنها نیستی. اوبیترون همیشه با توست.</p>
          </div>
        </div>
      </section>

      {/* نظرات */}
      <section className="container mx-auto px-6 py-20 bg-gray-800/30 rounded-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          آنچه <span className="text-pink-400">کاربران</span> می‌گویند
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <p className="text-gray-300 italic mb-4">"اوبیترون اولین هوش مصنوعی است که حس می‌کنم «مرا» می‌فهمد."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              <div>
                <p className="font-semibold text-sm">سارا م.</p>
                <p className="text-gray-500 text-xs">دانشجوی فیزیک</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <p className="text-gray-300 italic mb-4">"حافظه مطلقش شگفت‌انگیز است. یادش می‌ماند سه ماه پیش چه گفتم."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              <div>
                <p className="font-semibold text-sm">علی ر.</p>
                <p className="text-gray-500 text-xs">برنامه‌نویس</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <p className="text-gray-300 italic mb-4">"تفکر بصریش به من کمک کرد «نظریه نسبیت» را واقعاً بفهمم."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              <div>
                <p className="font-semibold text-sm">مریم ک.</p>
                <p className="text-gray-500 text-xs">معلم ریاضی</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* فوتر */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-800 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">© ۲۰۲۶ اوبیترون — ساخته شده با ❤️ برای همراهی ابدی</div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300">حریم خصوصی</Link>
            <Link href="/terms" className="hover:text-gray-300">شرایط</Link>
            <Link href="/contact" className="hover:text-gray-300">تماس</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
