import { NextRequest, NextResponse } from"next/server";

export async function POST(req: NextRequest) {
 try {
 const { text } = (await req.json()) as { text: string };

 if (!text || text.trim().length === 0) {
 return NextResponse.json({ error:"No text provided" }, { status: 400 });
 }

 const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
 if (!apiKey) {
 return NextResponse.json(
 { error:"Deepgram API key not configured" },
 { status: 500 }
 );
 }

 // Truncate to 300 chars for faster TTS in voice mode
 const truncated = text.slice(0, 300);

 // Deepgram Aura Female Voice (Stella is a clear, bright female voice)
 const model ="aura-stella-en";

 const res = await fetch(
 `https://api.deepgram.com/v1/speak?model=${model}&encoding=mp3`,
 {
 method:"POST",
 headers: {"Authorization": `Token ${apiKey}`,"Content-Type":"application/json",
 },
 body: JSON.stringify({ text: truncated }),
 }
 );

 if (!res.ok) {
 console.error(`Deepgram TTS failed:`, res.status, await res.text());
 return NextResponse.json(
 { error:"TTS generation failed" },
 { status: 500 }
 );
 }

 const audioBuffer = await res.arrayBuffer();

 return new NextResponse(audioBuffer, {
 headers: {"Content-Type":"audio/mpeg","Cache-Control":"no-cache",
 },
 });
 } catch (error) {
 console.error("TTS route error:", error);
 return NextResponse.json(
 { error:"Internal server error" },
 { status: 500 }
 );
 }
}
