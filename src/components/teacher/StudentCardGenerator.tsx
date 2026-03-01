import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Plus } from "lucide-react";

export function StudentCardGenerator() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Generate Login Cards</CardTitle>
                <CardDescription>
                    Create physical login cards for your students. The system uses secure Aliases and PINs without storing PII.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-6">
                    <Input placeholder="Number of new aliases to generate..." type="number" className="max-w-[200px]" />
                    <Button variant="secondary">
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Aliases
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Example Cards */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-500 mb-1">Alias</p>
                            <p className="font-bold text-lg mb-2 text-indigo-700">BlueTiger{i}</p>
                            <p className="text-sm text-gray-500 mb-1">PIN</p>
                            <p className="font-mono text-xl tracking-widest">{1000 + i}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full sm:w-auto">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Login Cards
                </Button>
            </CardFooter>
        </Card>
    );
}
