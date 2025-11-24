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

        if (!evidence || evidence.length === 0) {
            return NextResponse.json({ error: 'No evidence provided.' }, { status: 400 });
        }

        let storyPrompt = "You are a detective. Write a short, creative story (3-4 paragraphs) that connects all the evidence provided. The evidence is a series of images and their associated keywords.\n\n";
        
        const messages = [{
            role: "user",
            content: [{ type: "text", text: storyPrompt }]
        }];

        evidence.forEach((item, index) => {
            messages[0].content.push({
                type: "text",
                text: `\n--- Evidence ${index + 1} ---\nKeywords: ${item.keywords.join(', ')}\n`
            });
            messages[0].content.push({
                type: "image_url",
                image_url: { "url": item.image }
            });
        });

        messages[0].content.push({
            type: "text",
            text: "\n--- Story --- \nNow, write the connecting story."
        });

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: messages,
            max_tokens: 500
        });

        const storyText = response.choices[0].message.content;

        return NextResponse.json({ story: storyText });

    } catch (error) {
        console.error('Error generating story in API route:', error);
        return NextResponse.json({ error: 'Failed to generate story. Check API key and logs.' }, { status: 500 });
    }
}