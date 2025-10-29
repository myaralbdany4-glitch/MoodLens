import z from "zod";

// Mood analysis types
export const EmotionSchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(100)
});

export const MoodAnalysisSchema = z.object({
  emotions: z.array(EmotionSchema),
  overallMood: z.string(),
  moodScore: z.number().min(1).max(10),
  confidence: z.number().min(0).max(100),
  transcription: z.string().optional(),
  recommendations: z.array(z.string())
});

export const MoodSessionSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  session_type: z.enum(['face', 'voice', 'combined']),
  mood_analysis: z.string(), // JSON string
  emotions_detected: z.string(), // JSON string
  confidence_score: z.number().nullable(),
  ai_recommendations: z.string(), // JSON string
  user_feedback: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const UserProfileSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  age_range: z.string().nullable(),
  preferred_language: z.string(),
  timezone: z.string().nullable(),
  mood_tracking_enabled: z.number(), // SQLite boolean as number
  notification_preferences: z.string().nullable(), // JSON string
  created_at: z.string(),
  updated_at: z.string()
});

export type Emotion = z.infer<typeof EmotionSchema>;
export type MoodAnalysis = z.infer<typeof MoodAnalysisSchema>;
export type MoodSession = z.infer<typeof MoodSessionSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
