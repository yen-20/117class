import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getAssignmentFeedback = async (
  assignmentContent: string,
  assignmentTitle: string
): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock response.");
    return "API Key 未設定。這是一個模擬的回饋：作業寫得不錯，但請嘗試加入更多個人觀點。";
  }

  try {
    const prompt = `
      你是一位親切且專業的老師。學生剛提交了一份標題為「${assignmentTitle}」的心得作業。
      
      內容如下：
      "${assignmentContent}"

      請給予這位學生 50-100 字左右的建設性回饋。
      語氣要鼓勵、正面，並具體指出一個優點和一個可以改進的地方。
      直接以老師的口吻回覆，不需要開頭問候。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "無法產生回饋，請稍後再試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "系統暫時無法產生 AI 回饋，請聯絡老師。";
  }
};