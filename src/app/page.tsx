"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  // Check if student already registered on this device
  useEffect(() => {
    const id = localStorage.getItem("ghost_student_id");
    if (id) setExistingId(id);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      // Call the new real backend registration route
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, grade }),
      });

      const data = await res.json();

      // Save ID to browser memory! This is the magic step.
      localStorage.setItem("ghost_student_id", data.student_id);
      router.push("/classroom");
    } catch (err) {
      console.error(err);
      alert("Database offline. Ensure backend is running.");
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
              Student ID Found: {existingId}
            </p>
            <button
              onClick={() => router.push("/classroom")}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all"
            >
              Resume My Lessons
            </button>
            <button
              onClick={() => { localStorage.removeItem("ghost_student_id"); setExistingId(null); }}
              className="text-xs text-slate-500 hover:text-slate-300 underline"
            >
              Register as a new student
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 text-left">
            <div>
              <label className="text-sm text-slate-400 font-bold">Student Name</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-slate-400 font-bold">Grade Level (e.g. 5)</label>
              <input required type="text" value={grade} onChange={(e) => setGrade(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button type="submit" disabled={isRegistering}
              className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all disabled:opacity-50">
              {isRegistering ? "Creating ID..." : "Register & Start"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}