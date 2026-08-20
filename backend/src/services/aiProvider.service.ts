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


export interface TransformSlideParams {
  action: 'CONCISE' | 'EXPAND' | 'FORMAL' | 'CASUAL' | 'TRANSLATE' | 'SPEAKER_NOTES';
  slideTitle: string;
  slideContent: string;
  slideNotes?: string | null;
  targetLanguage?: string;
}

export interface TransformSlideResult {
  title: string;
  content: string;
  notes?: string;
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

    return cleaned || 'gemini-1.5-flash';
  }

  private hasValidApiKey(): boolean {
    if (!this.apiKey) return false;
    const k = this.apiKey.trim();
    return k.length > 5 && k !== 'your-api-key' && !k.startsWith('<') && !k.startsWith('YOUR_');
  }

  private parseJsonResponse(text: string): any {
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned);
  }

  async transformSlide(params: TransformSlideParams): Promise<TransformSlideResult> {
    if (!this.hasValidApiKey()) {
      logger.warn('Valid AI_PROVIDER_API_KEY not set - using mock slide transformer');
      return this.mockTransform(params);
    }

    const prompt = this.buildTransformPrompt(params);
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
      const parsed = this.parseJsonResponse(text);
      return {
        title: parsed.title || params.slideTitle,
        content: parsed.content || params.slideContent,
        notes: parsed.notes ?? params.slideNotes ?? undefined,
      };
    } catch {
      throw new AIProviderError('Failed to parse Gemini transform response as JSON', false);
    }
  }

  private buildTransformPrompt(params: TransformSlideParams): string {
    let instruction = '';
    switch (params.action) {
      case 'CONCISE':
        instruction = 'Make the title and content concise, punchy, and bullet-pointed.';
        break;
      case 'EXPAND':
        instruction = 'Expand the content with additional valuable insights, context, and examples.';
        break;
      case 'FORMAL':
        instruction = 'Rewrite the title and content using formal, executive business language.';
        break;
      case 'CASUAL':
        instruction = 'Rewrite the title and content using an engaging, conversational tone.';
        break;
      case 'TRANSLATE':
        instruction = `Translate the title, content, and notes into ${params.targetLanguage || 'English'}.`;
        break;
      case 'SPEAKER_NOTES':
        instruction = 'Generate detailed speaker notes elaborating on key points for a live presenter.';
        break;
    }

    return `You are an expert slide editor. Modify the following slide according to this instruction: "${instruction}"

Original Title: "${params.slideTitle}"
Original Content:
"${params.slideContent}"
Original Notes: "${params.slideNotes || ''}"

Respond ONLY with strict JSON in this exact format:
{
  "title": "Updated Title",
  "content": "Updated content paragraphs or bullet points",
  "notes": "Updated speaker notes"
}`;
  }

  private async mockTransform(params: TransformSlideParams): Promise<TransformSlideResult> {
    await new Promise((r) => setTimeout(r, 800));

    switch (params.action) {
      case 'CONCISE':
        return {
          title: params.slideTitle,
          content: params.slideContent
            .split('\n')
            .map((line) => line.replace(/^[•\-]\s*/, ''))
            .slice(0, 2)
            .map((line) => `• ${line.slice(0, 80)}`)
            .join('\n'),
          notes: params.slideNotes ?? undefined,
        };
      case 'EXPAND':
        return {
          title: params.slideTitle,
          content: `${params.slideContent}\n• Added strategic detail expanding on market trends.\n• Additional analytical overview included.`,
          notes: params.slideNotes ?? undefined,
        };
      case 'TRANSLATE':
        return {
          title: `[${params.targetLanguage || 'Translated'}] ${params.slideTitle}`,
          content: `${params.slideContent}`,
          notes: params.slideNotes ? `[${params.targetLanguage || 'Translated'}] ${params.slideNotes}` : undefined,
        };
      case 'SPEAKER_NOTES':
        return {
          title: params.slideTitle,
          content: params.slideContent,
          notes: `Speaker script: Welcome team. On this slide about "${params.slideTitle}", emphasize our core strategy and highlight key metrics.`,
        };
      default:
        return {
          title: params.slideTitle,
          content: params.slideContent,
          notes: params.slideNotes ?? undefined,
        };
    }
  }

  async generateSlides(params: GeneratePresentationParams): Promise<SlideContent[]> {
    if (!this.hasValidApiKey()) {
      logger.warn('Valid AI_PROVIDER_API_KEY not set - using mock slide generator');
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
      const parsed = this.parseJsonResponse(text);
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
