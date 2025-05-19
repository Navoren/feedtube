import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export const runtime = 'edge';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Validate the API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const timestamp = new Date().toISOString();
    const prompt = `Generate three open-ended, engaging questions for an anonymous social messaging platform like Qooh.me. Each question must be under 20 words, formatted as a single string, separated by '||'. Focus on universal, friendly themes that encourage positive interaction, avoiding personal or sensitive topics. Example: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure questions are unique, intriguing, and foster curiosity. Output only the questions in the specified format, no additional text. Request timestamp: ${timestamp}`;

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      temperature: 0.9,
      maxTokens: 100,
      seed: Math.floor(Math.random() * 1000000),
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error("Error in /api/suggest-message:", error);
    return NextResponse.json(
      { error: "Failed to generate message suggestions" },
      { status: 500 }
    );
  }
}