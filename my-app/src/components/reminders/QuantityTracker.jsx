"use client";

export default function QuantityTracker({ remaining, total, type }) {
 const percent = Math.max(0, Math.min(100, (remaining / total) * 100));
 let colorClass ="bg-emerald-500";
 if (percent < 20) colorClass ="bg-red-500";
 else if (percent < 50) colorClass ="bg-amber-500";

 return (
 <div className="w-full">
 <div className="flex justify-between items-center mb-1.5">
 <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Stock Level</span>
 <span className={`text-[11px] font-black ${percent < 20 ? 'text-red-600' : 'text-gray-700'}`}>
 {remaining} / {total} {type}s
 </span>
 </div>
 <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
 <div className={`h-full ${colorClass} transition-all duration-500 ease-out rounded-full shadow-sm`}
 style={{ width: `${percent}%` }}
 />
 </div>
 </div>
 );
}
