import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StudentLogin() {
    return (
        <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-sky-100">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-4xl font-black text-sky-700 mb-2">
                        ReadIntervene
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Welcome back! Enter your Alias and PIN to start reading.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="alias" className="text-lg font-bold text-gray-700">Your Alias</Label>
                        <Input
                            id="alias"
                            placeholder="e.g. BlueTiger4"
                            className="text-2xl py-6 text-center"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pin" className="text-lg font-bold text-gray-700">Your PIN</Label>
                        <Input
                            id="pin"
                            type="password"
                            placeholder="****"
                            maxLength={4}
                            className="text-3xl py-6 text-center tracking-[1em] font-mono"
                        />
                    </div>
                    <Button className="w-full text-xl py-8 bg-sky-600 hover:bg-sky-700 transition-colors rounded-xl">
                        Let's Go! 🚀
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
