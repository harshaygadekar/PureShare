'use client';

/**
 * Upload Page - File Upload and Share Creation
 * Contains file upload functionality and "Why PureShare" section
 */

import { useState } from 'react';
import { FileUpload } from '@/components/features/file-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/layout/header';
import { Container } from '@/components/layout/container';
import { FiCopy, FiCheck, FiLock, FiClock, FiUploadCloud, FiShield, FiZap, FiLink, FiArrowRight } from 'react-icons/fi';
import { APP_CONFIG, SHARE_CONFIG } from '@/config/constants';
import { motion } from 'framer-motion';

export default function UploadPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [password, setPassword] = useState('');
    const [expirationHours, setExpirationHours] = useState(SHARE_CONFIG.defaultExpirationHours.toString());
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const handleCreateShare = async () => {
        if (files.length === 0) {
            setError('Please select at least one file');
            return;
        }

        setError('');
        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Step 1: Create share
            const createResponse = await fetch('/api/upload/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: password || undefined,
                    expirationHours: parseInt(expirationHours),
                }),
            });

            if (!createResponse.ok) {
                throw new Error('Failed to create share');
            }

            const { shareLink: link } = await createResponse.json();

            // Step 2: Upload files
            const totalFiles = files.length;
            let uploadedFiles = 0;

            for (const file of files) {
                const registerResponse = await fetch('/api/upload/files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        shareLink: link,
                        filename: file.name,
                        size: file.size,
                        mimeType: file.type,
                    }),
                });

                if (!registerResponse.ok) {
                    const errorData = await registerResponse.json();
                    throw new Error(`Failed to register file ${file.name}: ${errorData.message || errorData.error || 'Unknown error'}`);
                }

                const { previewUrl } = await registerResponse.json();

                await fetch(previewUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type,
                    },
                });

                uploadedFiles++;
                setUploadProgress((uploadedFiles / totalFiles) * 100);
            }

            const fullLink = `${APP_CONFIG.url}/share/${link}`;
            setShareLink(fullLink);
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload files. Please try again.';
            setError(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const resetForm = () => {
        setShareLink('');
        setFiles([]);
        setPassword('');
        setUploadProgress(0);
    };

    // Success state - Share created
    if (shareLink) {
        return (
            <>
                <Header />
                <main
                    id="main-content"
                    className="min-h-screen pt-24 pb-16"
                    style={{ backgroundColor: 'var(--color-bg-primary)' }}
                >
                    <Container>
                        <div className="flex min-h-[60vh] items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="w-full max-w-md"
                            >
                                <div
                                    className="rounded-2xl p-8"
                                    style={{
                                        backgroundColor: 'var(--color-bg-elevated)',
                                        border: '1px solid var(--color-border)',
                                        boxShadow: 'var(--shadow-medium)',
                                    }}
                                >
                                    {/* Success Icon */}
                                    <div className="mb-6 text-center">
                                        <div
                                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                                            style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)' }}
                                        >
                                            <FiCheck className="h-8 w-8" style={{ color: 'var(--color-success)' }} />
                                        </div>
                                        <h1
                                            className="text-2xl font-semibold"
                                            style={{ color: 'var(--color-text-primary)' }}
                                        >
                                            Share Created!
                                        </h1>
                                        <p
                                            className="mt-2 text-sm"
                                            style={{ color: 'var(--color-text-secondary)' }}
                                        >
                                            Your files are ready to share
                                        </p>
                                    </div>

                                    {/* Share Link */}
                                    <div className="mb-6">
                                        <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                                            Share Link
                                        </Label>
                                        <div className="mt-2 flex gap-2">
                                            <Input
                                                value={shareLink}
                                                readOnly
                                                className="font-mono text-sm"
                                            />
                                            <Button
                                                onClick={copyToClipboard}
                                                variant="outline"
                                                className="shrink-0"
                                            >
                                                {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Share Details */}
                                    <div
                                        className="mb-6 rounded-xl p-4"
                                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                    >
                                        <p className="mb-3 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                            Share details
                                        </p>
                                        <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            <div className="flex items-center gap-2">
                                                <FiClock className="h-4 w-4" style={{ color: 'var(--color-interactive)' }} />
                                                <span>Expires in {expirationHours} hours</span>
                                            </div>
                                            {password && (
                                                <div className="flex items-center gap-2">
                                                    <FiLock className="h-4 w-4" style={{ color: 'var(--color-interactive)' }} />
                                                    <span>Password protected</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <FiUploadCloud className="h-4 w-4" style={{ color: 'var(--color-interactive)' }} />
                                                <span>{files.length} file{files.length !== 1 ? 's' : ''} uploaded</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Create Another */}
                                    <Button onClick={resetForm} className="w-full">
                                        Create Another Share
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </Container>
                </main>
            </>
        );
    }

    // Main upload form
    return (
        <>
            <Header />
            <main
                id="main-content"
                className="min-h-screen pt-8 pb-12"
                style={{ backgroundColor: 'var(--color-bg-primary)' }}
            >
                {/* Upload Section */}
                <section className="py-6">
                    <Container>
                        <div className="mx-auto max-w-2xl">
                            {/* Header */}
                            <motion.div
                                className="mb-6 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h1
                                    className="mb-3"
                                    style={{
                                        fontSize: 'clamp(32px, 5vw, 48px)',
                                        fontWeight: 'var(--font-bold)',
                                        color: 'var(--color-text-primary)',
                                    }}
                                >
                                    Upload & Share
                                </h1>
                                <p
                                    style={{
                                        fontSize: 'var(--text-body-lg)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    Upload files, get a link, share with anyone. Files auto-delete after expiration.
                                </p>
                            </motion.div>

                            {/* Upload Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                            >
                                <div
                                    className="rounded-2xl p-8"
                                    style={{
                                        backgroundColor: 'var(--color-bg-elevated)',
                                        border: '1px solid var(--color-border)',
                                        boxShadow: 'var(--shadow-medium)',
                                    }}
                                >
                                    {/* File Upload */}
                                    <FileUpload
                                        onFilesSelected={setFiles}
                                        disabled={isUploading}
                                    />

                                    {/* Error Alert */}
                                    {error && (
                                        <Alert variant="destructive" className="mt-6">
                                            <AlertDescription className="flex items-center justify-between">
                                                <span>{error}</span>
                                                <button
                                                    onClick={() => setError('')}
                                                    className="text-sm font-medium hover:opacity-70"
                                                >
                                                    ✕
                                                </button>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Options Grid */}
                                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                                                <FiLock className="h-4 w-4" style={{ color: 'var(--color-interactive)' }} />
                                                Password (Optional)
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Enter password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isUploading}
                                            />
                                        </div>

                                        {/* Expiration */}
                                        <div className="space-y-2">
                                            <Label htmlFor="expiration" className="flex items-center gap-2 text-sm font-medium">
                                                <FiClock className="h-4 w-4" style={{ color: 'var(--color-interactive)' }} />
                                                Expiration
                                            </Label>
                                            <Select
                                                value={expirationHours}
                                                onValueChange={setExpirationHours}
                                                disabled={isUploading}
                                            >
                                                <SelectTrigger id="expiration">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="24">24 hours</SelectItem>
                                                    <SelectItem value="48">48 hours</SelectItem>
                                                    <SelectItem value="72">3 days</SelectItem>
                                                    <SelectItem value="168">7 days</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {isUploading && (
                                        <div className="mt-6 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span style={{ color: 'var(--color-interactive)' }}>Uploading...</span>
                                                <span style={{ color: 'var(--color-text-primary)' }}>{Math.round(uploadProgress)}%</span>
                                            </div>
                                            <div
                                                className="h-2 overflow-hidden rounded-full"
                                                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                            >
                                                <div
                                                    className="h-full rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${uploadProgress}%`,
                                                        backgroundColor: 'var(--color-interactive)',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="mt-6">
                                        <Button
                                            onClick={handleCreateShare}
                                            disabled={files.length === 0 || isUploading}
                                            size="lg"
                                            className="w-full"
                                        >
                                            {isUploading ? 'Uploading...' : 'Create Share Link'}
                                            {!isUploading && <FiArrowRight className="ml-2 h-5 w-5" />}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </Container>
                </section>

                {/* Features Section - Why PureShare */}
                <section
                    className="py-20"
                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                >
                    <Container>
                        <div className="mb-12 text-center">
                            <h2
                                style={{
                                    fontSize: 'var(--text-h2)',
                                    fontWeight: 'var(--font-semibold)',
                                    color: 'var(--color-text-primary)',
                                }}
                            >
                                Why PureShare?
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                {
                                    icon: FiShield,
                                    title: 'End-to-End Encrypted',
                                    description: 'Military-grade encryption protects your files from upload to download.',
                                },
                                {
                                    icon: FiZap,
                                    title: 'Lightning Fast',
                                    description: 'Optimized infrastructure delivers blazing-fast uploads and downloads.',
                                },
                                {
                                    icon: FiLink,
                                    title: 'Simple Sharing',
                                    description: 'Generate shareable links instantly. No accounts required for recipients.',
                                },
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="rounded-xl p-6 text-center"
                                    style={{
                                        backgroundColor: 'var(--color-bg-elevated)',
                                        border: '2px solid var(--color-border)',
                                        boxShadow: 'var(--shadow-soft)',
                                    }}
                                >
                                    <div
                                        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                    >
                                        <feature.icon className="h-6 w-6" style={{ color: 'var(--color-interactive)' }} />
                                    </div>
                                    <h3
                                        className="mb-2 text-lg font-semibold"
                                        style={{ color: 'var(--color-text-primary)' }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </Container>
                </section>
            </main>
        </>
    );
}
