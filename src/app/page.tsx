'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Database, Share2, Layers, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b bg-white/50 backdrop-blur-md fixed top-0 w-full z-1000 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" className="w-8 h-8 rounded-lg" alt="Logo" />
            <span className="font-bold text-xl tracking-tight text-slate-900">SchemaFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <Button onClick={() => router.push('/register')} size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
            v1.0 Now Available 🎉
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Design databases <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">at the speed of thought.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The visual schema designer for modern teams. collaborative, intuitive, and designed for MongoDB & SQL.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button onClick={() => router.push('/editor/local')} size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white transition-all hover:scale-105">
              Try It Out (No Login)
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button onClick={() => router.push('/register')} variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-slate-50 transition-all">
              Sign Up Free
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-20 relative rounded-2xl border bg-slate-50/50 p-2 shadow-2xl shadow-slate-200/50 overflow-hidden transform hover:scale-[1.01] transition-transform duration-700">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
          {/* Placeholder for App Screenshot */}
          <div className="aspect-[16/9] bg-white rounded-xl overflow-hidden flex items-center justify-center border border-slate-100">
            <div className="text-slate-300 flex flex-col items-center">
              {/* In a real app, put a screenshot here */}
              <span className="text-9xl mb-4">🖥️</span>
              <span className="text-2xl font-medium">Application Preview</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          <FeatureCard
            icon={<Database className="w-6 h-6 text-blue-600" />}
            title="SQL & NoSQL"
            description="First-class support for both relational diagrams and MongoDB collections."
          />
          <FeatureCard
            icon={<Share2 className="w-6 h-6 text-purple-600" />}
            title="Real-time Collab"
            description="Design together with your team. See cursors and changes instantly."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-yellow-500" />}
            title="Instant Export"
            description="Generate production-ready SQL and Mongoose schemas in one click."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-slate-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
          <p>© 2026 SchemaFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
