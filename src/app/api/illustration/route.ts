import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.DALLE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    // Enhance the prompt for better children's book illustrations
    const enhancedPrompt = `Create a cheerful, child-friendly illustration for a children's book: ${prompt}. 
    Style: Colorful, whimsical, and engaging, suitable for young children. 
    Use soft, warm colors and gentle shapes. Make it cute and appealing, similar to modern children's book illustrations.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    return NextResponse.json({
      url: response.data[0].url
    });

  } catch (error) {
    console.error('Illustration generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate illustration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 