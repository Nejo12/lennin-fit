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

// OpenAI Provider Implementation (via Netlify Function)
class OpenAIProvider implements AiProvider {
  async suggestInvoice(ctx: InvoiceContext): Promise<SuggestedInvoice> {
    try {
      const res = await fetch('/.netlify/functions/ai-suggest-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx),
      });
      const data = await res.json();

      // Validate
      if (!Array.isArray(data.items)) data.items = [];
      if (typeof data.due_in_days !== 'number') data.due_in_days = 14;

      return data as SuggestedInvoice;
    } catch (error) {
      console.error('AI suggestion error:', error);
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
