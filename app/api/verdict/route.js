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
You are a fair but generous judge AI. Given the police report and the player's defense story, estimate how believable the player's story is.

Reward creativity, coherence, and persuasive detail from the player, even if it stretches plausibility slightly. Be less strict when the defense offers a vivid, consistent narrative that plausibly explains away conflicts with the police report. Only penalize heavily when the story is internally inconsistent or blatantly contradicted by the police report.

Return a JSON object with:
- "confidence": number from 0 to 100 representing your belief that the player is telling the truth (bias toward higher scores when the story is creative and convincing).
- "rationale": a brief one-sentence justification (plain text) that highlights the most persuasive element.
- "strengths": 2-4 bullet points (as a single string with leading hyphens) that cite specific examples from the player's defense story (quote short phrases) that make the defense believable.
- "weaknesses": 2-4 bullet points (as a single string with leading hyphens) that cite specific examples from the police report or conflicts in the defense story (quote short phrases) that weaken the defense.

Police report:
${policeStory}

Player defense story:
${defenseStory}

Respond ONLY with JSON in this exact shape: {"confidence": 75.5, "rationale": "short reason here", "strengths": "short strengths here", "weaknesses": "short weaknesses here"}
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
    const strengths = typeof parsed.strengths === 'string' ? parsed.strengths : '';
    const weaknesses = typeof parsed.weaknesses === 'string' ? parsed.weaknesses : '';

    return NextResponse.json({
      confidence,
      rationale,
      strengths,
      weaknesses,
    });
  } catch (error) {
    console.error('Error generating verdict:', error);
    return NextResponse.json({ error: 'Failed to generate verdict.' }, { status: 500 });
  }
}
