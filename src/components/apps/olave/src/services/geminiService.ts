import { GoogleGenAI, Type } from "@google/genai";

export class AyaEyeService {
  private getAiInstance(): GoogleGenAI | null {
    try {
      const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                     (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';
      return new GoogleGenAI({ apiKey });
    } catch {
      return null;
    }
  }

  async generateMascot() {
    try {
      const ai = this.getAiInstance();
      if (!ai) return null;

      const prompt = "High-quality 3D cute cartoon cat-squirrel hybrid mascot named Akorn with a big fluffy tail, street style with silver chain and wristbands, energetic rock pose, vibrant colors, cinematic lighting, stylized background, high resolution.";
      
      try {
        const imgResponse = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
          },
        });
        const imgBytes = imgResponse?.generatedImages?.[0]?.image?.imageBytes;
        if (imgBytes) {
          return `data:image/jpeg;base64,${imgBytes}`;
        }
      } catch {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ text: prompt }] },
        });
        if (response?.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.warn("AyaEye Splash Generation Error:", error);
      return null;
    }
  }

  async generateDirectorMascot() {
    try {
      const ai = this.getAiInstance();
      if (!ai) return null;

      const prompt = "Cute 3D animated cat-squirrel hybrid cartoon mascot character named Akorn sitting comfortably in a director's chair with a megaphone, wearing sunglasses and cool chain necklace, fluffy squirrel tail, cat ears, high quality 3d character render, isolated on clean dark background.";
      
      try {
        const imgResponse = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
          },
        });
        const imgBytes = imgResponse?.generatedImages?.[0]?.image?.imageBytes;
        if (imgBytes) {
          return `data:image/jpeg;base64,${imgBytes}`;
        }
      } catch {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ text: prompt }] },
        });
        if (response?.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.warn("AyaEye Icon Generation Error:", error);
      return null;
    }
  }

  async generateSmartCaptions(base64Image: string) {
    try {
      const ai = this.getAiInstance();
      if (!ai) return ["Cinematic Moment", "AyaEye View", "Masterpiece"];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              { text: "Analyze this video frame and suggest 3 catchy, short captions for a social media post. Return as a JSON array of strings." },
              { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (error) {
      return ["Cinematic Moment", "AyaEye View", "Masterpiece"];
    }
  }

  async describeScene(base64Image: string) {
     try {
      const ai = this.getAiInstance();
      if (!ai) return null;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              { text: "Analyze this frame. Describe the visual mood and lighting. Suggest a cinematic 'Look' name. Provide numeric color grading suggestions for: brightness, contrast, saturation, vibrancy, and gamma (relative to 100 as default). ALSO, suggest a genre and style of background music that would fit this scene, and a list of 3-5 specific sound effects (SFX) that would enhance this specific content. Return in JSON format." },
              { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
            ]
          }
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    mood: { type: Type.STRING },
                    lookName: { type: Type.STRING },
                    colorAdvice: { type: Type.STRING },
                    suggestedMusic: { type: Type.STRING },
                    suggestedSFX: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedFilters: {
                        type: Type.OBJECT,
                        properties: {
                            brightness: { type: Type.NUMBER },
                            contrast: { type: Type.NUMBER },
                            saturation: { type: Type.NUMBER },
                            vibrancy: { type: Type.NUMBER },
                            gamma: { type: Type.NUMBER }
                        }
                    }
                },
                required: ['mood', 'lookName', 'colorAdvice', 'suggestedFilters', 'suggestedMusic', 'suggestedSFX']
            }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      return null;
    }
  }

  async analyzeBackground(base64Image: string) {
    try {
      const ai = this.getAiInstance();
      if (!ai) return { confidence: 50, description: "Unknown Subject", rect: { x: 25, y: 25, w: 50, h: 50 } };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              { text: "Identify the primary subject and determine its bounding box coordinates (x, y, width, height as percentages 0-100). Return in JSON format." },
              { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
            ]
          }
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    confidence: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                    rect: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        w: { type: Type.NUMBER },
                        h: { type: Type.NUMBER }
                      },
                      required: ['x', 'y', 'w', 'h']
                    }
                },
                required: ['confidence', 'description', 'rect']
            }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      return { confidence: 50, description: "Unknown Subject", rect: { x: 25, y: 25, w: 50, h: 50 } };
    }
  }

  async locateSubject(base64Image: string, description: string = "main moving subject") {
    try {
      const ai = this.getAiInstance();
      if (!ai) return { x: 50, y: 50 };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              { text: `Locate the ${description} in this frame. Return its central X and Y coordinates as percentages (0-100) from the top-left corner. Return in JSON format.` },
              { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER }
            },
            required: ['x', 'y']
          }
        }
      });
      return JSON.parse(response.text || '{"x": 50, "y": 50}');
    } catch (error) {
      return { x: 50, y: 50 };
    }
  }
}

export const gemini = new AyaEyeService();
