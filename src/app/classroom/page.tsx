"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message { role: "user" | "assistant"; content: string; }

export default function Classroom() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Real Data States
    const [studentId, setStudentId] = useState("");
    const [studentData, setStudentData] = useState({ name: "Loading...", grade: "", day: 1 });

    // 1. On Load: Get ID from memory, fetch real stats from Database
    useEffect(() => {
        const id = localStorage.getItem("ghost_student_id");
        if (!id) {
            router.push("/"); // If no ID, kick them back to register
            return;
        }
        setStudentId(id);

        // Fetch real stats from DB
        fetch(`https://chilly-nails-notice.loca.lt/student/${id}`)
            .then(res => res.json())
            .then(data => {
                setStudentData(data);
                setMessages([{
                    role: "assistant",
                    content: `Welcome back, ${data.name}! We are on Grade ${data.grade}, Day ${data.day}. Let's begin.`
                }]);
            })
            .catch(err => console.error("DB Fetch Error:", err));
    }, [router]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        setMessages(prev => [...prev, { role: "user", content: input }]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("https://chilly-nails-notice.loca.lt/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: studentId, // Send the REAL ID
                    message: input
                }),
            });

            const data = await response.json();

            setMessages(prev => [...prev, { role: "assistant", content: data.message }]);

            // If the day updated in the backend, fetch the new stats to update the UI bar!
            if (data.message.includes("DAY_COMPLETE") || data.message.includes("dashboard has been updated")) {
                fetch(`https://chilly-nails-notice.loca.lt/student/${studentId}`)
                    .then(res => res.json())
                    .then(updatedData => setStudentData(updatedData));
            }

        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Network error. Please check backend connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 text-white font-sans">
            {/* Sidebar with REAL DATA */}
            <div className="w-72 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col">
                <Link href="/" className="text-slate-400 hover:text-white mb-8 text-sm">← Exit Classroom</Link>

                <h2 className="text-2xl font-bold mb-1">{studentData.name}</h2>
                <p className="text-slate-400 text-xs font-mono mb-4">ID: {studentId}</p>
                <p className="text-emerald-400 text-sm font-semibold mb-8">Grade {studentData.grade} • Day {studentData.day}</p>

                <div className="mb-6">
                    <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase">
                        <span>Course Progress</span>
                        <span>Day {studentData.day} / 30</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000"
                            style={{ width: `${(studentData.day / 30) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative">
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-2xl p-5 rounded-2xl whitespace-pre-wrap ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-800 border border-slate-700 rounded-bl-none"
                                }`}>
                                <p>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && <p className="text-slate-500 animate-pulse">Teacher is analyzing...</p>}
                </div>

                <div className="p-6 bg-slate-900 border-t border-slate-800">
                    <div className="max-w-4xl mx-auto relative">
                        <input
                            type="text" value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()} disabled={isLoading}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-full pl-6 pr-16 py-4 outline-none focus:border-blue-500"
                        />
                        <button onClick={handleSend} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 p-2.5 rounded-full">→</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
