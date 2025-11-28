import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI client. Key is secure.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const body = await request.json();
        const { evidence } = body;

        if (!Array.isArray(evidence) || evidence.length === 0) {
            return NextResponse.json({ error: 'No evidence provided.' }, { status: 400 });
        }

        const keywordNarratives = evidence.map((item, index) => {
            const keywordsArray = Array.isArray(item.keywords) ? item.keywords : [];
            const keywordText = keywordsArray.length ? keywordsArray.join(', ') : 'No keywords provided';
            return `Evidence ${index + 1}: ${keywordText}`;
        }).join('\n');

        const storyPrompt = [
            "You are a defense attorney AI specializing in creating highly persuasive and contextually rich alibis. Your task is to craft a personal, first-person narrative that convincingly explains the user's presence at the locations suggested by the keywords. The story must be ordinary, routine, and avoid any implication of criminal intent. Use the keywords as natural, casual elements of the user's daily life or routine.",
            "Each piece of evidence is summarized by keywords only. Use only those words to infer the scenario.",
            keywordNarratives,
            "Now craft the full narrative that ties everything together.",
        ].join('\n\n');

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{
                role: "user",
                content: storyPrompt
            }],
            max_tokens: 500
        });

        const storyText = response.choices?.[0]?.message?.content?.trim();

        if (!storyText) {
            throw new Error('Story generation returned empty content.');
        }

        return NextResponse.json({ story: storyText });

    } catch (error) {
        console.error('Error generating story in API route:', error);
        return NextResponse.json({ error: 'Failed to generate story. Check API key and logs.' }, { status: 500 });
    }
}
