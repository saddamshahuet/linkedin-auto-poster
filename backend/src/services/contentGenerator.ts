import axios from 'axios';

interface GenerateOptions {
  prompt: string;
  tone?: 'professional' | 'casual' | 'inspirational' | 'educational';
  length?: 'short' | 'medium' | 'long';
  includeHashtags?: boolean;
  model?: string;
}

interface GeneratedContent {
  text: string;
  hashtags: string[];
  estimatedEngagement: number;
}

export class ContentGeneratorService {
  private ollamaHost: string;
  private defaultModel: string;

  constructor() {
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.defaultModel = process.env.OLLAMA_MODEL || 'llama3';
  }

  async generate(options: GenerateOptions): Promise<GeneratedContent> {
    const {
      prompt,
      tone = 'professional',
      length = 'medium',
      includeHashtags = true,
      model = this.defaultModel,
    } = options;

    const systemPrompt = this.buildSystemPrompt(tone, length, includeHashtags);
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    try {
      const response = await axios.post(`${this.ollamaHost}/api/generate`, {
        model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      });

      const generatedText = response.data.response;
      const { text, hashtags } = this.parseResponse(generatedText);

      return {
        text,
        hashtags,
        estimatedEngagement: this.estimateEngagement(text, hashtags),
      };
    } catch (error: any) {
      console.error('Content generation error:', error.message);

      // Fallback to OpenAI if Ollama fails and OpenAI is configured
      if (process.env.OPENAI_API_KEY) {
        return this.generateWithOpenAI(options);
      }

      throw new Error('Failed to generate content: ' + error.message);
    }
  }

  private buildSystemPrompt(
    tone: string,
    length: string,
    includeHashtags: boolean
  ): string {
    const lengthGuide = {
      short: '50-100 words',
      medium: '100-200 words',
      long: '200-300 words',
    };

    const toneGuide = {
      professional: 'professional, business-focused, authoritative',
      casual: 'conversational, friendly, approachable',
      inspirational: 'motivational, uplifting, encouraging',
      educational: 'informative, instructive, value-driven',
    };

    return `You are an expert LinkedIn content creator. Create engaging LinkedIn posts that:
- Are ${toneGuide[tone as keyof typeof toneGuide] || 'professional'}
- Are approximately ${lengthGuide[length as keyof typeof lengthGuide] || '100-200 words'}
- Use clear, compelling language
- Include a hook in the first line
- Have proper line breaks for readability
${includeHashtags ? '- Include 3-5 relevant hashtags at the end' : ''}
- Optimize for LinkedIn's algorithm

Format the response as:
[Post content]

${includeHashtags ? 'HASHTAGS: #hashtag1 #hashtag2 #hashtag3' : ''}`;
  }

  private parseResponse(response: string): { text: string; hashtags: string[] } {
    const parts = response.split('HASHTAGS:');
    const text = parts[0].trim();
    const hashtags = parts[1]
      ? parts[1]
          .trim()
          .split('#')
          .filter((h) => h.trim())
          .map((h) => '#' + h.trim().split(/\s+/)[0])
      : [];

    return { text, hashtags };
  }

  private estimateEngagement(text: string, hashtags: string[]): number {
    let score = 50; // Base score

    // Length factor
    const words = text.split(/\s+/).length;
    if (words >= 100 && words <= 200) score += 10;

    // Question factor
    if (text.includes('?')) score += 5;

    // Emoji factor
    if (/[\u{1F300}-\u{1F9FF}]/u.test(text)) score += 5;

    // Hashtag factor
    score += Math.min(hashtags.length * 3, 15);

    // Line breaks (readability)
    const lineBreaks = (text.match(/\n/g) || []).length;
    if (lineBreaks >= 2) score += 5;

    return Math.min(score, 100);
  }

  private async generateWithOpenAI(options: GenerateOptions): Promise<GeneratedContent> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(
              options.tone || 'professional',
              options.length || 'medium',
              options.includeHashtags !== false
            ),
          },
          { role: 'user', content: options.prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const generatedText = response.data.choices[0].message.content;
    const { text, hashtags } = this.parseResponse(generatedText);

    return {
      text,
      hashtags,
      estimatedEngagement: this.estimateEngagement(text, hashtags),
    };
  }

  async bulkGenerate(prompts: string[], options: Omit<GenerateOptions, 'prompt'>): Promise<GeneratedContent[]> {
    const results = await Promise.all(
      prompts.map((prompt) => this.generate({ ...options, prompt }))
    );
    return results;
  }
}
