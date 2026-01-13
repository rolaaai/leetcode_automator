import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';

export default async function LoginPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-accent-primary/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent-secondary/20 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-bg flex items-center justify-center shadow-2xl shadow-accent-primary/30">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">LeetCode AI</h1>
                    <p className="text-foreground-secondary">
                        Search and explore LeetCode problems with AI
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-background-secondary/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                        Welcome back
                    </h2>

                    <form action="/auth/google" method="POST">
                        <input type="hidden" name="provider" value="google" />
                        <a
                            href="/auth/google"
                            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    style={{ fill: '#4285F4' }}
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    style={{ fill: '#34A853' }}
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    style={{ fill: '#FBBC05' }}
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    style={{ fill: '#EA4335' }}
                                />
                            </svg>
                            Continue with Google
                        </a>
                    </form>

                    <div className="mt-6 text-center text-sm text-foreground-secondary">
                        By continuing, you agree to our{' '}
                        <a href="#" className="text-accent-primary hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-accent-primary hover:underline">Privacy Policy</a>
                    </div>
                </div>

                {/* Features preview */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    {[
                        { icon: '🔍', label: 'Search' },
                        { icon: '📚', label: 'History' },
                        { icon: '⚡', label: 'Fast' },
                    ].map((feature) => (
                        <div key={feature.label} className="p-4 rounded-xl bg-background-secondary/50 border border-border/50">
                            <div className="text-2xl mb-2">{feature.icon}</div>
                            <div className="text-sm text-foreground-secondary">{feature.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
