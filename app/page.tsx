'use client';

/**
 * Home Page - File Upload and Share Creation
 * Premium liquid-glass design with revolutionary interactions
 */

import { useState } from 'react';
import { FileUpload } from '@/components/features/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/layout/container';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';
import { FiCopy, FiCheck, FiLock, FiClock, FiUploadCloud, FiShield, FiZap, FiLink } from 'react-icons/fi';
import { APP_CONFIG, SHARE_CONFIG } from '@/config/constants';
import { motion, AnimatePresence } from 'framer-motion';

// Testimonials data
const testimonials = [
  {
    quote: "PureShare has completely transformed how we share sensitive files with clients. The auto-expiring links give us peace of mind that our data won't be exposed indefinitely.",
    name: "Sarah Chen",
    designation: "CTO at TechStart",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop",
  },
  {
    quote: "The simplicity is what sold me. No accounts, no complex setup - just upload and share. Perfect for our fast-paced agency environment.",
    name: "Marcus Rodriguez",
    designation: "Creative Director at Design Co",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
  },
  {
    quote: "End-to-end encryption without compromising on speed. It's rare to find a file sharing service that gets both right.",
    name: "Emily Watson",
    designation: "Security Engineer at DataSafe",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop",
  },
];

// Bento Grid Features
const features = [
  {
    Icon: FiLock,
    name: "End-to-End Encrypted",
    description: "Military-grade encryption ensures your files are secure from upload to download.",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent" />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: FiZap,
    name: "Lightning Fast",
    description: "Optimized infrastructure delivers blazing-fast uploads and downloads.",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent" />
    ),
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: FiClock,
    name: "Auto-Expiring Links",
    description: "Set custom expiration times for enhanced security and control.",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent" />
    ),
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: FiShield,
    name: "Password Protection",
    description: "Add an extra layer of security with optional password protection.",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent" />
    ),
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3",
  },
  {
    Icon: FiLink,
    name: "Simple Sharing",
    description: "Generate shareable links instantly with zero complexity.",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent" />
    ),
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3",
  },
];

export default function HomePage() {
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

  if (shareLink) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-background via-surface/30 to-background">
          <Container size="md">
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md"
              >
                <Card className="overflow-hidden border-accent/20 glass">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-accent/10 to-success/10 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1.5 }}
                  />

                  <CardHeader className="text-center relative">
                    <motion.div
                      className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/20 relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full bg-success/20"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <FiCheck className="h-10 w-10 text-success relative z-10" />
                    </motion.div>
                    <CardTitle className="text-3xl">Share Created!</CardTitle>
                    <CardDescription>
                      Your files are ready to share
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-xs font-medium text-tertiary uppercase tracking-wider">Share Link</Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          value={shareLink}
                          readOnly
                          className="font-mono text-sm glass-input"
                        />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <LiquidButton
                            onClick={copyToClipboard}
                            variant="outline"
                            size="icon"
                            className={copied ? "border-success text-success" : ""}
                          >
                            <AnimatePresence mode="wait">
                              {copied ? (
                                <motion.div
                                  key="check"
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, rotate: 180 }}
                                >
                                  <FiCheck className="h-4 w-4" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="copy"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <FiCopy className="h-4 w-4" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </LiquidButton>
                        </motion.div>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Alert className="glass-subtle border-accent/20">
                        <AlertDescription className="space-y-3 text-sm">
                          <p className="font-semibold text-foreground">Share Details:</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-secondary">
                              <FiClock className="h-4 w-4 text-accent" />
                              <span>Expires in {expirationHours} hours</span>
                            </div>
                            {password && (
                              <div className="flex items-center gap-2 text-secondary">
                                <FiLock className="h-4 w-4 text-accent" />
                                <span>Password protected</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-secondary">
                              <FiUploadCloud className="h-4 w-4 text-accent" />
                              <span>{files.length} file{files.length !== 1 ? 's' : ''} uploaded</span>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <LiquidButton
                        onClick={() => {
                          setShareLink('');
                          setFiles([]);
                          setPassword('');
                          setUploadProgress(0);
                        }}
                        className="w-full group"
                        size="lg"
                      >
                        Create Another Share
                        <motion.div
                          className="ml-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FiUploadCloud className="h-5 w-5" />
                        </motion.div>
                      </LiquidButton>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-background via-surface/30 to-background">
        {/* Hero Section */}
        <section id="home" className="py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <motion.div
                className="mb-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="mb-3 text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  {APP_CONFIG.name}
                </h1>
                <p className="text-lg text-white/70">{APP_CONFIG.description}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="backdrop-blur-sm bg-background/95 border-border/50 shadow-strong glass">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <FiUploadCloud className="h-6 w-6 text-accent" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-2xl">Upload & Share Files</CardTitle>
                        <CardDescription>
                          Create a temporary share link for your files
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FileUpload
                      onFilesSelected={setFiles}
                      disabled={isUploading}
                    />

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Alert variant="destructive">
                            <AlertDescription className="flex items-center justify-between">
                              <span>{error}</span>
                              <LiquidButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setError('')}
                                className="h-auto p-1 hover:bg-destructive/20"
                              >
                                ✕
                              </LiquidButton>
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                          <FiLock className="h-4 w-4 text-accent" />
                          Password (Optional)
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isUploading}
                          className="glass-input transition-all duration-300"
                        />
                      </motion.div>

                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Label htmlFor="expiration" className="flex items-center gap-2 text-sm font-medium">
                          <FiClock className="h-4 w-4 text-accent" />
                          Expiration
                        </Label>
                        <Select
                          value={expirationHours}
                          onValueChange={setExpirationHours}
                          disabled={isUploading}
                        >
                          <SelectTrigger id="expiration" className="glass-input transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">24 hours</SelectItem>
                            <SelectItem value="48">48 hours</SelectItem>
                            <SelectItem value="72">3 days</SelectItem>
                            <SelectItem value="168">7 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isUploading && (
                        <motion.div
                          className="space-y-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex justify-between text-sm">
                            <motion.span
                              className="font-medium text-accent"
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              Uploading your files...
                            </motion.span>
                            <span className="font-mono text-foreground">{Math.round(uploadProgress)}%</span>
                          </div>
                          <div className="relative h-2 overflow-hidden rounded-full glass-subtle">
                            <motion.div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent/70 rounded-full shadow-lg"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                            <motion.div
                              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              animate={{ x: ["-100%", "400%"] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.div
                        whileHover={{ scale: files.length > 0 && !isUploading ? 1.02 : 1 }}
                        whileTap={{ scale: files.length > 0 && !isUploading ? 0.98 : 1 }}
                      >
                        <LiquidButton
                          onClick={handleCreateShare}
                          disabled={files.length === 0 || isUploading}
                          className="w-full relative overflow-hidden group"
                          size="lg"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={files.length > 0 && !isUploading ? { x: ["-100%", "100%"] } : {}}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="relative z-10">
                            {isUploading ? 'Uploading...' : 'Create Share Link'}
                          </span>
                        </LiquidButton>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Features Section - BentoGrid */}
        <section id="features" className="py-20 bg-surface/30">
          <Container>
            <motion.div
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Everything you need
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-secondary">
                Built with security and simplicity in mind. Share files without compromising on privacy or convenience.
              </p>
            </motion.div>

            <BentoGrid className="lg:grid-rows-2">
              {features.map((feature) => (
                <BentoCard key={feature.name} {...feature} />
              ))}
            </BentoGrid>
          </Container>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <Container>
            <motion.div
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                How it works
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-secondary">
                Three simple steps to secure file sharing
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Upload Files",
                  description: "Drag and drop or select files from your device. No size limits, no restrictions.",
                  icon: FiUploadCloud,
                },
                {
                  step: "02",
                  title: "Set Options",
                  description: "Choose expiration time and optionally add password protection for extra security.",
                  icon: FiLock,
                },
                {
                  step: "03",
                  title: "Share Link",
                  description: "Copy the generated link and share it with anyone. Files auto-delete after expiration.",
                  icon: FiLink,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative"
                >
                  <Card className="h-full glass hover:shadow-strong transition-shadow duration-300">
                    <CardContent className="p-8">
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                          <item.icon className="h-7 w-7 text-accent" />
                        </div>
                        <span className="text-4xl font-bold text-accent/20">{item.step}</span>
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-secondary">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-surface/30">
          <Container>
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Trusted by professionals
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-secondary">
                See what our users have to say about PureShare
              </p>
            </motion.div>

            <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
