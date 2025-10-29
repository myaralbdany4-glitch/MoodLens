import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Brain, Camera, Mic, History, LogOut, User, Sparkles, TrendingUp } from "lucide-react";
import type { MoodSession } from "@/shared/types";

export default function Dashboard() {
  const { user, logout, isPending } = useAuth();
  const navigate = useNavigate();
  const [recentSessions, setRecentSessions] = useState<MoodSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchRecentSessions();
    }
  }, [user]);

  const fetchRecentSessions = async () => {
    try {
      const response = await fetch("/api/mood-history?limit=5");
      if (response.ok) {
        const sessions = await response.json();
        setRecentSessions(sessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "face":
        return <Camera className="w-4 h-4" />;
      case "voice":
        return <Mic className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 6) return "text-yellow-600 bg-yellow-100";
    if (score >= 4) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  if (isPending || loading) {
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
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MoodLens</h1>
                <p className="text-sm text-gray-600">مرحباً، {user?.google_user_data.given_name || user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse bg-indigo-50 px-3 py-2 rounded-lg">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">{user?.google_user_data.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="تسجيل خروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            أهلاً وسهلاً! 👋
          </h2>
          <p className="text-lg text-gray-600">
            كيف تشعر اليوم؟ دعنا نحلل حالتك المزاجية ونساعدك على تحسينها
          </p>
        </div>

        {/* Analysis Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => navigate("/analysis?type=face")}
            className="group p-8 bg-white rounded-2xl border border-indigo-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 text-right"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="w-6 h-6 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">تحليل تعبيرات الوجه</h3>
            <p className="text-gray-600 mb-4">
              استخدم الكاميرا لتحليل مشاعرك من خلال تعبيرات وجهك
            </p>
            <div className="text-indigo-600 font-medium group-hover:text-indigo-700">
              ابدأ التحليل ←
            </div>
          </button>

          <button
            onClick={() => navigate("/analysis?type=voice")}
            className="group p-8 bg-white rounded-2xl border border-cyan-100 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 text-right"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="w-6 h-6 text-cyan-400 group-hover:text-cyan-600 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">تحليل نبرة الصوت</h3>
            <p className="text-gray-600 mb-4">
              سجل مقطع صوتي لتحليل مشاعرك من خلال نبرة صوتك
            </p>
            <div className="text-cyan-600 font-medium group-hover:text-cyan-700">
              ابدأ التحليل ←
            </div>
          </button>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <History className="w-6 h-6 text-gray-500" />
              <h3 className="text-xl font-bold text-gray-900">جلسات التحليل الأخيرة</h3>
            </div>
            {recentSessions.length > 0 && (
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>{recentSessions.length} جلسة</span>
              </div>
            )}
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد جلسات بعد</h4>
              <p className="text-gray-600 mb-6">ابدأ أول تحليل لمزاجك لتتمكن من رؤية تقدمك هنا</p>
              <button
                onClick={() => navigate("/analysis")}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                ابدأ التحليل الآن
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => {
                const analysis = JSON.parse(session.mood_analysis);
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        {getSessionTypeIcon(session.session_type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 space-x-reverse mb-1">
                          <span className="font-medium text-gray-900">
                            {session.session_type === "face" ? "تحليل الوجه" : "تحليل الصوت"}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(analysis.moodScore)}`}>
                            {analysis.moodScore}/10
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(session.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {analysis.confidence}% دقة
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
