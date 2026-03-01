"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type TextType = 'prose' | 'poetry' | 'playscript';

export interface PassageContent {
    id: string;
    title: string;
    type: TextType;
    content: any[];
    questions?: any[];
}

export function ReadingInterface({
    passage,
    assignmentId,
    studentId
}: {
    passage: PassageContent;
    assignmentId?: string;
    studentId?: string;
}) {
    const [fontSize, setFontSize] = useState<number>(18);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [regeneratedContent, setRegeneratedContent] = useState<any[] | null>(null);
    const [regeneratedType, setRegeneratedType] = useState<TextType | null>(null);
    const [regeneratedQuestions, setRegeneratedQuestions] = useState<any[] | null>(null);

    // Use regenerated data if available, otherwise fall back to original
    const activeContent = regeneratedContent ?? passage.content;
    const activeType = regeneratedType ?? passage.type;
    const questions = regeneratedQuestions ?? (passage.questions || []);
    const currentQuestion = questions[currentQuestionIdx];

    const handleRegenerate = useCallback(async () => {
        if (!passage.id) return;
        setIsRegenerating(true);
        try {
            const res = await fetch(`/api/passages/${passage.id}/regenerate`, { method: 'POST' });
            const data = await res.json();
            if (data.success && data.passage) {
                const parsed = typeof data.passage.content === 'string'
                    ? JSON.parse(data.passage.content)
                    : data.passage.content;
                setRegeneratedContent(parsed.blocks || []);
                setRegeneratedType(parsed.type || 'prose');
                // Also update questions so they match the new passage
                if (data.passage.questions?.length) {
                    setRegeneratedQuestions(data.passage.questions);
                    setCurrentQuestionIdx(0);
                    setSelectedOption(null);
                }
            }
        } catch (e) {
            console.error('Regenerate failed:', e);
        } finally {
            setIsRegenerating(false);
        }
    }, [passage.id]);

    const renderContent = () => {
        let contentArr: any[] = activeContent;

        // Handle string-encoded content
        if (typeof contentArr === 'string') {
            try {
                const parsed = JSON.parse(contentArr as any);
                contentArr = parsed.blocks || parsed.content || [];
            } catch (e) {
                contentArr = [{ type: 'text', text: contentArr }];
            }
        }

        // Filter out empty blocks
        const validBlocks = (contentArr || []).filter((b: any) => b?.text || (b?.lines?.length > 0));

        if (!validBlocks || validBlocks.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
                    <div className="text-4xl">⚠️</div>
                    <h3 className="text-xl font-bold text-gray-600">Passage content unavailable</h3>
                    <p className="text-gray-500 text-sm max-w-xs">The text for this reading could not be loaded. Click below to reload it.</p>
                    <Button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="mt-2"
                    >
                        {isRegenerating ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Reloading...
                            </span>
                        ) : '🔄 Reload Passage Text'}
                    </Button>
                </div>
            );
        }

        if (activeType === 'prose' || !activeType) {
            return validBlocks.map((block: any, idx: number) => (
                <p key={idx} className="mb-4 leading-relaxed">{block.text}</p>
            ));
        } else if (activeType === 'poetry') {
            return validBlocks.map((block: any, idx: number) => {
                // Support both old {lines:[]} format and new {text:"line1\nline2"} format
                const lines = block.lines
                    ? block.lines
                    : (block.text || '').split('\n').filter(Boolean);
                return (
                    <div key={idx} className="mb-8">
                        {lines.map((line: string, i: number) => (
                            <p key={i} className="mb-1 leading-relaxed">{line}</p>
                        ))}
                    </div>
                );
            });
        } else if (activeType === 'playscript') {
            return validBlocks.map((block: any, idx: number) => {
                if (block.type === 'stage_direction') {
                    return <p key={idx} className="italic text-gray-500 mb-4 ml-8">[{block.text}]</p>;
                }
                return (
                    <div key={idx} className="mb-4 flex flex-col md:flex-row">
                        <span className="font-bold min-w-[120px] uppercase text-sky-800">{block.character}:</span>
                        <span className="flex-1 mt-1 md:mt-0">{block.text}</span>
                    </div>
                );
            });
        }
        // Catch-all fallback
        return validBlocks.map((block: any, idx: number) => (
            <p key={idx} className="mb-4 leading-relaxed">{block.text}</p>
        ));
    };

    const handleNext = async () => {
        if (!selectedOption) return;

        // Calculate if correct
        const isCorrect = selectedOption === (typeof currentQuestion.correctAnswer === 'string' ? JSON.parse(currentQuestion.correctAnswer) : currentQuestion.correctAnswer);
        if (isCorrect) setScore((s: number) => s + 1);

        // Save response via API
        if (assignmentId && studentId) {
            try {
                await fetch('/api/responses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId,
                        questionId: currentQuestion.id,
                        assignmentId,
                        studentAnswer: selectedOption,
                        isCorrect
                    })
                });
            } catch (e) {
                console.error("Failed to save response:", e);
            }
        }

        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx((prev: number) => prev + 1);
            setSelectedOption(null);
        } else {
            // Mission Finished!
            setIsFinished(true);
            setShowConfetti(true);
            // Optionally update assignment status to 'completed'
            if (assignmentId) {
                fetch(`/api/assignments/${assignmentId}/complete`, { method: 'POST' }).catch(() => { });
            }
        }
    };

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in zoom-in duration-500">
                {showConfetti && <ConfettiOverlay />}
                <Card className="max-w-md w-full border-2 border-sky-200 shadow-2xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-2">
                        <div className="text-6xl mb-4">🏆</div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                            Mission Accomplished!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-xl text-gray-600">Great job completing your reading mission on **{passage.title}**.</p>
                        <div className="bg-sky-50 rounded-full p-8 inline-block border-4 border-white shadow-inner">
                            <span className="text-5xl font-black text-sky-600">{score}/{questions.length}</span>
                        </div>
                        <p className="text-sm text-muted-foreground italic">Your teacher has been notified of your progress!</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full text-lg py-6" onClick={() => window.location.href = '/student'}>
                            Return to Mission Hub
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 font-sans">
            {/* Left Pane: Passage Content */}
            <div className="w-full md:w-2/3 bg-white rounded-xl shadow-sm border border-sky-100 flex flex-col overflow-hidden h-full">
                <div className="flex justify-between items-center p-4 border-b bg-sky-50 shadow-inner">
                    <h2 className="font-bold text-xl text-sky-900">{passage.title}</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setFontSize(f => Math.max(14, f - 2))}>A-</Button>
                        <Button variant="outline" size="sm" onClick={() => setFontSize(f => Math.min(32, f + 2))}>A+</Button>
                    </div>
                </div>
                <div className="p-8 overflow-y-auto flex-1 font-serif text-gray-800" style={{ fontSize: `${fontSize}px` }}>
                    {renderContent()}
                </div>
            </div>

            {/* Right Pane: Question Interface */}
            <div className="hidden md:flex w-1/3 flex-col gap-4 h-full">
                <Card className="flex-1 flex flex-col border-sky-200 shadow-md">
                    {currentQuestion ? (
                        <>
                            <CardHeader className="bg-sky-50 rounded-t-xl border-b">
                                <div className="text-sm text-sky-600 font-bold uppercase mb-2 tracking-wider">
                                    Question {currentQuestionIdx + 1} of {questions.length}
                                    <Badge variant="outline" className="ml-2 text-[10px]">{currentQuestion.readingDomain}</Badge>
                                </div>
                                <CardTitle className="leading-snug">{currentQuestion.prompt}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col gap-3 p-6 overflow-y-auto">
                                {(typeof currentQuestion.options === 'string' ? JSON.parse(currentQuestion.options) : currentQuestion.options).map((option: string, i: number) => (
                                    <Button
                                        key={i}
                                        variant={selectedOption === option ? "default" : "outline"}
                                        onClick={() => setSelectedOption(option)}
                                        className="justify-start h-auto py-4 px-6 text-left whitespace-normal hover:border-sky-500 hover:bg-sky-50 text-md"
                                    >
                                        <span className={`font-bold mr-3 ${selectedOption === option ? 'text-white' : 'text-sky-600'}`}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {option}
                                    </Button>
                                ))}
                            </CardContent>
                            <CardFooter className="border-t p-6 bg-gray-50 rounded-b-xl flex gap-2">
                                <Button
                                    className="flex-1 text-lg py-6"
                                    size="lg"
                                    disabled={!selectedOption}
                                    onClick={handleNext}
                                >
                                    {currentQuestionIdx === questions.length - 1 ? 'Finish Mission' : 'Next Question'}
                                </Button>
                            </CardFooter>
                        </>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground italic">
                            No questions available for this passage.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

function ConfettiOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(40)].map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-bounce"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        backgroundColor: ['#38bdf8', '#818cf8', '#fbbf24', '#f87171', '#34d399'][Math.floor(Math.random() * 5)],
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        opacity: 0.6,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${Math.random() * 2 + 1}s`,
                    }}
                />
            ))}
        </div>
    );
}
