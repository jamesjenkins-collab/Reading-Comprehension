import Link from "next/link";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fdfcfb] text-[#1a1c1e] selection:bg-[#e2e8f0]">
      {/* Background patterns */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] h-64 w-64 rounded-full bg-blue-100 opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] h-96 w-96 rounded-full bg-indigo-100 opacity-20 blur-3xl animate-pulse delay-700" />
      </div>

      <main className="container mx-auto flex max-w-5xl flex-col items-center px-6 py-12 text-center md:py-24">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm">
          <BookOpen className="h-4 w-4" />
          <span>Intelligent Reading Assistance</span>
        </div>

        <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
          Empowering <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Young Readers</span>
        </h1>

        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          Adaptive interventions powered by AI to help students navigate their reading journey.
          Personalized passages, instant feedback, and data-driven insights.
        </p>

        <div className="grid w-full gap-6 sm:grid-cols-2 lg:max-w-4xl">
          <Link
            href="/teacher"
            className="group relative flex flex-col items-start rounded-3xl border border-blue-100 bg-white p-8 text-left transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-4 ring-blue-50 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight">Teacher Portal</h2>
            <p className="mb-6 text-slate-500">
              Manage classes, generate AI-powered assignments, and track domain-specific progress for every student.
            </p>
            <div className="mt-auto flex items-center gap-2 font-semibold text-blue-600 transition-colors group-hover:text-blue-700">
              Go to Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/student"
            className="group relative flex flex-col items-start rounded-3xl border border-indigo-100 bg-white p-8 text-left transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
              <BookOpen className="h-7 w-7" />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight">Student Hub</h2>
            <p className="mb-6 text-slate-500">
              Access your personalized reading journey, complete assignments, and earn achievements as you progress.
            </p>
            <div className="mt-auto flex items-center gap-2 font-semibold text-indigo-600 transition-colors group-hover:text-indigo-700">
              Start Reading
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        <footer className="mt-20 text-sm font-medium text-slate-400">
          Powered by Gemini AI & Next.js
        </footer>
      </main>
    </div>
  );
}
