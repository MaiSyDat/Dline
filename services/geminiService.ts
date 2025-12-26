/**
 * Gemini AI Service (Server Action)
 * 
 * Server Action để gọi Gemini AI API
 * Chạy trên server side để bảo mật API key
 */

'use server';

import { GoogleGenAI } from "@google/genai";
import { Task, User } from "@/types";

/**
 * Lấy AI insights từ Gemini Flash model
 * Phân tích tasks và employees để đưa ra insights
 * 
 * @param tasks - Danh sách tasks
 * @param employees - Danh sách employees (users)
 * @returns Promise<string> - AI insights text
 */
export async function getGeminiInsights(tasks: Task[], employees: User[]): Promise<string> {
  // Validate API key - sử dụng GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    return "AI insights không khả dụng. Vui lòng cấu hình GEMINI_API_KEY trong environment variables.";
  }

  try {
    // Initialize GoogleGenAI only on server side
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Analyze the following task list and employee roster for "D-Line Task Manager".
      Identify:
      1. Who has the highest workload?
      2. Are there any critical deadlines (tasks due in < 2 days) that might be missed?
      3. Suggest one way to rebalance the team.
      
      Tasks: ${JSON.stringify(tasks, null, 2)}
      Employees: ${JSON.stringify(employees.map(e => ({ id: e.id, name: e.name, role: e.role })), null, 2)}
      
      Provide the response in a professional, encouraging tone for a manager.
      Keep the response concise and actionable (max 200 words).
    `;

    // Sử dụng ai.models.generateContent với model name đúng
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Sử dụng model mới nhất
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    return response.text || "Không thể tạo insights tại thời điểm này.";
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Gemini Error:", error);
    }
    return "Không thể tạo AI insights tại thời điểm này. Vui lòng thử lại sau.";
  }
}
