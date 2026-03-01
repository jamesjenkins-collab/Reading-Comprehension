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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, User } from "lucide-react";
import { AssignmentDetail } from "@/components/teacher/AssignmentDetail";

export default function TeacherAssignmentsPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);

    useEffect(() => {
        async function fetchAssignments() {
            try {
                const res = await fetch('/api/assignments');
                const data = await res.json();
                setAssignments(data);
            } catch (error) {
                console.error("Failed to fetch assignments:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAssignments();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
                    <p className="text-muted-foreground">Manage and track all reading missions assigned to your class.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Assignment History</CardTitle>
                    <CardDescription>
                        All AI-generated reading passages and their current status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-12 text-center text-muted-foreground animate-pulse">Loading assignments...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Passage Title</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Date Assigned</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-semibold flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-indigo-500" />
                                            {assignment.moduleName}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                {assignment.student?.alias || "Unknown Student"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(assignment.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                                                {assignment.status === 'completed' ? 'Completed' : 'Assigned'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedAssignment(assignment)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {assignments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                                            No assignments found. Go to the dashboard to generate your first AI reading mission!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {selectedAssignment && (
                <AssignmentDetail
                    assignment={selectedAssignment}
                    onClose={() => setSelectedAssignment(null)}
                />
            )}
        </div>
    );
}
