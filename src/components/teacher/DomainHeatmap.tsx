"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function DomainHeatmap() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchHeatmap() {
            try {
                const res = await fetch('/api/analytics/heatmap');
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error("Heatmap fetch error:", e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchHeatmap();
    }, []);

    const getColor = (percent: number) => {
        if (percent >= 80) return "bg-green-500";
        if (percent >= 50) return "bg-yellow-400";
        if (percent > 0) return "bg-orange-400";
        return "bg-red-500";
    };

    if (isLoading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading heatmap...</div>;
    if (!data || data.students.length === 0) return <div className="p-12 text-center text-muted-foreground italic">No student response data yet. Start a mission to see analytics.</div>;

    return (
        <div className="overflow-x-auto p-4 bg-white rounded-xl border border-sky-100 shadow-sm">
            <table className="w-full border-separate border-spacing-2">
                <thead>
                    <tr>
                        <th className="text-left text-xs font-bold text-sky-900 uppercase tracking-tighter w-32">Student</th>
                        {data.domains.map((domain: string) => (
                            <th key={domain} className="text-center text-[10px] font-black text-sky-700 uppercase p-2 min-w-[60px]">
                                {domain}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.students.map((student: any) => (
                        <tr key={student.id}>
                            <td className="text-sm font-semibold text-sky-800 pr-4">{student.alias}</td>
                            {data.domains.map((domain: string) => {
                                const stats = data.heatmap[student.id]?.[domain];
                                const percent = stats ? (stats.correct / stats.total) * 100 : null;

                                return (
                                    <td key={domain} className="p-0">
                                        <div
                                            title={percent !== null ? `${student.alias} - ${domain}: ${stats.correct}/${stats.total} Correct (${Math.round(percent)}%)` : 'No data'}
                                            className={`h-12 w-full rounded-md transition-all cursor-help border-2 border-white shadow-sm flex items-center justify-center
                                                ${percent === null ? 'bg-gray-100' : getColor(percent)}`}
                                        >
                                            {percent !== null && (
                                                <span className="text-white text-[10px] font-bold">{Math.round(percent)}%</span>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-8 flex gap-4 text-xs font-medium justify-center border-t pt-4 border-dashed border-sky-100">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500"></div> 0-49% (Urgent)</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-400"></div> 50-79% (Focus)</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500"></div> 80%+ (Secure)</div>
            </div>
        </div>
    );
}
