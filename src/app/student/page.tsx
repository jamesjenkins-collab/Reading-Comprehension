"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReadingInterface, PassageContent } from "@/components/student/ReadingInterface";

export default function StudentDashboard() {
    const [activePassage, setActivePassage] = useState<PassageContent | null>(null);
    const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);

    useEffect(() => {
        async function fetchAssignments() {
            try {
                const studentRes = await fetch('/api/students');
                const students = await studentRes.json();
                const foundStudent = students.find((s: any) => s.alias === "BlueTiger4") || students[0];

                if (foundStudent) {
                    setStudent(foundStudent);
                    const assignRes = await fetch(`/api/assignments?studentId=${foundStudent.id}`);
                    const data = await assignRes.json();
                    setAssignments(data);
                }
            } catch (error) {
                console.error("Failed to fetch assignments:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAssignments();
    }, []);

    const startMission = (assignment: any) => {
        setActiveAssignmentId(assignment.id);
        if (assignment.passage) {
            // Safely parse passage content — it may be a JSON string or already an object
            const safeParseContent = (raw: any) => {
                if (!raw) return { type: 'prose', blocks: [] };
                if (typeof raw === 'object') return raw; // already parsed
                try {
                    return JSON.parse(raw);
                } catch {
                    // Fallback: treat raw string as a single prose block
                    return { type: 'prose', blocks: [{ type: 'text', text: String(raw) }] };
                }
            };

            const parsed = safeParseContent(assignment.passage.content);
            setActivePassage({
                id: assignment.passage.id,
                title: assignment.passage.title,
                type: parsed.type || parsed.passageType || 'prose',
                content: parsed.blocks || parsed.content || [],
                questions: assignment.passage.questions || []
            } as any);
        } else {
            setActivePassage({
                id: assignment.id,
                title: assignment.moduleName,
                type: "prose",
                content: [{ text: "This assignment does not have a linked passage in the database." }]
            } as any);
        }
    };

    return (
        <div className="min-h-screen bg-sky-50 pt-8 px-4 md:px-8 font-sans">
            <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-sky-100 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-sky-800">Hi, {student?.alias || 'Student'}! 👋</h1>
                <div className="flex gap-4 items-center">
                    <span className="font-semibold text-lg text-sky-600">⭐ 250 Stars</span>
                    <Button variant="outline" className="font-bold">Log Out</Button>
                </div>
            </header>

            {isLoading ? (
                <div className="text-center p-20 text-sky-800 animate-pulse font-bold text-xl">Loading your missions...</div>
            ) : !activePassage ? (
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 h-[calc(100vh-160px)]">
                    {/* Left Side: Active Assignment Grid */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-sky-900 pb-2">Your Reading Missions</h2>

                        {assignments.map((assignment) => (
                            <Card
                                key={assignment.id}
                                onClick={() => startMission(assignment)}
                                className="border-l-8 border-l-blue-500 hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1"
                            >
                                <CardHeader>
                                    <CardTitle className="text-xl">{assignment.moduleName}</CardTitle>
                                    <p className="text-sm text-sky-600 font-medium mt-1">Focus: Domain Assignment</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: assignment.status === 'completed' ? '100%' : '10%' }}></div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-500 text-right">
                                        {assignment.status === 'completed' ? 'Completed! 🌟' : 'Ready to Start'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}

                        {assignments.length === 0 && (
                            <div className="p-12 border-2 border-dashed rounded-xl bg-white text-center">
                                <p className="text-sky-800 font-medium text-lg">No missions assigned yet. Check back soon!</p>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Visual Prompt */}
                    <div className="hidden md:block">
                        <Card className="h-full border-sky-200 shadow-md flex flex-col items-center justify-center bg-white border-2 border-dashed">
                            <div className="text-center p-8">
                                <h3 className="text-2xl font-bold text-gray-400 mb-4">Select a mission to start reading</h3>
                                <div className="text-8xl opacity-80 animate-bounce">📚</div>
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto pb-8 text-center md:text-left">
                    <Button
                        variant="ghost"
                        onClick={() => { setActivePassage(null); setActiveAssignmentId(null); }}
                        className="mb-4 text-sky-700 hover:text-sky-900 font-bold"
                    >
                        ← Back to Missions
                    </Button>
                    <ReadingInterface
                        passage={activePassage}
                        assignmentId={activeAssignmentId || undefined}
                        studentId={student?.id}
                    />
                </div>
            )}
        </div>
    );
}
