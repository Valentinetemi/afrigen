import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { buildPrompt } from "../../lib/constants";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response("GEMINI_API_KEY not configured", { status: 500 });
  }

  try {
    const { prompt, domain, country, rows, format } = await req.json();

    if (!prompt || !domain || !country || !rows) {
      return new Response("Missing required fields", { status: 400 });
    }

    const model = genai.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
      },
    });

    const fullPrompt = buildPrompt(prompt, domain, country, Math.min(rows, 1000), format);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream(fullPrompt);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (e) {
          controller.enqueue(encoder.encode(`ERROR: ${e}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return new Response(`Server error: ${e}`, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    },
  });
}
