import { useAuth } from "@getmocha/users-service/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Brain, CheckCircle } from "lucide-react";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/");
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center" dir="rtl">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Brain className="w-10 h-10 text-white" />
          </div>
          {user && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {user ? "تم تسجيل الدخول بنجاح!" : "جاري تسجيل الدخول..."}
        </h1>

        <p className="text-gray-600 mb-8">
          {user 
            ? "سيتم توجيهك إلى لوحة التحكم خلال لحظات"
            : "يرجى الانتظار بينما نقوم بتسجيل دخولك"
          }
        </p>

        <div className="flex justify-center">
          <div className="flex space-x-1 space-x-reverse">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
