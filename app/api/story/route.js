import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { readFile } from 'fs/promises';
import path from 'path';

// Initialize OpenAI client. Key is secure.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const getPoliceStory = async () => {
    try {
        const publicPath = path.join(process.cwd(), 'public', 'police_AI_story.txt');
        const rootPath = path.join(process.cwd(), 'police_AI_story.txt');
        try {
            return await readFile(publicPath, 'utf8');
        } catch {
            return await readFile(rootPath, 'utf8');
        }
    } catch (err) {
        console.warn('Could not read police_AI_story.txt, proceeding without it.', err);
        return '';
    }
};

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

        const policeStory = await getPoliceStory();

        const storyPrompt = [
            "You are a defense attorney AI specializing in creating highly persuasive and contextually rich alibis. Your task is to craft a personal, first-person narrative that convincingly explains the user's presence at the locations suggested by the keywords. The story must be ordinary, routine, and avoid any implication of criminal intent. Use the keywords as natural, casual elements of the user's daily life or routine.",
            "Each piece of evidence is summarized by keywords only. Use only those words to infer the scenario.",
            keywordNarratives,
            policeStory
                ? `There is also an official police AI report:\n${policeStory}\nUse helpful or exonerating elements from this report to strengthen the defense narrative, but do not contradict the keywords evidence.`
                : "No police report text was available. Proceed using only the evidence keywords.",
            "Now craft the full narrative that ties everything together, make it an chronological story that takes place in approximately 1 day.",
            "Finish with a clear closing paragraph that wraps up the day and underscores innocence—do not leave the narrative hanging.",
        ].join('\n\n');

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{
                role: "user",
                content: storyPrompt
            }],
            max_tokens: 750,
            temperature: 0.7
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
