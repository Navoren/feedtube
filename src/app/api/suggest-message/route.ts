import Groq from "groq-sdk";
import { StreamingTextResponse, streamText } from 'ai';
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
    const chatCompletion = await getGroqChatCompletion();
    // Print the completion returned by the LLM.
    const content = chatCompletion.choices[0]?.message?.content || "";
    const stream = new ReadableStream({
        start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(content));
        controller.close();
        }
    });
    return new StreamingTextResponse(stream, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
    } catch (error) {
        if (error instanceof Groq.GroqError) {
            const {name, message} = error;
            return NextResponse.json({
                name, message
            });
        }
        else {
            return Response.json({
                success: false,
                message: "Error in Getting Chat Completion",
                error: error
            }, { status: 500 });
        }
    }
    }

export async function getGroqChatCompletion() {
return groq.chat.completions.create({
    messages: [
        {
        role: "user",
        content: "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.",
        },
],
model: "llama3-8b-8192",
});
}
