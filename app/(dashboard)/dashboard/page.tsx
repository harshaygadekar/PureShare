import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
    const { userId } = await auth();

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-zinc-400 mt-1">
                    Welcome back! Here&apos;s an overview of your shares.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                    <p className="text-zinc-400 text-sm">Total Shares</p>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                    <p className="text-zinc-400 text-sm">Active Shares</p>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                    <p className="text-zinc-400 text-sm">Total Downloads</p>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
                    <p className="text-zinc-500">No shares yet. Create your first share!</p>
                    <a
                        href="/"
                        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                    >
                        Create Share
                    </a>
                </div>
            </div>

            {/* Debug info - can remove later */}
            <p className="text-xs text-zinc-600">User ID: {userId}</p>
        </div>
    );
}
