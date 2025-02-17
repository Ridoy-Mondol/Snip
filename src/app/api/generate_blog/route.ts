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

    - For any valid prompt, generate a complete blog post with the following sections:
      - Introduction: Briefly introduce the topic.
      
      Leave one blank line before starting the next section

      - Main Points or Relevant Sections: Provide content divided into relevant sections based on the topic. The sections should have appropriate headings such as:
        - If the topic is about technology, sections could be titled "What is [Topic]?", "How [Topic] Works", "[Topic] Applications", etc.
        - If the topic is about a person, the sections could be titled "Early Life", "Career", "Achievements", etc.
        - For general topics, use appropriate subheadings like "Key Insights", "Impact", "Challenges", etc.
        
      The number of sections depends on the importance and depth of the topic. Each section should focus on a different aspect or point of the topic.

      Leave one blank line after each section before starting the next one

      - Conclusion: Summarize the key points or provide a closing thought.

    Ensure that each section is clearly separated with a gap between them for readability. Do not include unnecessary extra words or explanations outside of the actual content of the blog.

    - If the prompt is intended for writing a blog (e.g., a topic like "Artificial Intelligence" or an instruction like "Write about climate change" or a famous person's name like "Donald Trump"), generate a blog post following the instructions above.

    - **For invalid prompts**, respond with **"no"** (no extra explanation). This applies to:
      - General questions (e.g., "Who is Newton?", "What is gravity?", "Tell me about Donald Trump") or requests not meant for writing a blog.
      - Vague, too simple, or greeting prompts (e.g., "hi", "hello").
      - Random words, gibberish, or prompts lacking clear intent for blog writing.

    - Don't give explanation, introduction, or other unnecessary words in any response.

    Prompt: "${prompt}"
`;




    const result = await model.generateContent(instruction);

    const responseText = await result.response.text();

    return NextResponse.json({ success: true, text: responseText });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' });
  }
}
