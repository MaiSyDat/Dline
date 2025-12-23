
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Employee } from "../types";

export const getGeminiInsights = async (tasks: Task[], employees: Employee[]) => {
  // Fix: Use the process.env.API_KEY string directly for initialization.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the following task list and employee roster for "D-Line Task Manager".
    Identify:
    1. Who has the highest workload?
    2. Are there any critical deadlines (tasks due in < 2 days) that might be missed?
    3. Suggest one way to rebalance the team.
    
    Tasks: ${JSON.stringify(tasks)}
    Employees: ${JSON.stringify(employees)}
    
    Provide the response in a professional, encouraging tone for a manager.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate AI insights at this time.";
  }
};
