'use client';

import { Button } from '@/components/ui/button';
import {
    Database,
    Github,
    Check,
    ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 flex flex-col">

            {/* Navbar (Simplified for subpage) */}
            <nav className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                            <ArrowLeft className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                                Log in
                            </Link>
                            <Button onClick={() => router.push('/register')} size="sm" className="bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10">
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow pt-32 pb-20">
                <div className="text-center mb-16 px-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">Simple, transparent pricing.</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Start building your database schemas for free. Upgrade when you're ready to scale your team.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Free Tier */}
                        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative hover:-translate-y-1 transition-all duration-300">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Hobby</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-slate-900">₹0</span>
                                <span className="text-slate-500">/month</span>
                            </div>
                            <p className="text-slate-600 text-sm mb-6">Perfect for side projects and learning.</p>
                            <Button variant="outline" size="lg" className="w-full mb-8" onClick={() => router.push('/register')}>Get Started</Button>
                            <ul className="space-y-4 text-sm text-slate-600">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> 3 Projects</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> Community Support</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> Basic Export</li>
                            </ul>
                        </div>

                        {/* Pro Tier (Popular) */}
                        <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl shadow-blue-900/20 relative transform md:-translate-y-4 border-2 border-blue-500 flex flex-col">
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">Most Popular</div>
                            <h3 className="text-lg font-semibold mb-2">Pro</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">₹10</span>
                                <span className="text-slate-400">/month</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-6">For professional developers and small teams.</p>
                            <Button size="lg" className="w-full mb-8 bg-blue-600 hover:bg-blue-500 text-white border-0" onClick={() => router.push('/register')}>Upgrade to Pro</Button>
                            <div className="border-t border-slate-800 my-4"></div>
                            <ul className="space-y-4 text-sm text-slate-300 flex-1">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Unlimited Projects</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Unlimited Collaborators</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Advanced Export (Prisma, SQL)</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Priority Support</li>
                            </ul>
                        </div>

                        {/* Enterprise Tier */}
                        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative hover:-translate-y-1 transition-all duration-300">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Enterprise</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-slate-900">Custom</span>
                            </div>
                            <p className="text-slate-600 text-sm mb-6">For large organizations requiring security.</p>
                            <Button variant="outline" size="lg" className="w-full mb-8" onClick={() => window.location.href = 'mailto:sales@schemaflow.com'}>Contact Sales</Button>
                            <ul className="space-y-4 text-sm text-slate-600">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> SSO & SAML</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> Dedicated Success Manager</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> On-premise Deployment</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> Audit Logs</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 bg-white border-t border-slate-100 md:mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                            <Database className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-lg text-slate-900">SchemaFlow</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        © 2026 SchemaFlow. Open Source & Proud.
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Github className="w-5 h-5" /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
