import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/');
    }

    return (
        <div className="flex min-h-screen bg-zinc-950">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-950/50 p-6 hidden md:block">
                <nav className="space-y-2">
                    <a
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none transition-colors"
                    >
                        Overview
                    </a>
                    <a
                        href="/dashboard/shares"
                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none transition-colors"
                    >
                        My Shares
                    </a>
                    <a
                        href="/dashboard/analytics"
                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none transition-colors"
                    >
                        Analytics
                    </a>
                    <a
                        href="/dashboard/settings"
                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none transition-colors"
                    >
                        Settings
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
