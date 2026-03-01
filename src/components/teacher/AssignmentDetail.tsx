"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, BookOpen, HelpCircle } from "lucide-react";

export function AssignmentDetail({ assignment, onClose }: { assignment: any, onClose: () => void }) {
    if (!assignment || !assignment.passage) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Missing Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This assignment does not have a linked passage in the database.</p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={onClose} className="w-full">Close</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const { passage } = assignment;
    let contentArr = [];
    try {
        const parsed = JSON.parse(passage.content);
        contentArr = parsed.blocks || [];
    } catch (e) {
        contentArr = [{ text: passage.content }];
    }

    const questions = passage.questions || [];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-indigo-50">
                    <div>
                        <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
                            <BookOpen className="h-6 w-6" />
                            {passage.title}
                        </h2>
                        <p className="text-sm text-indigo-600 font-medium">Reviewing mission for {assignment.student?.alias}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white">
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 grid md:grid-cols-2 gap-8 bg-gray-50">
                    {/* Passage Column */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm font-serif min-h-full">
                            <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none px-3 py-1">Passage Content</Badge>
                            {contentArr.map((block: any, idx: number) => (
                                <p key={idx} className="mb-6 text-lg text-gray-800 leading-relaxed tracking-wide">
                                    {block.text}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Questions Column */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 px-2">
                            <HelpCircle className="h-5 w-5 text-indigo-500" />
                            Generated Questions
                        </h3>
                        <div className="space-y-4">
                            {questions.map((q: any, idx: number) => {
                                const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                                const correct = typeof q.correctAnswer === 'string' ? JSON.parse(q.correctAnswer) : q.correctAnswer;

                                return (
                                    <Card key={q.id} className="border-gray-200 shadow-sm overflow-hidden border-l-4 border-l-indigo-400">
                                        <CardHeader className="py-3 px-4 bg-white">
                                            <div className="flex justify-between items-start">
                                                <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Question {idx + 1}</Label>
                                                <Badge variant="outline" className="text-[10px] py-0">{q.readingDomain}</Badge>
                                            </div>
                                            <CardTitle className="text-md leading-snug pt-1">{q.prompt}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-2 px-4 space-y-2 pb-4">
                                            {options.map((opt: string, i: number) => (
                                                <div key={i} className={`text-sm p-3 rounded-md border flex items-center gap-3 ${opt === correct ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${opt === correct ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    {opt}
                                                    {opt === correct && <span className="ml-auto text-xs font-bold text-green-600 uppercase">Correct</span>}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end">
                    <Button onClick={onClose} size="lg" className="px-12 bg-indigo-600 hover:bg-indigo-700">Close Review</Button>
                </div>
            </div>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={className}>{children}</span>;
}
