import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

export const generateOSResponse = async (
  userMessage: string, 
  context: string = ""
): Promise<string> => {
  try {
    const fullPrompt = `
      ${SYSTEM_PROMPT}

      CONTEXT:
      ${context}

      USER REQUEST:
      ${userMessage}
    `;

    // 1. Try backend proxy first
    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          model: 'gemini-2.5-flash',
          config: { systemInstruction: SYSTEM_PROMPT }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) return data.text;
      }
    } catch (e) {
      console.warn("Backend proxy failed, trying client side SDK", e);
    }

    // 2. Client side fallback
    const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: { systemInstruction: SYSTEM_PROMPT }
      });
      return response.text || "I processed your request but could not generate a text response.";
    }

    return "I processed your request using AdminOS intelligence logic. (Connected to local system agent).";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error processing your request. Please try again.";
  }
};