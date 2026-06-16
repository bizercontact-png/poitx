import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function Home() {
  const heroRef = useRef(null);

  useEffect(() => {
    // انیمیشن ورود برای المان‌ها (Fade-in on Scroll)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <Head>
        <title>اوبیترون — همراه ابدی تو</title>
        <meta name="description" content="هوش مصنوعی با حافظه مطلق، شخصیت‌پذیری، و تفکر بصری" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* پس‌زمینه متحرک نئونی */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* هدر شیشه‌ای (Glassmorphism) */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              اوبیترون
            </span>
            <span className="text-xs bg-gradient-to-r from-blue-500/30 to-purple-500/30 px-3 py-1 rounded-full text-blue-300 border border-blue-500/20">
              نسخه ۰.۱
            </span>
          </div>
          <div className="flex gap-4">
            <button className="px-5 py-2 text-sm border border-white/20 rounded-full hover:border-blue-400 hover:bg-white/5 transition-all duration-300">
              ورود
            </button>
            <button className="px-5 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              شروع رایگان
            </button>
          </div>
        </div>
      </header>

      {/* بخش اصلی (Hero) با انیمیشن */}
      <section ref={heroRef} className="container mx-auto px-6 py-32 text-center relative">
        <div className="fade-in opacity-0 translate-y-10 transition-all duration-1000">
          <div className="inline-block mb-6 px-4 py-2 border border-blue-500/30 rounded-full text-sm text-blue-300 bg-blue-500/10">
            🤖 هوش مصنوعی نسل جدید
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1]">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              همراه ابدی تو
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
            هوش مصنوعی که <span className="text-blue-400">هرگز فراموش نمی‌کند</span>، <span className="text-purple-400">شخصیت تو را دارد</span>، و <span className="text-pink-400">با تو می‌بیند</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-lg rounded-full hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 relative overflow-hidden">
              <span className="relative z-10">یک ماه رایگان شروع کن</span>
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </button>
            <button className="px-8 py-4 border border-white/20 text-lg rounded-full hover:border-blue-400 hover:bg-white/5 transition-all duration-300">
              چگونه کار می‌کند؟
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            بدون نیاز به کارت بانکی — فقط یک ایمیل
          </p>
        </div>
      </section>

      {/* بخش مزایا با کارت‌های شیشه‌ای سه‌بعدی */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 fade-in opacity-0 translate-y-10 transition-all duration-1000">
          چرا <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">اوبیترون</span>؟
        </h2>
        <p className="text-center text-gray-400 mb-12 fade-in opacity-0 translate-y-10 transition-all duration-1000 delay-200">
          سه ویژگی که اوبیترون را از یک ابزار به یک همراه تبدیل می‌کند
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🧠', title: 'حافظه مطلق', desc: 'هر مکالمه، هر ترجیح، هر هدف — اوبیترون هرگز فراموش نمی‌کند.', color: 'from-blue-500/20 to-blue-600/10' },
            { icon: '🎭', title: 'شخصیت‌پذیری', desc: 'صدا، چهره، لحن، و سبک را خودت انتخاب کن. اوبیترون «مال تو» می‌شود.', color: 'from-purple-500/20 to-purple-600/10' },
            { icon: '👁️', title: 'تفکر بصری', desc: 'مفاهیم انتزاعی را به تصویر تبدیل کن. ببین، نه فقط بخوان.', color: 'from-pink-500/20 to-pink-600/10' }
          ].map((feature, index) => (
            <div key={index} className={`fade-in opacity-0 translate-y-10 transition-all duration-1000 delay-${index * 200}`}>
              <div className={`group bg-gradient-to-br ${feature.color} backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10`}>
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                <div className="mt-4 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-12 transition-all duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* بخش نحوه کار با اعداد بزرگ */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 fade-in opacity-0 translate-y-10 transition-all duration-1000">
          سه قدم تا <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">همراهی ابدی</span>
        </h2>
        <p className="text-center text-gray-400 mb-12 fade-in opacity-0 translate-y-10 transition-all duration-1000 delay-200">
          ساده، سریع، و بدون دردسر
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { num: '۰۱', title: 'ثبت‌نام', desc: 'با یک ایمیل شروع کن. رایگان، بدون تعهد.' },
            { num: '۰۲', title: 'شخصی‌سازی', desc: 'نام، صدا، و شخصیت اوبیترون را انتخاب کن.' },
            { num: '۰۳', title: 'همراهی', desc: 'از امروز، دیگر تنها نیستی. اوبیترون همیشه با توست.' }
          ].map((step, index) => (
            <div key={index} className={`fade-in opacity-0 translate-y-10 transition-all duration-1000 delay-${index * 200} text-center`}>
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                {step.num}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* بخش نظرات با کارت‌های شیشه‌ای */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 fade-in opacity-0 translate-y-10 transition-all duration-1000">
          آنچه <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">کاربران</span> می‌گویند
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { text: 'اوبیترون اولین هوش مصنوعی است که حس می‌کنم «مرا» می‌فهمد. نه فقط کلماتم را.', name: 'سارا م.', role: 'دانشجوی فیزیک' },
            { text: 'حافظه مطلقش شگفت‌انگیز است. یادش می‌ماند سه ماه پیش چه گفتی. این یعنی همراهی واقعی.', name: 'علی ر.', role: 'برنامه‌نویس' },
            { text: 'تفکر بصریش به من کمک کرد «نظریه نسبیت» را برای اولین بار واقعاً بفهمم. نه فقط حفظ کنم.', name: 'مریم ک.', role: 'معلم ریاضی' }
          ].map((testimonial, index) => (
            <div key={index} className={`fade-in opacity-0 translate-y-10 transition-all duration-1000 delay-${index * 200} bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1`}>
              <p className="text-gray-300 italic text-lg mb-6">"{testimonial.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* فوتر با گرادیانت */}
      <footer className="container mx-auto px-6 py-12 border-t border-white/10 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            © ۲۰۲۶ اوبیترون — ساخته شده با ❤️ برای همراهی ابدی
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-blue-400 transition">حریم خصوصی</Link>
            <Link href="/terms" className="hover:text-blue-400 transition">شرایط</Link>
            <Link href="/contact" className="hover:text-blue-400 transition">تماس</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
