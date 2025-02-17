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

    const instruction = `
        Follow these rules and respond strictly according to these rules:
        - If the prompt is intended for generating a tweet-style post (e.g., a topic like "Artificial Intelligence" or an instruction like "Write about climate change" or a famous person's name like "Donald Trump"), generate a short, engaging post. The response should be concise, and formatted like a tweet. Do not include any introductions, explanations, or extra words—only the post itself
        - If the prompt is a general question (e.g., "Who is Newton?", "What is gravity?", "Tell me about Donald Trump") or a request that is not meant for generating a post, respond only with "no" (no extra explanation).
        - If the prompt is a valid topic (e.g., "Artificial Intelligence", "Climate Change") or an instruction (e.g., "Write about space exploration"), generate a short tweet-style post. The response should be concise, engaging, and formatted like a tweet. Do not include any introductions, explanations, or extra words—only the post itself.
        - If the prompt contains clear instructions with action verbs (e.g., "write", "describe", "explain"), follow the instructions to generate concise tweet-style post without an introduction, explanation or extra words.
        - If the prompt is vague, too simple, a greeting (e.g., "hi", "hello"), or lacks context, respond only with "no" (no extra explanation).
        - If the prompt contains random words, gibberish, or lacks clear intent for post generation, respond only with "no" (no extra explanation).
        - Don't give explanation or introduction or other unnecessary words in any response.
        
        Prompt: "${prompt}"
    `;

    const result = await model.generateContent(instruction);

    const responseText = await result.response.text();

    return NextResponse.json({ success: true, text: responseText });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' });
  }
}
