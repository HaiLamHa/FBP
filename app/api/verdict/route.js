import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { policeStory, defenseStory } = body;

    if (!policeStory || !defenseStory) {
      return NextResponse.json({ error: 'Both policeStory and defenseStory are required.' }, { status: 400 });
    }

    const prompt = `
You are an impartial judge AI. Given the police report and the player's defense story, estimate how believable the player's story is.

Return a JSON object with:
- "confidence": number from 0 to 100 representing your belief that the player is telling the truth.
- "rationale": a brief one-sentence justification (plain text).

Police report:
${policeStory}

Player defense story:
${defenseStory}

Respond ONLY with JSON in this exact shape: {"confidence": 75.5, "rationale": "short reason here"}
    `.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices?.[0]?.message?.content || '{}');
    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0;
    const rationale = typeof parsed.rationale === 'string' ? parsed.rationale : 'No rationale provided.';

    return NextResponse.json({
      confidence,
      rationale,
    });
  } catch (error) {
    console.error('Error generating verdict:', error);
    return NextResponse.json({ error: 'Failed to generate verdict.' }, { status: 500 });
  }
}
