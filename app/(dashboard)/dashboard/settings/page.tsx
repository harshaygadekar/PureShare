/**
 * Settings Page
 * User account settings - Light Theme with proper card design
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Mail, Calendar, User, Shield } from 'lucide-react';

export default async function SettingsPage() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
        redirect('/');
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    Settings
                </h1>
                <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Manage your account and preferences.
                </p>
            </div>

            {/* Account Info Card */}
            <div
                className="rounded-xl border overflow-hidden"
                style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border)',
                }}
            >
                {/* Card Header */}
                <div
                    className="px-6 py-4 border-b flex items-center gap-3"
                    style={{ borderColor: 'var(--color-border)' }}
                >
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                        <User
                            className="h-5 w-5"
                            style={{ color: 'var(--color-interactive)' }}
                            strokeWidth={1.5}
                        />
                    </div>
                    <div>
                        <h2
                            className="text-lg font-semibold"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            Account Information
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Your personal account details
                        </p>
                    </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="flex items-start gap-3">
                            <div
                                className="p-2 rounded-lg mt-0.5"
                                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                            >
                                <Mail
                                    className="h-4 w-4"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                    strokeWidth={1.5}
                                />
                            </div>
                            <div>
                                <label
                                    className="text-xs uppercase tracking-wide font-medium"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                >
                                    Email Address
                                </label>
                                <p
                                    className="mt-1 font-medium"
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    {user?.primaryEmailAddress?.emailAddress || 'Not available'}
                                </p>
                            </div>
                        </div>

                        {/* Member Since */}
                        <div className="flex items-start gap-3">
                            <div
                                className="p-2 rounded-lg mt-0.5"
                                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                            >
                                <Calendar
                                    className="h-4 w-4"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                    strokeWidth={1.5}
                                />
                            </div>
                            <div>
                                <label
                                    className="text-xs uppercase tracking-wide font-medium"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                >
                                    Member Since
                                </label>
                                <p
                                    className="mt-1 font-medium"
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })
                                        : 'Not available'}
                                </p>
                            </div>
                        </div>

                        {/* User ID */}
                        <div className="flex items-start gap-3">
                            <div
                                className="p-2 rounded-lg mt-0.5"
                                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                            >
                                <Shield
                                    className="h-4 w-4"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                    strokeWidth={1.5}
                                />
                            </div>
                            <div>
                                <label
                                    className="text-xs uppercase tracking-wide font-medium"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                >
                                    User ID
                                </label>
                                <p
                                    className="mt-1 font-mono text-sm"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    {userId.slice(0, 16)}...
                                </p>
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="flex items-start gap-3">
                            <div
                                className="p-2 rounded-lg mt-0.5"
                                style={{ backgroundColor: 'var(--color-success-bg)' }}
                            >
                                <div
                                    className="h-4 w-4 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'var(--color-success)' }}
                                >
                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label
                                    className="text-xs uppercase tracking-wide font-medium"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                >
                                    Account Status
                                </label>
                                <p
                                    className="mt-1 font-medium"
                                    style={{ color: 'var(--color-success)' }}
                                >
                                    Active
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Notice */}
            <div
                className="rounded-xl border p-6"
                style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border)',
                }}
            >
                <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    Privacy & Security
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Your files are encrypted and automatically deleted after expiration.
                    We do not store or analyze the content of your shared files.
                </p>
            </div>
        </div>
    );
}
