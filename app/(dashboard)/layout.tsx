/**
 * Dashboard Layout
 * Protected layout with sidebar navigation - Light Theme
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';

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
        <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
