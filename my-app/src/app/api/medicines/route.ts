import { NextRequest, NextResponse } from"next/server";
import connectDB from"@/lib/mongodb";
import Medicine from"@/models/Medicine";

export async function GET(request: NextRequest) {
 try {
 await connectDB();
 const { searchParams } = new URL(request.url);
 const filterType = searchParams.get("filter");

 const query: any = {};
 if (filterType ==="low_stock") {
 query.$expr = { $lte: ["$stock","$lowStockThreshold"] };
 }

 const medicines = await Medicine.find(query).sort({ name: 1 });
 return NextResponse.json({ medicines }, { status: 200 });
 } catch (error: any) {
 console.error("GET Medicines Error:", error);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}

export async function POST(request: NextRequest) {
 try {
 await connectDB();
 const body = await request.json();
 const newMedicine = await Medicine.create(body);
 return NextResponse.json(newMedicine, { status: 201 });
 } catch (error: any) {
 console.error("POST Medicine Error:", error);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
