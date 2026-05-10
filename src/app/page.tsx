"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("ghost_student_id");
    if (id) setExistingId(id);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      // UPDATED TO YOUR LOCALTUNNEL URL
      const res = await fetch("https://chilly-nails-notice.loca.lt/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true" 
        },
        body: JSON.stringify({ name, grade }),
      });
      
      const data = await res.json();
      localStorage.setItem("ghost_student_id", data.student_id);
      router.push("/classroom");
    } catch (err) {
      console.error(err);
      alert("Database offline. Ensure backend and localtunnel are running.");
      setIsRegistering(false);
    }
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="z-10 max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          Ghost Classroom
        </h1>
        <p className="text-slate-400 mb-8">Autonomous Education Node</p>

        {existingId ? (
          <div className="space-y-4">
            <p className="text-emerald-400 font-bold bg-emerald-500/10 py-3 rounded-lg border border-emerald-500/20">
              Student ID: {existingId}
            </p>
            <button onClick={() => router.push("/classroom")} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all">
              Resume My Lessons
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 text-left">
            <input required placeholder="Student Name" type="text" value={name} onChange={(e) => setName(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none" />
            <input required placeholder="Grade Level" type="text" value={grade} onChange={(e) => setGrade(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none" />
            <button type="submit" disabled={isRegistering} className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all disabled:opacity-50">
              {isRegistering ? "Connecting..." : "Register & Start"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
