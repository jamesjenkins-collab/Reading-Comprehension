'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Users, LayoutDashboard, LogOut } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/teacher/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-700">
            <BookOpen className="h-6 w-6" />
            ReadIntervene
          </h1>
          <p className="text-sm text-gray-500 mt-1">Teacher Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/teacher" className="flex items-center gap-3 px-3 py-2 rounded-md bg-indigo-50 text-indigo-700 font-medium">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/teacher/students" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium">
            <Users className="h-5 w-5" />
            My Class
          </Link>
          <Link href="/teacher/assignments" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium">
            <BookOpen className="h-5 w-5" />
            Assignments
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 w-full px-3 py-2 rounded-md transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
