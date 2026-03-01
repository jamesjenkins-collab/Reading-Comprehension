import { StudentCardGenerator } from "@/components/teacher/StudentCardGenerator";

export default function StudentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
            </div>

            <p className="text-muted-foreground">
                Manage auto-generated aliases, view PiRA baseline scores, and print login cards for your classroom.
            </p>

            <StudentCardGenerator />
        </div>
    );
}
