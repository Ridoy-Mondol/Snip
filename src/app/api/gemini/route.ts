import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' });
    }

    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(prompt);

    const responseText = await result.response.text();

    return NextResponse.json({ success: true, text: responseText });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' });
  }
}
