import { NextRequest, NextResponse } from"next/server";

// Generate lip sync mouth cues for the avatar
export async function POST(req: NextRequest) {
 try {
 const formData = await req.formData();
 const audioFile = formData.get("audio") as File | null;

 // Estimate duration from audio size (rough: ~16KB per second for mp3)
 let duration = 3.0;
 if (audioFile) {
 const sizeKB = audioFile.size / 1024;
 duration = Math.max(1, Math.min(30, sizeKB / 16));
 }

 // Generate realistic mouth cue pattern
 const mouthCues = [];
 const cueInterval = 0.07 + Math.random() * 0.05;
 const values = ["A","B","C","D","E","F","G","H","X"];
 let t = 0;

 while (t < duration) {
 const len = cueInterval + Math.random() * 0.1;
 const value = values[Math.floor(Math.random() * values.length)];
 mouthCues.push({
 start: parseFloat(t.toFixed(2)),
 end: parseFloat((t + len).toFixed(2)),
 value,
 });
 t += len;
 }

 return NextResponse.json({ mouthCues });
 } catch (error) {
 console.error("Lipsync error:", error);
 return NextResponse.json({ error:"Lipsync generation failed" }, { status: 500 });
 }
}
