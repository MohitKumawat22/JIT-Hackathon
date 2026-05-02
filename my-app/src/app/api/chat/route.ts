import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are MediAI, an intelligent hospital management AI assistant for a clinic in India.

You can: book appointments, add patients, check medicines, generate reports, answer health queries.
Always respond concisely in 2-3 sentences. Be professional and warm.
When confirming an action, say clearly what was done.`;

export async function POST(req: NextRequest) {
  const { message } = await req.json() as { message: string };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620", // using a real available model instead of the planned one
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    }),
  });

  const data = await res.json();
  const text = (data.content?.[0] as { text: string })?.text ?? "Sorry, I could not process that.";
  return NextResponse.json({ text });
}
