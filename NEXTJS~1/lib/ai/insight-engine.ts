import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface DetectorOutput {
  category: 'demand' | 'pace' | 'marketing' | 'ota' | 'forecast' | 'compset' | 'operations';
  severity: 'action' | 'attention' | 'watch' | 'opportunity';
  detectorCode: string;
  confidence: number;
  rawData: Record<string, unknown>;
  estimatedImpactValue?: number;
  estimatedImpactUnit?: 'revenue' | 'cost' | 'roas' | 'occupancy_pp';
}

interface ExplainedInsight {
  title: string;
  context: string;
  recommendedAction: string;
}

const SYSTEM_PROMPT = `You are a senior commercial analyst for a luxury hotel.
Your job is to convert anomaly signals from operational data into clear, actionable executive insights.
Always:
- Write in confident sentence case (never ALL CAPS, never exclamation marks)
- Use specific numbers from the raw data
- Stay calm and editorial in tone, like a Monocle magazine commercial note
- Output strictly valid JSON
`;

function buildPrompt(detector: DetectorOutput): string {
  return `Convert this signal into an executive insight.

Detector: ${detector.detectorCode}
Category: ${detector.category}
Severity: ${detector.severity}
Confidence: ${(detector.confidence * 100).toFixed(0)}%
Raw data: ${JSON.stringify(detector.rawData, null, 2)}

Return JSON with exactly these keys:
- "title": one sentence stating what changed and by how much. Use specific numbers.
- "context": two sentences explaining what's likely happening and why it matters. Reference the data.
- "recommendedAction": one short imperative recommendation, maximum 12 words.

Example output:
{
  "title": "Singapore demand increased 18% week-over-week",
  "context": "Search index for Bangkok luxury hotel from Singapore IPs rose to 214 from 181. OTA arrivals have not yet caught up, indicating a 5 to 9 day window to capture intent before pace shifts.",
  "recommendedAction": "Lift Singapore paid spend 25 percent, refresh creative"
}`;
}

export async function explainInsight(detector: DetectorOutput): Promise<ExplainedInsight> {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL_INSIGHTS ?? 'gpt-4o-mini',
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPrompt(detector) },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) throw new Error('No content returned from LLM');

  const parsed = JSON.parse(content) as ExplainedInsight;

  if (!parsed.title || !parsed.context || !parsed.recommendedAction) {
    throw new Error('LLM returned malformed insight');
  }

  return parsed;
}

export async function embedInsight(title: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: title,
  });
  return response.data[0]!.embedding;
}

/**
 * Cosine similarity between two equal-length vectors.
 * Used to dedupe against insights from the last 14 days.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
