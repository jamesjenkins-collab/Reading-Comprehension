"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PIRA_BANDS, PiraDifficultyBand } from "@/lib/pira";

export function ClassOverview() {
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStudents() {
            try {
                const res = await fetch('/api/students');
                const data = await res.json();
                setStudents(data);
            } catch (error) {
                console.error("Failed to fetch students:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStudents();
    }, []);

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading class data...</div>;

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student Alias</TableHead>
                        <TableHead>PiRA Baseline</TableHead>
                        <TableHead>Target Reading Level</TableHead>
                        <TableHead>Active Module</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => {
                        const lastAssignment = student.assignments?.[0];
                        const bandKey = "MID_KS2"; // Default for demo if not set
                        return (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium">{student.alias}</TableCell>
                                <TableCell>100</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {PIRA_BANDS[bandKey as PiraDifficultyBand].label}
                                    </Badge>
                                </TableCell>
                                <TableCell>{lastAssignment?.moduleName || "None Assigned"}</TableCell>
                                <TableCell>{lastAssignment ? new Date(lastAssignment.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">View</Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {students.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No students found. Try seeding the database or adding students.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
