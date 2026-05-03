import { NextResponse } from"next/server";
import connectDB from"@/lib/mongodb";
import Patient from"@/models/Patient";
import Appointment from"@/models/Appointment";
import Medicine from"@/models/Medicine";

export async function GET() {
 try {
 await connectDB();

 // Clear existing data
 await Patient.deleteMany({});
 await Appointment.deleteMany({});
 await Medicine.deleteMany({});

 const today = new Date().toISOString().split("T")[0];

 // Seed Patients
 const patients = await Patient.create([
 { name:"Rahul Kumar", age: 45, gender:"male", bloodType:"A+", department:"Cardiology", status:"active" },
 { name:"Priya Sharma", age: 32, gender:"female", bloodType:"B+", department:"Neurology", status:"pending" },
 { name:"Anjali Mehta", age: 60, gender:"female", bloodType:"O-", department:"General", status:"critical" },
 { name:"Vikram Singh", age: 29, gender:"male", bloodType:"AB+", department:"Orthopedics", status:"active" },
 { name:"Sneha Patel", age: 38, gender:"female", bloodType:"A-", department:"Dermatology", status:"active" }
 ]);

 // Seed Appointments
 const appointments = await Appointment.create([
 { patientName:"Vikram Singh", doctorName:"Dr. Gupta", department:"Cardiology", date: today, time:"09:00", type:"check-up", status:"confirmed" },
 { patientName:"Sneha Patel", doctorName:"Dr. Rajan", department:"Dermatology", date: today, time:"10:30", type:"follow-up", status:"confirmed" },
 { patientName:"Rahul Kumar", doctorName:"Dr. Mehta", department:"Cardiology", date: today, time:"14:00", type:"follow-up", status:"pending" }
 ]);

 // Seed Medicines
 const medicines = await Medicine.create([
 { name:"Paracetamol 500mg", type:"tablet", stock: 800, lowStockThreshold: 50 },
 { name:"Amoxicillin 250mg", type:"capsule", stock: 40, lowStockThreshold: 50 },
 { name:"Metformin 500mg", type:"tablet", stock: 325, lowStockThreshold: 50 },
 { name:"Atorvastatin 10mg", type:"tablet", stock: 24, lowStockThreshold: 30 },
 { name:"Ibuprofen 400mg", type:"tablet", stock: 275, lowStockThreshold: 50 }
 ]);

 return NextResponse.json({
 success: true,
 message:"Database seeded successfully",
 counts: {
 patients: patients.length,
 appointments: appointments.length,
 medicines: medicines.length
 }
 });
 } catch (error: any) {
 console.error("Seed Error:", error);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
