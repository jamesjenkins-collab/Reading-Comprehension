import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassOverview } from "@/components/teacher/ClassOverview";
import { AssignmentManager } from "@/components/teacher/AssignmentManager";
import { DomainHeatmap } from "@/components/teacher/DomainHeatmap";

export default function TeacherDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Students
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">28</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Interventions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            Across 3 reading domains
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg. Completion Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">76%</div>
                        <p className="text-xs text-muted-foreground">
                            +4% from last week
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Class Overview</TabsTrigger>
                    <TabsTrigger value="assignments">Assign Work (AI)</TabsTrigger>
                    <TabsTrigger value="analytics">Domain Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <ClassOverview />
                </TabsContent>
                <TabsContent value="assignments" className="space-y-4">
                    <AssignmentManager />
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                    <Card className="border-sky-100 shadow-sm">
                        <CardHeader className="bg-sky-50/50 rounded-t-xl border-b border-sky-100">
                            <CardTitle className="text-xl text-sky-900">Class Proficiency Heatmap</CardTitle>
                            <CardDescription className="text-sky-700/70">
                                Real-time performance tracking across National Curriculum reading domains.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <DomainHeatmap />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
