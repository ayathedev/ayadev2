import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

// Gemini API Route for Portfolio AI Assistant
app.post('/api/assistant', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Fallback local response if key not configured
      return res.json({
        reply: `Hi! I'm the local portfolio offline assistant. Currently running in offline mode. Here is a quick overview:
• Developer: Aya Kalimah Satya Ruane (Software Engineer & Creative Technologist)
• Specialty: High-performance web applications, audio web apps, offline local web servers & creative tech.
• Hotspot Status: Connected to local offline server at 192.168.4.1.

Feel free to launch the Chrome Browser app, Busker Sample Pad, Canvas Studio, SynthLab, or Terminal on the desktop!`
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are "Aya OS Portfolio Guide", an AI assistant embedded directly inside Aya Kalimah Satya Ruane's Chrome OS Portfolio Desktop Dashboard.
The visitor is connected via a local offline web server / Wi-Fi Hotspot captive portal.
Aya Kalimah Satya Ruane is a software engineer and creative technologist specializing in interactive web applications, WebAudio synthesizers, Canvas 2D/3D visual engines, and captive portal hardware projects.

Your goal is to answer questions enthusiastically, highlighting Aya's skills, creative projects (Busker Sample Pad, Canvas Studio, SynthLab BeatStation, Space Defense Arcade, Offline Hotspot OS), technical depth, and experience.
Be concise, helpful, and friendly. Use clean markdown bullet points where helpful.`;

    const turns: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        const role = msg.role === 'user' ? 'user' : 'model';
        const text = typeof msg.content === 'string' ? msg.content.trim() : '';
        if (!text) continue;
        if (turns.length > 0 && turns[turns.length - 1].role === role) {
          turns[turns.length - 1].parts[0].text += `\n${text}`;
        } else {
          turns.push({ role, parts: [{ text }] });
        }
      }
    }

    if (message && typeof message === 'string' && message.trim()) {
      const trimmed = message.trim();
      if (turns.length === 0 || turns[turns.length - 1].role !== 'user') {
        turns.push({ role: 'user', parts: [{ text: trimmed }] });
      } else if (turns[turns.length - 1].parts[0].text !== trimmed) {
        turns[turns.length - 1].parts[0].text += `\n${trimmed}`;
      }
    }

    // Ensure conversation starts with user turn
    while (turns.length > 0 && turns[0].role === 'model') {
      turns.shift();
    }

    const contents = turns.length > 0 ? turns : message;
    const candidateModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let replyText = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: contents as any,
          config: {
            systemInstruction,
          },
        });
        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} failed:`, err?.status || err?.message || err);
      }
    }

    if (!replyText) {
      replyText = `I'm currently responding in local hotspot mode. Here is what you need to know about Aya's portfolio:
• Creator: Aya Kalimah Satya Ruane (Software Engineer & Creative Technologist)
• Projects: Busker Sample Pad, Canvas Studio, SynthLab BeatStation, Space Defense 2D, and Aya OS.
• Server: Running locally on Hotspot Node (192.168.4.1).`;
    }

    res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Gemini API Error details:', err?.message || err);
    res.json({
      reply: `I'm currently responding in local hotspot mode. Here is what you need to know about Aya's portfolio:
Aya Kalimah Satya Ruane is a Software Engineer & Creative Technologist specializing in Web Audio synthesizers, HTML5 Canvas tools, high-performance web systems, and custom offline server hardware. Check out the Terminal, Files, Busker Sample Pad, or Browser app on the desktop to see live demos!`
    });
  }
});

// Captive Portal Detection Endpoints (Returns 200/Redirect for OS Hotspot login checks)
app.get(['/generate_204', '/hotspot-detect.html', '/canonical.html', '/connecttest.txt'], (_req, res) => {
  res.redirect('/');
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Portfolio ChromeOS Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
