'use client';

import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
    const router = useRouter();

    const handleSubscribe = async () => {
        // MOCK: This would call the backend to create a Stripe checkout session
        alert("Redirecting to Stripe Checkout... (Mock)");
        // window.location.href = session.url;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-20">
            <div className="absolute top-8 left-8">
                <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>

            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade to Pro</h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                    Unlock advanced collaboration features and unlimited projects.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl px-8 w-full">
                {/* Free Plan */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
                    <p className="text-gray-500 mb-6">For hobbyists and students.</p>
                    <div className="text-4xl font-bold text-gray-900 mb-8">$0<span className="text-lg text-gray-500 font-normal">/mo</span></div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center text-gray-700">
                            <Check className="w-5 h-5 text-green-500 mr-3" />
                            Unlimited Personal Projects
                        </li>
                        <li className="flex items-center text-gray-700">
                            <Check className="w-5 h-5 text-green-500 mr-3" />
                            Visual Editor
                        </li>
                        <li className="flex items-center text-gray-700">
                            <Check className="w-5 h-5 text-green-500 mr-3" />
                            Import/Export SQL & JSON
                        </li>
                    </ul>

                    <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                </div>

                {/* Pro Plan */}
                <div className="bg-white rounded-2xl p-8 border-2 border-blue-600 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        RECOMMENDED
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro Team</h2>
                    <p className="text-gray-500 mb-6">For professional teams.</p>
                    <div className="text-4xl font-bold text-gray-900 mb-8">$15<span className="text-lg text-gray-500 font-normal">/mo</span></div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center text-gray-700">
                            <Check className="w-5 h-5 text-blue-600 mr-3" />
                            Everything in Free
                        </li>
                        <li className="flex items-center text-gray-700">
                            <Check className="w-5 h-5 text-blue-600 mr-3" />
                            Real-time Collaboration
                        </li>
                        <li className="flex items-center text-gray-700">
                            <Check className="w-5 h-5 text-blue-600 mr-3" />
                            Team Workspaces
                        </li>
                        <li className="flex items-center text-gray-700">
                            <Check className="w-5 h-5 text-blue-600 mr-3" />
                            Version History & Restore
                        </li>
                    </ul>

                    <Button
                        onClick={handleSubscribe}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Upgrade Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
