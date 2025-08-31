import type { NextApiRequest, NextApiResponse } from 'next';

type ApiQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { topic, numQuestions = 5, difficulty = 'easy' } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'Missing topic' });

  try {
    const prompt = buildPrompt(topic, Number(numQuestions), difficulty);

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error('Gemini error', txt);
      return res.status(502).json({ error: 'Gemini API error', details: txt });
    }

    const json = await r.json();
    // Gemini responses can nest text in json.contents[0].parts[0].text or other fields.
    const raw = extractTextFromGemini(json);

    // We expect the model to return a JSON string that we can parse to { questions: [...] }
    const parsed = safeJsonParse(raw);
    if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
      const questions = (parsed.questions as ApiQuestion[]).map((q, i) => {
        const { id, ...rest } = q;
        return { id: `q_${i + 1}`, ...rest };
      });
      return res.status(200).json({ questions });
    }

    // Fallback: attempt to parse line-by-line if the model returned a different format
    const fallback = parseLooseQuestions(raw, Number(numQuestions));
    return res.status(200).json({ questions: fallback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

function buildPrompt(topic: string, num: number, difficulty: string) {
  return `You are an expert quiz generator. Produce a strict JSON object ONLY, with the following shape:\n\n{\n  "questions": [\n    {\n      "question": "...",\n      "options": ["opt A","opt B","opt C","opt D"],\n      "correctIndex": 0,\n      "explanation": "short explanation (optional)"\n    },\n    ...\n  ]\n}\n\nGenerate ${num} multiple-choice questions on the topic: \"${topic}\". Difficulty: ${difficulty}.\n- Provide exactly 4 options per question.\n- Randomize correct option positions.\n- Keep questions concise (one or two sentences).\n- Provide brief explanations (1-2 sentences) where possible.\n- Output only valid JSON (no extra commentary).`;
}

function extractTextFromGemini(json: any): string {
  try {
    // Common place where text lives
    if (json?.candidates && Array.isArray(json.candidates) && json.candidates[0]?.content) {
      // some Gemini responses use candidates[0].content
      const cont = json.candidates[0].content;
      if (Array.isArray(cont)) {
        // join parts
        return cont.map((p: any) => p?.text || '').join('\n');
      }
    }

    if (json?.outputs && Array.isArray(json.outputs) && json.outputs[0]?.content) {
      const content = json.outputs[0].content;
      // often parts under content
      if (Array.isArray(content)) return content.map((c: any) => c.text || '').join('\n');
    }

    // Old style: contents[0].parts[0].text
    if (json?.contents && Array.isArray(json.contents) && json.contents[0]?.parts) {
      return json.contents[0].parts.map((p: any) => p.text).join('\n');
    }

    // As a last resort, stringify
    return typeof json === 'string' ? json : JSON.stringify(json);
  } catch (err) {
    console.error('extractTextFromGemini failed', err);
    return JSON.stringify(json);
  }
}

function safeJsonParse(s: string) {
  try {
    return JSON.parse(s);
  } catch (err) {
    // sometimes model adds markdown fences, attempt to strip
    const cleaned = s.replace(/^```json\n?|\n?```$/g, '').trim();
    try { return JSON.parse(cleaned); } catch (err2) { return null; }
  }
}

function parseLooseQuestions(text: string, num: number): ApiQuestion[] {
  // extremely loose fallback: split by lines and create simple QA
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const qs: ApiQuestion[] = [];
  for (let i = 0; i < Math.min(lines.length, num); i++) {
    qs.push({ id: `q_${i + 1}`, question: lines[i], options: ['True','False','Option C','Option D'], correctIndex: 0, explanation: '' });
  }
  return qs;
}
