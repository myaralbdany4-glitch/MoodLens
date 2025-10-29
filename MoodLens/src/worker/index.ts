import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie } from "hono/cookie";
import OpenAI from "openai";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// OAuth routes
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: (c.env as any).MOCHA_USERS_SERVICE_API_URL,
    apiKey: (c.env as any).MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: (c.env as any).MOCHA_USERS_SERVICE_API_URL,
    apiKey: (c.env as any).MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  // Check if user profile exists, create if not
  const existingProfile = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (!existingProfile) {
    await c.env.DB.prepare(
      "INSERT INTO user_profiles (user_id, preferred_language) VALUES (?, ?)"
    ).bind(user.id, "ar").run();
  }

  return c.json(user);
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: (c.env as any).MOCHA_USERS_SERVICE_API_URL,
      apiKey: (c.env as any).MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Mood analysis endpoints
app.post("/api/analyze/face", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const { imageData } = await c.req.json();

    if (!imageData) {
      return c.json({ error: "صورة مطلوبة للتحليل" }, 400);
    }

    const openai = new OpenAI({
      apiKey: (c.env as any).OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `أنت خبير في تحليل المشاعر من خلال تعبيرات الوجه. قم بتحليل الصورة وتحديد:
1. المشاعر الأساسية المكتشفة (سعادة، حزن، غضب، خوف، مفاجأة، اشمئزاز، هدوء)
2. درجة الثقة في التحليل (0-100%)
3. تقييم عام للحالة المزاجية
4. نصائح مخصصة لتحسين المزاج

استجب بـ JSON فقط بهذا التنسيق:
{
  "emotions": [{"name": "اسم المشاعر", "confidence": النسبة}],
  "overallMood": "تقييم عام",
  "moodScore": رقم من 1-10,
  "confidence": نسبة الثقة الإجمالية,
  "recommendations": ["نصيحة 1", "نصيحة 2", "نصيحة 3"]
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "حلل هذه الصورة لتحديد الحالة المزاجية والمشاعر"
            },
            {
              type: "image_url",
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No analysis content received");
    }
    
    const analysis = JSON.parse(content);

    // Save to database
    const sessionResult = await c.env.DB.prepare(
      `INSERT INTO mood_sessions 
       (user_id, session_type, mood_analysis, emotions_detected, confidence_score, ai_recommendations) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      user!.id,
      "face",
      JSON.stringify(analysis),
      JSON.stringify(analysis.emotions),
      analysis.confidence,
      JSON.stringify(analysis.recommendations)
    ).run();

    return c.json({
      sessionId: sessionResult.meta.last_row_id,
      analysis
    });

  } catch (error) {
    console.error("Face analysis error:", error);
    return c.json({ error: "خطأ في تحليل الصورة" }, 500);
  }
});

app.post("/api/analyze/voice", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const formData = await c.req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return c.json({ error: "ملف صوتي مطلوب للتحليل" }, 400);
    }

    const openai = new OpenAI({
      apiKey: (c.env as any).OPENAI_API_KEY,
    });

    // Transcribe audio first
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ar"
    });

    // Analyze emotions from text
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `أنت خبير في تحليل المشاعر من النص والكلام. قم بتحليل النص التالي وتحديد:
1. المشاعر المكتشفة من النبرة والكلمات
2. الحالة النفسية العامة
3. مستوى التوتر أو الاسترخاء
4. نصائح مخصصة للتحسين

استجب بـ JSON فقط بهذا التنسيق:
{
  "emotions": [{"name": "اسم المشاعر", "confidence": النسبة}],
  "overallMood": "تقييم عام",
  "moodScore": رقم من 1-10,
  "confidence": نسبة الثقة الإجمالية,
  "transcription": "النص المكتوب",
  "recommendations": ["نصيحة 1", "نصيحة 2", "نصيحة 3"]
}`
        },
        {
          role: "user",
          content: `حلل هذا النص لتحديد المشاعر والحالة المزاجية: "${transcription.text}"`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No analysis content received");
    }
    
    const analysis = JSON.parse(content);

    // Save to database
    const sessionResult = await c.env.DB.prepare(
      `INSERT INTO mood_sessions 
       (user_id, session_type, mood_analysis, emotions_detected, confidence_score, ai_recommendations) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      user!.id,
      "voice",
      JSON.stringify(analysis),
      JSON.stringify(analysis.emotions),
      analysis.confidence,
      JSON.stringify(analysis.recommendations)
    ).run();

    return c.json({
      sessionId: sessionResult.meta.last_row_id,
      analysis
    });

  } catch (error) {
    console.error("Voice analysis error:", error);
    return c.json({ error: "خطأ في تحليل الصوت" }, 500);
  }
});

// Get user's mood history
app.get("/api/mood-history", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  const limit = c.req.query("limit") || "10";

  const sessions = await c.env.DB.prepare(
    `SELECT * FROM mood_sessions 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`
  ).bind(user.id, parseInt(limit)).all();

  return c.json(sessions.results);
});

// Submit feedback for recommendations
app.post("/api/feedback/:sessionId", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  const sessionId = c.req.param("sessionId");
  const { rating } = await c.req.json();

  await c.env.DB.prepare(
    "UPDATE mood_sessions SET user_feedback = ? WHERE id = ? AND user_id = ?"
  ).bind(rating, sessionId, user.id).run();

  return c.json({ success: true });
});

export default app;
