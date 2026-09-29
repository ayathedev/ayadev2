import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

interface DeviceInfo {
  deviceId: string;
  name: string;
  role: 'camera' | 'viewer';
  joinedAt: number;
  batteryLevel?: number;
  isCharging?: boolean;
  status: 'online' | 'streaming' | 'idle';
  facingMode?: 'user' | 'environment';
  torchOn?: boolean;
  resolution?: string;
  fps?: number;
  privacyShutter?: boolean;
}

interface AIEventAnalysis {
  category: 'person' | 'pet' | 'vehicle' | 'package' | 'unknown' | 'false_alarm';
  summary: string;
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
  objects: string[];
  analyzedAt: number;
}

interface MotionAlertEvent {
  id: string;
  cameraDeviceId: string;
  cameraName: string;
  timestamp: number;
  motionScore: number;
  snapshot?: string; // base64 thumbnail
  aiAnalysis?: AIEventAnalysis;
  clipUrl?: string;
}

interface RecordedClip {
  id: string;
  cameraDeviceId: string;
  cameraName: string;
  timestamp: number;
  durationSeconds: number;
  blobUrl: string;
  thumbnailUrl?: string;
  motionScore?: number;
  aiCategory?: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'alert';
  action: string;
  details: string;
  deviceId?: string;
  deviceName?: string;
}

interface SpaceData {
  spaceId: string;
  name: string;
  accessCode: string;
  createdAt: number;
  securityMode: 'disarmed' | 'home' | 'away';
  devices: Map<string, { info: DeviceInfo; ws: WebSocket }>;
  motionEvents: MotionAlertEvent[];
  auditLogs: AuditLogEntry[];
  recordedClips: RecordedClip[];
}

interface ExtWebSocket extends WebSocket {
  isAlive?: boolean;
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();

const spaces = new Map<string, SpaceData>();
const socketToDeviceMap = new WeakMap<WebSocket, { spaceId: string; deviceId: string }>();

app.use(express.json({ limit: '25mb' }));

// Helper to log audit entries
function addAuditLog(space: SpaceData, log: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    ...log,
  };
  space.auditLogs.unshift(entry);
  if (space.auditLogs.length > 200) {
    space.auditLogs.pop();
  }
  return entry;
}

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

Feel free to launch the Aya Browser app, Busker Sample Pad, Canvas Studio, SynthLab, or Aya Terminal on the desktop!`
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

    const systemInstruction = `You are "Aya OS Portfolio Guide", an AI assistant embedded directly inside Aya Kalimah Satya Ruane's Aya OS Portfolio Desktop Dashboard.
The visitor is connected via a local offline web server / Wi-Fi Hotspot captive portal.
Aya Kalimah Satya Ruane is a software engineer and creative technologist specializing in interactive web applications, WebAudio synthesizers, Canvas 2D/3D visual engines, and captive portal hardware projects.

Your goal is to answer questions enthusiastically, highlighting Aya's skills, creative projects (Busker Sample Pad, Canvas Studio, SynthLab BeatStation, Offline Hotspot OS), technical depth, and experience.
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
• Projects: Busker Sample Pad, Canvas Studio, SynthLab BeatStation, and Aya OS.
• Server: Running locally on Active Node.`;
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

// Ayasec Surveillance REST APIs
app.get('/api/spaces', (req, res) => {
  const result: any[] = [];
  for (const [id, space] of spaces.entries()) {
    const devs: any[] = [];
    for (const [, d] of space.devices) {
      devs.push({
        deviceId: d.info.deviceId,
        name: d.info.name,
        role: d.info.role,
        status: d.info.status,
      });
    }
    result.push({
      spaceId: id,
      name: space.name,
      accessCode: space.accessCode,
      deviceCount: space.devices.size,
      securityMode: space.securityMode,
      devices: devs,
    });
  }
  res.json(result);
});

app.get('/api/spaces/:spaceId/status', (req, res) => {
  const spaceId = req.params.spaceId.trim().toLowerCase();
  const space = spaces.get(spaceId);
  if (!space) {
    return res.json({ exists: false, cameraCount: 0, viewerCount: 0 });
  }

  let cameraCount = 0;
  let viewerCount = 0;
  for (const [, dev] of space.devices) {
    if (dev.info.role === 'camera') cameraCount++;
    else viewerCount++;
  }

  res.json({
    exists: true,
    name: space.name,
    securityMode: space.securityMode,
    cameraCount,
    viewerCount,
  });
});

app.post('/api/spaces/verify', (req, res) => {
  const { spaceId, accessCode } = req.body;
  if (!spaceId || typeof spaceId !== 'string') {
    return res.status(400).json({ valid: false, message: 'Space ID is required' });
  }

  const cleanId = spaceId.trim().toLowerCase();
  const space = spaces.get(cleanId);
  if (!space) {
    return res.json({ valid: true, isNew: true });
  }

  if (space.accessCode === accessCode) {
    return res.json({ valid: true, isNew: false, name: space.name });
  }

  return res.status(401).json({ valid: false, message: 'Incorrect Access Code / Password' });
});

app.get('/api/spaces/:spaceId/audit-logs', (req, res) => {
  const spaceId = req.params.spaceId.trim().toLowerCase();
  const space = spaces.get(spaceId);
  if (!space) {
    return res.json({ logs: [] });
  }
  res.json({ logs: space.auditLogs });
});

app.get('/api/spaces/:spaceId/recordings', (req, res) => {
  const spaceId = req.params.spaceId.trim().toLowerCase();
  const space = spaces.get(spaceId);
  if (!space) {
    return res.json({ clips: [] });
  }
  res.json({ clips: space.recordedClips });
});

app.post('/api/spaces/:spaceId/recordings', (req, res) => {
  const spaceId = req.params.spaceId.trim().toLowerCase();
  const space = spaces.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: 'Space not found' });
  }

  const { cameraDeviceId, cameraName, durationSeconds, blobUrl, thumbnailUrl, motionScore, aiCategory } = req.body;
  const clip: RecordedClip = {
    id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    cameraDeviceId: cameraDeviceId || 'camera',
    cameraName: cameraName || 'Camera',
    timestamp: Date.now(),
    durationSeconds: Number(durationSeconds) || 10,
    blobUrl,
    thumbnailUrl,
    motionScore,
    aiCategory,
  };

  space.recordedClips.unshift(clip);
  if (space.recordedClips.length > 100) {
    space.recordedClips.pop();
  }

  addAuditLog(space, {
    level: 'info',
    action: 'Clip Recorded',
    details: `${clip.durationSeconds}s DVR video clip saved (${aiCategory || 'Motion event'})`,
    deviceId: cameraDeviceId,
    deviceName: cameraName,
  });

  res.json({ success: true, clip });
});

app.post('/api/ai/analyze-frame', async (req, res) => {
  try {
    const { imageBase64, spaceName, motionScore } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are a real-time smart security camera AI analyzer.
Analyze this video camera snapshot taken during a security motion alert (Motion score: ${motionScore || 'N/A'}/100, Space: "${spaceName || 'Monitored Room'}").
Determine:
1. What category of entity caused this motion? Choose ONE: 'person', 'pet', 'vehicle', 'package', 'unknown', or 'false_alarm' (e.g. slight shadow, lighting flicker, curtain rustle).
2. A concise 1-sentence summary description of what is seen (e.g., "Person walking past the doorway", "Dog moving across the carpet", "Shadow change across wall").
3. Urgency level: 'high' (unrecognized human intrusion, tampering), 'medium' (pet or known activity), or 'low' (false alarm, minor shadow).
4. Estimated confidence percentage (1-100).
5. Detected prominent objects (array of strings, e.g. ["person", "door", "bed"]).

Return valid JSON adhering to this exact format:
{
  "category": "person" | "pet" | "vehicle" | "package" | "unknown" | "false_alarm",
  "summary": "Short 1-sentence description",
  "urgency": "low" | "medium" | "high",
  "confidence": 88,
  "objects": ["person"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg',
            },
          },
          prompt,
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch (_) {}

      return res.json({
        success: true,
        analysis: {
          category: parsed.category || 'unknown',
          summary: parsed.summary || 'Movement detected in camera view',
          urgency: parsed.urgency || 'medium',
          confidence: Number(parsed.confidence) || 85,
          objects: Array.isArray(parsed.objects) ? parsed.objects : ['movement'],
          analyzedAt: Date.now(),
        },
      });
    } else {
      // Heuristic fallback if Gemini API key is not present in environment
      const score = Number(motionScore) || 20;
      const isSignificant = score > 40;
      return res.json({
        success: true,
        analysis: {
          category: isSignificant ? 'person' : 'unknown',
          summary: isSignificant ? 'Significant movement detected in monitored zone' : 'Subtle lighting or motion variance detected',
          urgency: score > 60 ? 'high' : 'medium',
          confidence: Math.min(95, Math.max(50, Math.round(score * 1.2))),
          objects: ['motion_target'],
          analyzedAt: Date.now(),
        },
      });
    }
  } catch (err: any) {
    console.error('AI frame analysis error:', err);
    return res.json({
      success: true,
      analysis: {
        category: 'unknown',
        summary: 'Optical motion detected across sensor',
        urgency: 'medium',
        confidence: 75,
        objects: ['movement'],
        analyzedAt: Date.now(),
      },
    });
  }
});

// AI Generation Endpoint for Haven Care OS & other apps
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, model = 'gemini-2.5-flash', config } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'API key not configured' });
    }
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    const candidateModels = [model, 'gemini-2.5-flash', 'gemini-flash-latest'];
    for (const m of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: config || undefined,
        });
        return res.json({
          text: response.text,
          functionCalls: response.functionCalls,
          groundingMetadata: response.candidates?.[0]?.groundingMetadata,
        });
      } catch (err: any) {
        console.warn(`Gemini generate model ${m} attempt failed:`, err?.message || err);
      }
    }
    res.status(503).json({ error: 'All Gemini candidate models failed' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Gemini error' });
  }
});

// AI Chat Endpoint for Haven Care OS
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history, systemInstruction, tools, model = 'gemini-2.5-flash' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'API key not configured' });
    }
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    const formattedHistory = (history || []).map((m: any) => ({
      role: m.role,
      parts: [{ text: m.content || m.parts?.[0]?.text || '' }],
    }));
    const candidateModels = [model, 'gemini-2.5-flash', 'gemini-flash-latest'];
    for (const m of candidateModels) {
      try {
        const chat = ai.chats.create({
          model: m,
          config: {
            systemInstruction,
            tools: tools || undefined,
          },
          history: formattedHistory,
        });
        const result = await chat.sendMessage({ message });
        return res.json({
          text: result.text,
          functionCalls: result.functionCalls,
        });
      } catch (err: any) {
        console.warn(`Gemini chat model ${m} attempt failed:`, err?.message || err);
      }
    }
    res.status(503).json({ error: 'All Gemini candidate chat models failed' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Gemini Chat error' });
  }
});

// AI Podcast Studio API Endpoints
function cleanJsonResponseText(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

app.post('/api/gemini/generate-casting', async (req, res) => {
  try {
    const { concept, numCharacters = 2, genre = 'Tech & AI' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API key not configured' });
    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const prompt = `Create ${numCharacters} distinct, vibrant podcast character sheets for a podcast with genre "${genre}".
Concept/Premise: "${concept}"
Ensure characters have:
- Clear names and main story roles
- Unique personalities, quirks, and backgrounds
- Voice profiles (voiceName chosen from Puck, Charon, Kore, Fenrir, Zephyr)
- Clickable relationship connections linking characters.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              mainRole: { type: Type.STRING },
              personality: { type: Type.STRING },
              quirks: { type: Type.STRING },
              background: { type: Type.STRING },
              voiceConfig: {
                type: Type.OBJECT,
                properties: {
                  voiceName: { type: Type.STRING },
                  gender: { type: Type.STRING },
                  pitch: { type: Type.NUMBER },
                  rate: { type: Type.NUMBER },
                  tone: { type: Type.STRING },
                  emotionStyle: { type: Type.STRING },
                },
                required: ['voiceName', 'gender', 'pitch', 'rate', 'tone', 'emotionStyle'],
              },
              relationships: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    targetCharacterName: { type: Type.STRING },
                    relationshipType: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ['targetCharacterName', 'relationshipType', 'notes'],
                },
              },
            },
            required: ['name', 'mainRole', 'personality', 'quirks', 'background', 'voiceConfig', 'relationships'],
          },
        },
      },
    });
    const charactersData = JSON.parse(cleanJsonResponseText(response.text || '[]'));
    res.json({ characters: charactersData });
  } catch (error: any) {
    console.error('Casting generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate casting' });
  }
});

app.post('/api/gemini/generate-script', async (req, res) => {
  try {
    const { characters = [], existingScript = [], prompt = '' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API key not configured' });
    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const charactersSummary = characters
      .map((c: any) => `- ${c.name} (${c.mainRole}): ${c.personality}`)
      .join('\n');
    const formattedScript = existingScript.map((l: any, i: number) => `Line ${i + 1} [${l.characterName}]: "${l.text}"`).join('\n');
    const fullPrompt = `You are a podcast scriptwriter.
Characters:\n${charactersSummary}
Current Script:\n${formattedScript}
User Instruction: "${prompt}"
Return a complete JSON array of updated script lines with fields: characterName, text, emotionNote, sfxCue.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              characterName: { type: Type.STRING },
              text: { type: Type.STRING },
              emotionNote: { type: Type.STRING },
              sfxCue: { type: Type.STRING },
              isSceneHeader: { type: Type.BOOLEAN },
              sceneTitle: { type: Type.STRING }
            },
            required: ['characterName', 'text'],
          },
        },
      },
    });
    const lines = JSON.parse(cleanJsonResponseText(response.text || '[]'));
    res.json({ lines });
  } catch (error: any) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate script' });
  }
});

app.post('/api/gemini/generative-podcast', async (req, res) => {
  try {
    const { topic, genre = 'Tech & AI' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API key not configured' });
    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const prompt = `Automate a complete podcast episode about: "${topic}" (Genre: "${genre}").
Return JSON object with: title, tagline, description, showNotes, characters (array), script (array of lines).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    const podcastData = JSON.parse(cleanJsonResponseText(response.text || '{}'));
    res.json(podcastData);
  } catch (error: any) {
    console.error('Generative podcast error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate podcast' });
  }
});

app.post('/api/gemini/script-chat', async (req, res) => {
  try {
    const { characters = [], existingScript = [], messages = [], newMessage = '' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API key not configured' });
    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const fullPrompt = `You are a podcast dialogue assistant. User says: "${newMessage}". Discuss or return updated script in JSON with "reply" and "lines".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    const data = JSON.parse(cleanJsonResponseText(response.text || '{"reply": "Ready to assist!", "lines": []}'));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Script chat error' });
  }
});

app.post('/api/gemini/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Zephyr', promptStyle = '' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.json({ audioBase64: null, fallback: true });
    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const ttsPrompt = promptStyle ? `Say ${promptStyle}: ${text}` : text;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: ttsPrompt }] }],
    });
    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    res.json({ audioBase64: audioBase64 || null, sampleRate: 24000 });
  } catch (error: any) {
    res.json({ audioBase64: null, fallback: true });
  }
});

// Captive Portal Detection Endpoints (Returns 200/Redirect for OS Hotspot login checks)
app.get(['/generate_204', '/hotspot-detect.html', '/canonical.html', '/connecttest.txt'], (_req, res) => {
  res.redirect('/');
});

async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  function broadcastToSpace(spaceId: string, message: any, excludeWs?: WebSocket) {
    const space = spaces.get(spaceId);
    if (!space) return;
    const payload = JSON.stringify(message);
    for (const [, client] of space.devices) {
      if (client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }

  function getSpaceDevicesList(space: SpaceData): DeviceInfo[] {
    return Array.from(space.devices.values()).map((d) => d.info);
  }

  function handleDisconnect(ws: WebSocket) {
    const mapping = socketToDeviceMap.get(ws);
    if (!mapping) return;
    socketToDeviceMap.delete(ws);

    const space = spaces.get(mapping.spaceId);
    if (!space) return;

    space.devices.delete(mapping.deviceId);

    addAuditLog(space, {
      level: 'info',
      action: 'Device Left',
      details: `Device ${mapping.deviceId} disconnected`,
      deviceId: mapping.deviceId,
    });

    broadcastToSpace(mapping.spaceId, {
      type: 'device_left',
      deviceId: mapping.deviceId,
      devices: getSpaceDevicesList(space),
    });

    // If space has no devices left for more than 10 minutes, clean up
    if (space.devices.size === 0) {
      setTimeout(() => {
        const check = spaces.get(mapping.spaceId);
        if (check && check.devices.size === 0) {
          spaces.delete(mapping.spaceId);
        }
      }, 10 * 60 * 1000);
    }
  }

  wss.on('connection', (ws: ExtWebSocket) => {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString());

        switch (msg.type) {
          case 'ping': {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'pong',
                  clientTime: msg.clientTime,
                  serverTime: Date.now(),
                })
              );
            }
            break;
          }

          case 'join_space': {
            const rawSpaceId = (msg.spaceId || '').trim().toLowerCase();
            const accessCode = (msg.accessCode || '').trim();
            const deviceId = msg.deviceId || `dev_${Math.random().toString(36).slice(2, 9)}`;
            const deviceName = msg.deviceName || 'Device';
            const role: 'camera' | 'viewer' = msg.role === 'camera' ? 'camera' : 'viewer';

            if (!rawSpaceId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Space ID is required' }));
              return;
            }

            let space = spaces.get(rawSpaceId);
            if (!space) {
              // Create new space
              space = {
                spaceId: rawSpaceId,
                name: msg.spaceName || rawSpaceId,
                accessCode: accessCode,
                createdAt: Date.now(),
                securityMode: 'disarmed',
                devices: new Map(),
                motionEvents: [],
                auditLogs: [],
                recordedClips: [],
              };
              spaces.set(rawSpaceId, space);
            } else {
              // Verify access code
              if (space.accessCode && space.accessCode !== accessCode) {
                ws.send(
                  JSON.stringify({
                    type: 'auth_failed',
                    message: 'Incorrect access code for this Space',
                  })
                );
                return;
              }
            }

            // Close existing socket with same device ID if reconnecting
            const existingInSpace = space.devices.get(deviceId);
            if (existingInSpace && existingInSpace.ws !== ws) {
              try {
                socketToDeviceMap.delete(existingInSpace.ws);
                existingInSpace.ws.close();
              } catch (_) {}
            }

            // Register device in space
            const deviceInfo: DeviceInfo = {
              deviceId,
              name: deviceName,
              role,
              joinedAt: Date.now(),
              status: role === 'camera' ? 'streaming' : 'online',
              batteryLevel: msg.batteryLevel,
              isCharging: msg.isCharging,
              facingMode: msg.facingMode,
              torchOn: false,
              resolution: msg.resolution,
              privacyShutter: false,
            };

            // If existing socket was in a space, remove it first
            const existingMapping = socketToDeviceMap.get(ws);
            if (existingMapping) {
              const oldSpace = spaces.get(existingMapping.spaceId);
              if (oldSpace) {
                oldSpace.devices.delete(existingMapping.deviceId);
                broadcastToSpace(existingMapping.spaceId, {
                  type: 'device_left',
                  deviceId: existingMapping.deviceId,
                  devices: getSpaceDevicesList(oldSpace),
                });
              }
            }

            space.devices.set(deviceId, { info: deviceInfo, ws });
            socketToDeviceMap.set(ws, { spaceId: rawSpaceId, deviceId });

            addAuditLog(space, {
              level: 'info',
              action: 'Device Joined',
              details: `${deviceName} connected as ${role.toUpperCase()}`,
              deviceId,
              deviceName,
            });

            // Send confirmation and full current state to this device
            ws.send(
              JSON.stringify({
                type: 'joined_success',
                spaceId: space.spaceId,
                spaceName: space.name,
                role,
                deviceId,
                securityMode: space.securityMode,
                devices: getSpaceDevicesList(space),
                motionEvents: space.motionEvents.slice(-30),
                recordedClips: space.recordedClips.slice(0, 30),
                auditLogs: space.auditLogs.slice(0, 50),
              })
            );

            // Broadcast to other peers in space
            broadcastToSpace(
              rawSpaceId,
              {
                type: 'device_joined',
                device: deviceInfo,
                devices: getSpaceDevicesList(space),
              },
              ws
            );
            break;
          }

          case 'update_device_status': {
            const mapping = socketToDeviceMap.get(ws);
            if (!mapping) return;
            const space = spaces.get(mapping.spaceId);
            if (!space) return;
            const dev = space.devices.get(mapping.deviceId);
            if (!dev) return;

            Object.assign(dev.info, msg.updates || {});
            broadcastToSpace(mapping.spaceId, {
              type: 'device_updated',
              device: dev.info,
              devices: getSpaceDevicesList(space),
            });
            break;
          }

          case 'set_security_mode': {
            const mapping = socketToDeviceMap.get(ws);
            if (!mapping) return;
            const space = spaces.get(mapping.spaceId);
            if (!space) return;

            const newMode = msg.securityMode as 'disarmed' | 'home' | 'away';
            if (['disarmed', 'home', 'away'].includes(newMode)) {
              space.securityMode = newMode;
              addAuditLog(space, {
                level: newMode === 'away' ? 'alert' : 'info',
                action: 'Security Mode Changed',
                details: `System mode changed to ${newMode.toUpperCase()}`,
                deviceId: mapping.deviceId,
              });
              broadcastToSpace(mapping.spaceId, {
                type: 'security_mode_changed',
                securityMode: newMode,
              });
            }
            break;
          }

          case 'save_recorded_clip': {
            const mapping = socketToDeviceMap.get(ws);
            if (!mapping) return;
            const space = spaces.get(mapping.spaceId);
            if (!space) return;

            const clip: RecordedClip = {
              id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              cameraDeviceId: mapping.deviceId,
              cameraName: msg.cameraName || 'Camera',
              timestamp: Date.now(),
              durationSeconds: msg.durationSeconds || 10,
              blobUrl: msg.blobUrl,
              thumbnailUrl: msg.thumbnailUrl,
              motionScore: msg.motionScore,
              aiCategory: msg.aiCategory,
            };
            space.recordedClips.unshift(clip);
            if (space.recordedClips.length > 50) {
              space.recordedClips.pop();
            }

            broadcastToSpace(mapping.spaceId, {
              type: 'new_clip_recorded',
              clip,
            });
            break;
          }

          case 'privacy_shutter_toggle': {
            const mapping = socketToDeviceMap.get(ws);
            if (!mapping) return;
            const space = spaces.get(mapping.spaceId);
            if (!space) return;

            const dev = space.devices.get(mapping.deviceId);
            if (dev) {
              dev.info.privacyShutter = !!msg.enabled;
              addAuditLog(space, {
                level: 'warn',
                action: 'Privacy Shutter Toggled',
                details: `${dev.info.name} privacy shutter ${msg.enabled ? 'ENGAGED' : 'OPENED'}`,
                deviceId: mapping.deviceId,
                deviceName: dev.info.name,
              });
              broadcastToSpace(mapping.spaceId, {
                type: 'device_updated',
                device: dev.info,
                devices: getSpaceDevicesList(space),
              });
            }
            break;
          }

          // Live frame relay (WebSockets fallback or complementary stream)
          case 'camera_frame': {
            const mapping = socketToDeviceMap.get(ws);
            if (!mapping) return;
            const space = spaces.get(mapping.spaceId);
            if (!space) return;

            const framePayload = {
              type: 'camera_frame',
              cameraDeviceId: mapping.deviceId,
              frame: msg.frame, // base64 jpeg
              timestamp: msg.timestamp || Date.now(),
              motionScore: msg.motionScore || 0,
            };

            // Forward directly to viewers (skipping if viewer has socket buffer backlog)
            for (const [, dev] of space.devices) {
              if (dev.info.role === 'viewer' && dev.ws.readyState === WebSocket.OPEN) {
                if ((dev.ws as any).bufferedAmount > 64 * 1024) {
                  continue; // Backpressure guard: skip frame to prevent latency build-up
                }
                dev.ws.send(JSON.stringify(framePayload));
              }
            }
            break;
          }

          // Motion Alert
          case 'motion_detected': {
            const mapping = socketToDeviceMap.get(ws);
            if (!mapping) return;
            const space = spaces.get(mapping.spaceId);
            if (!space) return;
            const cameraDev = space.devices.get(mapping.deviceId);

            const alertEvent: MotionAlertEvent = {
              id: `motion_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              cameraDeviceId: mapping.deviceId,
              cameraName: cameraDev ? cameraDev.info.name : 'Camera',
              timestamp: Date.now(),
              motionScore: msg.motionScore || 1,
              snapshot: msg.snapshot,
              aiAnalysis: msg.aiAnalysis,
              clipUrl: msg.clipUrl,
            };

            space.motionEvents.unshift(alertEvent);
            if (space.motionEvents.length > 50) {
              space.motionEvents.pop();
            }

            addAuditLog(space, {
              level: space.securityMode === 'away' ? 'alert' : 'warn',
              action: 'Motion Alert',
              details: `Motion detected (${msg.motionScore || 1}%) on ${cameraDev ? cameraDev.info.name : 'Camera'}`,
              deviceId: mapping.deviceId,
              deviceName: cameraDev ? cameraDev.info.name : 'Camera',
            });

            broadcastToSpace(mapping.spaceId, {
              type: 'motion_alert',
              alert: alertEvent,
            });
            break;
          }

          // WebRTC Signaling
          case 'webrtc_offer':
          case 'webrtc_answer':
          case 'webrtc_ice_candidate': {
            const mapping = socketToDeviceMap.get(ws);
            if (!mapping) return;
            const space = spaces.get(mapping.spaceId);
            if (!space) return;

            const target = space.devices.get(msg.targetDeviceId);
            if (target && target.ws.readyState === WebSocket.OPEN) {
              target.ws.send(
                JSON.stringify({
                  type: msg.type,
                  senderDeviceId: mapping.deviceId,
                  sdp: msg.sdp,
                  candidate: msg.candidate,
                })
              );
            }
            break;
          }

          // Remote Commands (viewer -> camera, e.g. siren, torch, talkback)
          case 'remote_command': {
            const mapping = socketToDeviceMap.get(ws);
            if (!mapping) return;
            const space = spaces.get(mapping.spaceId);
            if (!space) return;

            const target = space.devices.get(msg.targetDeviceId);
            if (target && target.ws.readyState === WebSocket.OPEN) {
              target.ws.send(
                JSON.stringify({
                  type: 'remote_command',
                  fromDeviceId: mapping.deviceId,
                  command: msg.command,
                  value: msg.value,
                })
              );
            }
            break;
          }

          // Intercom Audio chunk (Push-to-talk)
          case 'intercom_audio': {
            const mapping = socketToDeviceMap.get(ws);
            if (!mapping) return;
            const space = spaces.get(mapping.spaceId);
            if (!space) return;

            const target = space.devices.get(msg.targetDeviceId);
            if (target && target.ws.readyState === WebSocket.OPEN) {
              target.ws.send(
                JSON.stringify({
                  type: 'intercom_audio',
                  fromDeviceId: mapping.deviceId,
                  audioData: msg.audioData,
                })
              );
            }
            break;
          }

          case 'leave_space': {
            handleDisconnect(ws);
            break;
          }
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    ws.on('close', () => {
      handleDisconnect(ws);
    });

    ws.on('error', (err) => {
      console.error('WebSocket connection error:', err);
      handleDisconnect(ws);
    });
  });

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

  // Active heartbeat check every 15s to keep connections alive and clear dead sockets
  const heartbeatTimer = setInterval(() => {
    wss.clients.forEach((client) => {
      const extWs = client as ExtWebSocket;
      if (extWs.isAlive === false) {
        handleDisconnect(extWs);
        return extWs.terminate();
      }
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 15000);

  server.on('close', () => {
    clearInterval(heartbeatTimer);
  });

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Aya OS Portfolio Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
