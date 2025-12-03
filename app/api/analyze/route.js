import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { compressBase64Image } from '@/lib/imageIO';

// Initialize OpenAI client. Next.js securely reads OPENAI_API_KEY from .env.local
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const body = await request.json();
        const { imageUrl } = body;

        if (!imageUrl) {
            return NextResponse.json({ error: 'No image URL provided.' }, { status: 400 });
        }

        // Compress on the server so users can upload originals
        let compressedDataUrl = imageUrl;
        try {
            compressedDataUrl = await compressBase64Image(imageUrl);
        } catch (compressionError) {
            console.warn('Image compression failed, using original image.', compressionError);
        }

        const prompt = "Analyze this image and provide exactly 5 short, descriptive keywords. Format your response as a JSON object with a single key 'keywords' containing an array of 5 strings. Example: {\"keywords\": [\"word1\", \"word2\", \"word3\", \"word4\", \"word5\"]}";

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { "url": compressedDataUrl } }
                    ]
                }
            ],
            max_tokens: 100,
            response_format: { type: "json_object" }
        });

        // Parse and return the structured response
        const keywordsObject = JSON.parse(response.choices[0].message.content);
        
        // Ensure we send back the expected format
        const keywords = keywordsObject.keywords || [];

        return NextResponse.json({ keywords });

    } catch (error) {
        console.error('Error analyzing image in API route:', error);
        return NextResponse.json({ error: 'Failed to analyze image. Check API key and logs.' }, { status: 500 });
    }
}
