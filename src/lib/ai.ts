// AI Provider Types and Interfaces
export type InvoiceContext = {
  clientName: string;
  previousItems: Array<{ description: string; unit_price: number }>;
  recentTasks?: Array<{ title: string; minutes?: number }>;
  paymentPattern?: 'on_time' | 'late' | 'unknown';
  currency: string;
};

export type SuggestedInvoice = {
  due_in_days: number;
  items: Array<{ description: string; quantity: number; unit_price: number }>;
  notes?: string;
};

export interface AiProvider {
  suggestInvoice(ctx: InvoiceContext): Promise<SuggestedInvoice>;
}

// Mock Provider Implementation
class MockProvider implements AiProvider {
  async suggestInvoice(ctx: InvoiceContext): Promise<SuggestedInvoice> {
    const baseDue = ctx.paymentPattern === 'late' ? 7 : 14;
    const seed = ctx.previousItems[0]?.unit_price ?? 100;

    return {
      due_in_days: baseDue,
      items: [
        {
          description: `Services for ${ctx.clientName}`,
          quantity: 1,
          unit_price: seed,
        },
        ...(ctx.recentTasks?.slice(0, 2).map(t => ({
          description: t.title,
          quantity: 1,
          unit_price: 75,
        })) ?? []),
      ],
      notes: 'Thank you! Please include invoice number on payment.',
    };
  }
}

// OpenAI Provider Implementation
class OpenAIProvider implements AiProvider {
  async suggestInvoice(ctx: InvoiceContext): Promise<SuggestedInvoice> {
    const prompt = `
You generate concise invoice suggestions. Use ${ctx.currency}.
Client: ${ctx.clientName}
Payment pattern: ${ctx.paymentPattern}
Previous items: ${ctx.previousItems.map(i => `${i.description} - ${i.unit_price}`).join('; ')}
Recent tasks: ${ctx.recentTasks?.map(t => t.title).join('; ') || 'none'}

Return JSON: { due_in_days, items:[{description, quantity, unit_price}], notes }.
Keep items 1–4 lines, no fluff.
`;

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content:
                  'You are an AI assistant that generates invoice suggestions for freelancers. Return only valid JSON.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse JSON safely
      const parsed = JSON.parse(content);

      // Validate and apply fallback defaults
      return {
        due_in_days: parsed.due_in_days || 14,
        items: Array.isArray(parsed.items) ? parsed.items : [],
        notes: parsed.notes || 'Thank you for your business!',
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock provider
      return new MockProvider().suggestInvoice(ctx);
    }
  }
}

// Provider Selection
export const ai: AiProvider =
  import.meta.env.VITE_AI_PROVIDER === 'openai'
    ? new OpenAIProvider()
    : new MockProvider();
