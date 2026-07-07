import { env } from '../config/env';
import { createChildLogger } from '../config/logger';

const logger = createChildLogger('ai-provider');

export interface SlideContent {
  order: number;
  title: string;
  content: string;
  notes?: string;
}

export interface GeneratePresentationParams {
  topic: string;
  audience: string;
  language: string;
  slideCount: number;
  theme: string;
  tone: string;
  style: string;
  customInstructions?: string;
}

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}


export class AIProviderError extends Error {
  constructor(message: string, public readonly retryable: boolean = true) {
    super(message);
    this.name = 'AIProviderError';
  }
}


export class AIProviderService {
  private apiKey = env.AI_PROVIDER_API_KEY ;
  private model = this.normalizeModel(env.AI_PROVIDER_MODEL);
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  private normalizeModel(model: string): string {
    const cleaned = model
      .trim()
      .replace(/^models\//i, '')
      .replace(/^model\s*:\s*/i, '')
      .replace(/^['"]|['"]$/g, '');

    return cleaned || 'gemini-2.5-flash';
  }

  async generateSlides(params: GeneratePresentationParams): Promise<SlideContent[]> {
   
    if (!this.apiKey) {
      logger.warn('AI_PROVIDER_API_KEY not set - using mock slide generator');
      return this.mockGenerate(params);
    }

    const prompt = this.buildPrompt(params);
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        }),
      });
    } catch (err) {
      throw new AIProviderError(`Network error calling Gemini API: ${(err as Error).message}`, true);
    }

    if (response.status === 429) {
      throw new AIProviderError('Gemini API rate limit exceeded', true);
    }
    if (response.status >= 500) {
      throw new AIProviderError(`Gemini API temporary failure (${response.status})`, true);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new AIProviderError(`Gemini API request failed (${response.status}): ${body}`, false);
    }

    const json = (await response.json()) as GeminiApiResponse;
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new AIProviderError('Gemini API returned an empty response', true);
    }

    try {
      const parsed = JSON.parse(text);
      const slides = parsed.slides as SlideContent[];
      if (!Array.isArray(slides) || slides.length === 0) {
        throw new Error('No slides array in response');
      }
      return slides;
    } catch {
      throw new AIProviderError('Failed to parse Gemini API response as JSON', false);
    }
  }

  private buildPrompt(params: GeneratePresentationParams): string {
    const instructions = params.customInstructions
      ? `Additional user requirements: ${params.customInstructions}`
      : '';

    return `You are an expert presentation designer. Create a ${params.slideCount}-slide presentation
about "${params.topic}" for an audience of "${params.audience}".
Write entirely in ${params.language}.
Tone of writing: ${params.tone} (e.g. FORMAL = professional/business language, CASUAL = relaxed/conversational,
INFORMATIVE = fact-driven and neutral, PERSUASIVE = convincing and benefit-driven).
Visual/content style: ${params.style} (e.g. MINIMAL = concise bullet points, PROFESSIONAL = structured business
language, CREATIVE = vivid/engaging phrasing, BOLD = punchy, high-impact statements).
Visual theme reference for context only: ${params.theme}.
${instructions}

Respond ONLY with strict JSON, no markdown fences, no extra text, in this exact shape:
{ "slides": [ { "order": number, "title": string, "content": string, "notes": string } ] }
The "content" field should be 2-4 concise sentences or bullet-style points (joined with newlines) appropriate
for the requested tone and style. The "notes" field is a short speaker note elaborating on the slide.`;
  }

  private async mockGenerate(params: GeneratePresentationParams): Promise<SlideContent[]> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const slides: SlideContent[] = [];
    for (let i = 1; i <= params.slideCount; i++) {
      slides.push({
        order: i,
        title: i === 1 ? params.topic : `${params.topic} - Key Point ${i - 1}`,
        content:
          i === 1
            ? `An overview of "${params.topic}" tailored for ${params.audience}, written in a ${params.tone.toLowerCase()} tone and ${params.style.toLowerCase()} style.` +
              (params.customInstructions ? ` Notes considered: ${params.customInstructions}` : '')
            : `Discussion point ${i - 1} covering an important aspect of ${params.topic}, ` +
              `explained in a ${params.tone.toLowerCase()} tone relevant to ${params.audience}.`,
        notes: `Speaker note for slide ${i}: elaborate on this point with a real-world example.`,
      });
    }
    return slides;
  }
}

export const aiProviderService = new AIProviderService();
