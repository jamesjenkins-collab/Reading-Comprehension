'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react';

export default function TeacherLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/teacher-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed');
                return;
            }

            router.push('/teacher');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            {/* Background blobs */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[15%] left-[10%] h-72 w-72 rounded-full bg-blue-200 opacity-20 blur-3xl animate-pulse" />
                <div className="absolute bottom-[15%] right-[10%] h-96 w-96 rounded-full bg-indigo-200 opacity-20 blur-3xl animate-pulse delay-700" />
            </div>

            <Card className="w-full max-w-md shadow-2xl border-blue-100/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-2 pt-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                        <GraduationCap className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold text-gray-900">
                        Teacher Portal
                    </CardTitle>
                    <CardDescription className="text-base text-slate-500 mt-1">
                        Sign in to manage your classes and students
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6 pb-8 px-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 text-base"
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 text-base"
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
