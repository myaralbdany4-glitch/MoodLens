import { useAuth } from "@getmocha/users-service/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Brain, Camera, Mic, Sparkles, Heart, Users } from "lucide-react";

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && user) {
      navigate("/dashboard");
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              MoodLens
            </h1>
          </div>
          <button
            onClick={redirectToLogin}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            تسجيل الدخول
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-full mb-8">
            <Sparkles className="w-10 h-10 text-indigo-600" />
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            اكتشف حالتك المزاجية
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              بالذكاء الاصطناعي
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            استخدم تقنية الذكاء الاصطناعي المتطورة لتحليل مشاعرك من خلال الوجه أو الصوت،
            واحصل على نصائح مخصصة لتحسين مزاجك ورفاهيتك النفسية
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-12">
            <div className="group p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">تحليل الوجه</h3>
              <p className="text-gray-600">
                حلل مشاعرك من خلال تعبيرات وجهك باستخدام تقنية التعرف على المشاعر
              </p>
            </div>

            <div className="group p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-100 hover:border-cyan-200 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">تحليل الصوت</h3>
              <p className="text-gray-600">
                اكتشف حالتك المزاجية من خلال نبرة صوتك وطريقة كلامك
              </p>
            </div>
          </div>

          <button
            onClick={redirectToLogin}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-lg font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center space-x-3 space-x-reverse"
          >
            <span>ابدأ التحليل الآن</span>
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">لماذا MoodLens؟</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            نحن نساعدك على فهم مشاعرك بشكل أفضل وتحسين صحتك النفسية
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Brain className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">ذكاء اصطناعي متطور</h4>
            <p className="text-gray-600">
              نستخدم أحدث تقنيات الذكاء الاصطناعي من OpenAI وGoogle لتحليل دقيق للمشاعر
            </p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-10 h-10 text-pink-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">نصائح مخصصة</h4>
            <p className="text-gray-600">
              احصل على توصيات مخصصة لتحسين مزاجك بناءً على تحليل حالتك المزاجية
            </p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-10 h-10 text-amber-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">مناسب للجميع</h4>
            <p className="text-gray-600">
              مصمم خصيصاً للمراهقين والبالغين لزيادة الوعي الذاتي وتقليل التوتر
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-100 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 space-x-reverse mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">MoodLens</span>
          </div>
          <p className="text-gray-600">
            اكتشف مشاعرك، حسّن مزاجك، اعتنِ بصحتك النفسية
          </p>
        </div>
      </footer>
    </div>
  );
}
