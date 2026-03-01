"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { READING_DOMAINS, getDifficultyBandsForYear, PIRA_BANDS } from "@/lib/pira";

export function AssignmentManager() {
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedDomainCodes, setSelectedDomainCodes] = useState<string[]>([]);
    const [questionCount, setQuestionCount] = useState<number>(5);
    const [topicContext, setTopicContext] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    useEffect(() => {
        async function fetchStudents() {
            try {
                const res = await fetch('/api/students');
                const data = await res.json();
                setStudents(data);
                // Default to all students selected
                setSelectedStudentIds(data.map((s: any) => s.id));
            } catch (error) {
                console.error("Failed to fetch students:", error);
            }
        }
        fetchStudents();
    }, []);

    // Determine which domains to show based on Key Stage
    const isKS1 = selectedYear === "y1" || selectedYear === "y2";
    const domains = isKS1 ? READING_DOMAINS.KS1 : READING_DOMAINS.KS2;

    // Determine PiRA difficulty bands for the selected year
    const yearNumber = selectedYear ? parseInt(selectedYear.replace("y", "")) : null;
    const availableBands = yearNumber ? getDifficultyBandsForYear(yearNumber) : [];

    const handleAssign = async () => {
        if (!selectedYear || selectedDomainCodes.length === 0 || availableBands.length === 0) {
            alert("Please select a year group and at least one reading domain.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bandKey: availableBands[0],
                    targetDomainCodes: selectedDomainCodes,
                    topicContext: topicContext,
                    studentIds: selectedStudentIds,
                    questionCount: questionCount
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                const errorMessage = typeof errData.error === 'string'
                    ? errData.error
                    : (errData.error?.message || 'Failed to generate content');
                throw new Error(errorMessage);
            }

            const passageData = await response.json();
            console.log("Successfully generated passage:", passageData);
            alert(`Generated mission: "${passageData.passage.title}" with ${questionCount} questions!`);
        } catch (error: any) {
            console.error("AssignmentManager Error:", error);
            alert("Error generating mission: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-sky-100 shadow-sm">
            <CardHeader className="bg-sky-50/50 border-b border-sky-100 rounded-t-xl">
                <CardTitle className="text-xl text-sky-900">Create AI Mission</CardTitle>
                <CardDescription className="text-sky-700/70">
                    Generate custom reading practice tailored to your class.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                {/* 1. Year Group */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-sky-900 uppercase tracking-wider">1. Select Year Group</Label>
                    <Select onValueChange={(val) => { setSelectedYear(val); setSelectedDomainCodes([]); }}>
                        <SelectTrigger className="w-full md:w-[240px]">
                            <SelectValue placeholder="Select Year..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="y1">Year 1</SelectItem>
                            <SelectItem value="y2">Year 2</SelectItem>
                            <SelectItem value="y3">Year 3</SelectItem>
                            <SelectItem value="y4">Year 4</SelectItem>
                            <SelectItem value="y5">Year 5</SelectItem>
                            <SelectItem value="y6">Year 6</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 2. Reading Domains */}
                {selectedYear && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="text-sm font-bold text-sky-900 uppercase tracking-wider">2. Choose Reading Domains</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-sky-50/30 rounded-xl border border-sky-100">
                            {domains.map(domain => (
                                <div key={domain.code} className="flex items-start space-x-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                                    <Checkbox
                                        id={domain.code}
                                        checked={selectedDomainCodes.includes(domain.code)}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedDomainCodes(prev => [...prev, domain.code]);
                                            else setSelectedDomainCodes(prev => prev.filter(c => c !== domain.code));
                                        }}
                                    />
                                    <Label htmlFor={domain.code} className="text-sm leading-tight cursor-pointer">
                                        <span className="font-bold text-sky-700">{domain.code}</span>: {domain.description.split(':')[0]}
                                        <p className="text-[11px] text-sky-600/60 mt-0.5 line-clamp-1">{domain.description.split(':')[1] || domain.description}</p>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Question Count & Topic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-sky-900 uppercase tracking-wider">3. Question Count</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                min={1}
                                max={15}
                                value={questionCount}
                                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                                className="w-24 text-lg font-bold text-center"
                            />
                            <span className="text-sm text-sky-600 font-medium">Questions to generate</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-sky-900 uppercase tracking-wider">4. Optional Topic Context</Label>
                        <Input
                            placeholder="e.g. Victorian London, Space, Dinosaurs..."
                            value={topicContext}
                            onChange={(e) => setTopicContext(e.target.value)}
                            className="bg-white border-sky-100 focus:ring-sky-500"
                        />
                    </div>
                </div>

                {/* 5. Student Selection */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-sky-900 uppercase tracking-wider">5. Select Students</Label>
                    <div className="border border-sky-100 rounded-xl overflow-hidden">
                        <div className="bg-sky-50/50 p-3 border-b border-sky-100 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="selectAll"
                                    checked={selectedStudentIds.length === students.length && students.length > 0}
                                    onCheckedChange={(checked) => {
                                        if (checked) setSelectedStudentIds(students.map(s => s.id));
                                        else setSelectedStudentIds([]);
                                    }}
                                />
                                <Label htmlFor="selectAll" className="font-bold text-sky-800 text-sm">Select All Students ({students.length})</Label>
                            </div>
                            <span className="text-xs font-bold text-sky-600 tracking-widest">{selectedStudentIds.length} SELECTED</span>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto bg-white">
                            {students.map(student => (
                                <div key={student.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sky-50 transition-colors">
                                    <Checkbox
                                        id={student.id}
                                        checked={selectedStudentIds.includes(student.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedStudentIds(prev => [...prev, student.id]);
                                            else setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                                        }}
                                    />
                                    <Label htmlFor={student.id} className="text-sm cursor-pointer font-medium text-gray-700">
                                        {student.alias}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-sky-50/20 border-t border-sky-100 p-6">
                <Button
                    className="w-full text-lg py-8 shadow-md hover:shadow-lg transition-all"
                    onClick={handleAssign}
                    disabled={!selectedYear || selectedDomainCodes.length === 0 || isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 bg-white rounded-full animate-ping"></span>
                            Generating AI Mission...
                        </span>
                    ) : "🚀 Generate \u0026 Assign Mission"}
                </Button>
            </CardFooter>
        </Card>
    );
}
