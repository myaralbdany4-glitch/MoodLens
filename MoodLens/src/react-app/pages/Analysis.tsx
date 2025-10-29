import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Camera, Mic, ArrowLeft, Square, RotateCcw, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import type { MoodAnalysis } from "@/shared/types";

export default function Analysis() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "face";
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Face analysis states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Voice analysis states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (type === "face") {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [type]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      setError("لا يمكن الوصول إلى الكاميرا. يرجى التأكد من إعطاء الإذن للموقع");
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
  };

  const analyzeFace = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch("/api/analyze/face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData: capturedImage }),
      });
      
      if (!response.ok) {
        throw new Error("فشل في تحليل الصورة");
      }
      
      const data = await response.json();
      setResult(data.analysis);
    } catch (error) {
      setError("حدث خطأ أثناء تحليل الصورة. يرجى المحاولة مرة أخرى");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(audioStream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(blob);
        audioStream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      setError("لا يمكن الوصول إلى الميكروفون. يرجى التأكد من إعطاء الإذن للموقع");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const analyzeVoice = async () => {
    if (!audioBlob) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      
      const response = await fetch("/api/analyze/voice", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("فشل في تحليل الصوت");
      }
      
      const data = await response.json();
      setResult(data.analysis);
    } catch (error) {
      setError("حدث خطأ أثناء تحليل الصوت. يرجى المحاولة مرة أخرى");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setError(null);
    setCapturedImage(null);
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-100 border-green-200";
    if (score >= 6) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    if (score >= 4) return "text-orange-600 bg-orange-100 border-orange-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

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
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                type === "face" 
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500" 
                  : "bg-gradient-to-r from-cyan-500 to-blue-500"
              }`}>
                {type === "face" ? <Camera className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {type === "face" ? "تحليل تعبيرات الوجه" : "تحليل نبرة الصوت"}
                </h1>
                <p className="text-sm text-gray-600">
                  {type === "face" ? "استخدم الكاميرا لتحليل مشاعرك" : "سجل مقطع صوتي لتحليل مشاعرك"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 space-x-reverse">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="mb-8 bg-white rounded-2xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">تم التحليل بنجاح!</h2>
              <p className="text-gray-600">إليك نتائج تحليل حالتك المزاجية</p>
            </div>

            {/* Mood Score */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold border-2 ${getMoodColor(result.moodScore)}`}>
                {result.moodScore}/10
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{result.overallMood}</h3>
              <p className="text-gray-600">دقة التحليل: {result.confidence}%</p>
            </div>

            {/* Emotions */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">المشاعر المكتشفة</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {result.emotions.map((emotion, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-lg font-medium text-gray-900 mb-1">{emotion.name}</div>
                    <div className="text-sm text-gray-600">{emotion.confidence}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transcription for voice */}
            {result.transcription && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">النص المكتوب</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 leading-relaxed">{result.transcription}</p>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">نصائح لتحسين مزاجك</h4>
              <div className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 space-x-reverse p-4 bg-indigo-50 rounded-xl">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-indigo-900 leading-relaxed">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4 space-x-reverse">
              <button
                onClick={resetAnalysis}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                تحليل جديد
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                العودة للوحة التحكم
              </button>
            </div>
          </div>
        )}

        {/* Face Analysis Interface */}
        {type === "face" && !result && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">تحليل تعبيرات الوجه</h2>
              <p className="text-gray-600">انظر إلى الكاميرا بتعبير طبيعي والتقط صورة لتحليل مشاعرك</p>
            </div>

            <div className="relative max-w-md mx-auto mb-8">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto rounded-xl border border-gray-200"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {capturedImage && (
                <div className="absolute inset-0 bg-black bg-opacity-75 rounded-xl flex items-center justify-center">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="max-w-full max-h-full rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="text-center space-y-4">
              {!capturedImage ? (
                <button
                  onClick={captureImage}
                  disabled={!stream}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-3 space-x-reverse"
                >
                  <Camera className="w-5 h-5" />
                  <span>التقط صورة</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={analyzeFace}
                    disabled={isAnalyzing}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-3 space-x-reverse"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري التحليل...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>تحليل المشاعر</span>
                      </>
                    )}
                  </button>
                  <div>
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors inline-flex items-center space-x-2 space-x-reverse"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>التقط صورة جديدة</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voice Analysis Interface */}
        {type === "voice" && !result && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">تحليل نبرة الصوت</h2>
              <p className="text-gray-600">تحدث بطبيعية لمدة 10-30 ثانية لتحليل مشاعرك من نبرة صوتك</p>
            </div>

            <div className="text-center mb-8">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isRecording 
                  ? "bg-gradient-to-r from-red-500 to-pink-500 animate-pulse" 
                  : audioBlob
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500"
              }`}>
                {isRecording ? (
                  <Square className="w-12 h-12 text-white" />
                ) : audioBlob ? (
                  <CheckCircle className="w-12 h-12 text-white" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </div>

              {isRecording && (
                <div className="text-2xl font-bold text-gray-900 mb-4">
                  {formatTime(recordingTime)}
                </div>
              )}

              <div className="space-y-4">
                {!audioBlob ? (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 inline-flex items-center space-x-3 space-x-reverse ${
                      isRecording
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-5 h-5" />
                        <span>إيقاف التسجيل</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        <span>بدء التسجيل</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={analyzeVoice}
                      disabled={isAnalyzing}
                      className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-3 space-x-reverse"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>جاري التحليل...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>تحليل المشاعر</span>
                        </>
                      )}
                    </button>
                    <div>
                      <button
                        onClick={() => {setAudioBlob(null); setRecordingTime(0);}}
                        className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors inline-flex items-center space-x-2 space-x-reverse"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>تسجيل جديد</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
