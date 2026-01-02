'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Database,
  Share2,
  Zap,
  Code2,
  Layout,
  Github,
  CheckCircle2,
  MousePointer2,
  ChevronDown,
  Search,
  Settings,
  Plus,
  Minus,
  Maximize2,
  Link2,
  Key,
  Star,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white overflow-hidden font-sans selection:bg-blue-100">

      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">SchemaFlow</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
              <Link href="/price" className="hover:text-blue-600 transition-colors">Pricing</Link>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
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

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center space-y-8 relative">

          {/* Floating Elements (Decorative) */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl opacity-50 animate-pulse-slow delay-700"></div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-4 animate-fade-in group cursor-pointer hover:bg-blue-100 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            v1.0 is now live
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.1] animate-slide-up">
            Database design that <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">feels like magic.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-slide-up [animation-delay:0.1s]">
            The visual schema designer for modern engineering teams.
            Collaborative, intuitive, and designed for both <span className="text-slate-900 font-semibold">MongoDB</span> & <span className="text-slate-900 font-semibold">SQL</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-slide-up [animation-delay:0.2s]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-2xl shadow-blue-600/30 bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 transition-all duration-300 w-full sm:w-auto flex items-center gap-2">
                  <Zap className="w-5 h-5 fill-current" />
                  Try Editor
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 p-2 bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-xl rounded-xl">
                <DropdownMenuLabel className="text-xs text-slate-500 uppercase tracking-wider font-semibold px-2 pb-2">Select Database Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/editor/local?type=MYSQL')} className="cursor-pointer py-3 px-3 rounded-lg focus:bg-blue-50 focus:text-blue-700">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-500" /> Relational
                    </span>
                    <span className="text-xs text-slate-500">SQL, Postgres, MySQL</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/editor/local?type=MONGODB')} className="cursor-pointer py-3 px-3 rounded-lg focus:bg-green-50 focus:text-green-700 mt-1">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="w-4 h-4 rounded text-xs border border-green-500 text-green-600 flex items-center justify-center font-bold">M</span> Document
                    </span>
                    <span className="text-xs text-slate-500">MongoDB, Mongoose</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => router.push('/register')} variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all w-full sm:w-auto bg-white/50 backdrop-blur-sm text-slate-700">
              <Github className="mr-2 w-5 h-5" />
              Sign Up Free
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-slate-500 animate-fade-in [animation-delay:0.4s]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Free for individuals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Open Source</span>
            </div>
          </div>
        </div>

        {/* Hero Image / Editor Preview */}
        <div className="mt-20 relative animate-slide-up [animation-delay:0.3s]">
          <div className="absolute inset-x-0 -top-24 -bottom-24 bg-gradient-to-b from-blue-50/50 via-white to-white rounded-[3rem] -z-10"></div>

          <div className="relative rounded-xl border border-slate-200/60 bg-white shadow-2xl shadow-blue-900/10 ring-1 ring-slate-900/5 overflow-hidden group select-none">
            {/* Fake App Window Header */}
            <div className="h-12 border-b bg-slate-50/50 backdrop-blur-md flex items-center px-4 justify-between select-none">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="opacity-50">/</span>
                  <span>ecommerce-v1</span>
                  <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded ml-2 font-bold uppercase tracking-wider">Draft</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-pink-500 text-white flex items-center justify-center text-xs font-bold">S</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 text-white flex items-center justify-center text-xs font-bold">M</div>
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-2">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 gap-2">
                  <Zap className="w-3.5 h-3.5" /> Deploy
                </Button>
              </div>
            </div>

            <div className="flex h-[600px] bg-slate-50 relative overflow-hidden">
              {/* Canvas Background Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"></div>

              {/* Main Canvas Area */}
              <div className="flex-1 relative">

                {/* Floating Toolbar (Mimicking Real App) */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-slate-200 p-1.5 flex items-center gap-1 z-20">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                    <MousePointer2 className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600">
                    <Layout className="w-4 h-4" /> Add Table
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-2 text-slate-600 hover:bg-green-50 hover:text-green-600">
                    <Code2 className="w-4 h-4" /> Add Enum
                  </Button>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {/* Nodes Container */}
                <div className="absolute inset-0 p-10 overflow-hidden transform scale-100 origin-top-left transition-transform duration-500 ease-in-out">

                  {/* Node 1: Users */}
                  <div className="absolute top-20 left-20 w-64 bg-white rounded-lg shadow-xl border border-slate-200/60 overflow-hidden group/node hover:ring-2 hover:ring-blue-500/50 transition-all cursor-grab active:cursor-grabbing">
                    <div className="h-2 bg-blue-500 w-full"></div>
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-blue-500" /> users
                      </span>
                      <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                    </div>
                    <div className="p-2 space-y-1">
                      <div className="flex items-center justify-between group/field hover:bg-blue-50 p-1.5 rounded cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <Key className="w-3 h-3 text-yellow-500 rotate-45" />
                          <span className="text-xs font-medium text-slate-700">id</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">UUID</span>
                      </div>
                      <div className="flex items-center justify-between group/field hover:bg-slate-50 p-1.5 rounded cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3"></div>
                          <span className="text-xs text-slate-600">email</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">VARCHAR(255)</span>
                      </div>
                      <div className="flex items-center justify-between group/field hover:bg-slate-50 p-1.5 rounded cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3"></div>
                          <span className="text-xs text-slate-600">full_name</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">VARCHAR</span>
                      </div>
                    </div>
                  </div>

                  {/* Node 2: Orders */}
                  <div className="absolute top-32 left-[400px] w-64 bg-white rounded-lg shadow-2xl border border-blue-200 overflow-hidden ring-4 ring-blue-500/10 z-10 transition-all">
                    <div className="h-2 bg-purple-500 w-full"></div>
                    <div className="p-3 border-b border-slate-100 bg-purple-50/50 flex justify-between items-center">
                      <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-purple-500" /> orders
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-5 bg-purple-100 text-purple-700">New</Badge>
                    </div>
                    <div className="p-2 space-y-1 bg-white">
                      <div className="flex items-center justify-between group/field hover:bg-purple-50 p-1.5 rounded cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Key className="w-3 h-3 text-yellow-500 rotate-45" />
                          <span className="text-xs font-medium text-slate-700">id</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">UUID</span>
                      </div>
                      <div className="flex items-center justify-between bg-blue-50 p-1.5 rounded cursor-pointer border border-blue-100 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500"></div>
                        <div className="flex items-center gap-2">
                          <Link2 className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-bold text-slate-900">user_id</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">FK(users)</span>
                      </div>
                      <div className="flex items-center justify-between group/field hover:bg-slate-50 p-1.5 rounded cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3"></div>
                          <span className="text-xs text-slate-600">total_amount</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">DECIMAL</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-center">
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] w-full text-slate-400 hover:text-slate-600">
                          <Plus className="w-3 h-3 mr-1" /> Add Field
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Connection Line with Animated Particles */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md">
                    <defs>
                      <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 320 180 C 360 180, 360 250, 400 250"
                      fill="none"
                      stroke="url(#gradient-line)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle r="4" fill="#3b82f6">
                      <animateMotion dur="2s" repeatCount="indefinite" path="M 320 180 C 360 180, 360 250, 400 250" />
                    </circle>
                  </svg>

                  {/* Multiplayer Cursor */}
                  <div className="absolute top-[260px] left-[520px] z-50 pointer-events-none transition-all duration-1000 ease-in-out animate-pulse-slow">
                    <MousePointer2 className="w-5 h-5 text-pink-500 fill-pink-500 stroke-white stroke-[2]" />
                    <div className="ml-4 -mt-2 bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap">
                      Sarah (PM)
                    </div>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-1 flex gap-1 shadow-sm">
                  <Button size="icon" variant="ghost" className="h-6 w-6"><Maximize2 className="w-3.5 h-3.5 text-slate-600" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6"><Minus className="w-3.5 h-3.5 text-slate-600" /></Button>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center px-1">100%</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6"><Plus className="w-3.5 h-3.5 text-slate-600" /></Button>
                </div>
              </div>

              {/* Right Properties Panel (Static Fake) */}
              <div className="w-72 bg-white border-l border-slate-200 hidden md:flex flex-col">
                <div className="h-10 border-b border-slate-100 flex items-center px-4 justify-between bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Properties</span>
                  <Settings className="w-3 h-3 text-slate-400" />
                </div>
                <div className="p-4 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Table Name</label>
                    <div className="h-8 w-full bg-slate-50 border border-slate-200 rounded px-3 flex items-center text-sm font-medium text-slate-800">
                      orders
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-slate-500">Columns (3)</label>
                      <Plus className="w-3 h-3 text-blue-500 cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                        <Key className="w-3 h-3 text-yellow-500" />
                        <div className="flex-1">
                          <div className="h-1.5 w-8 bg-slate-300 rounded mb-1"></div>
                          <div className="h-1 w-12 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded border border-blue-100">
                        <Link2 className="w-3 h-3 text-blue-500" />
                        <div className="flex-1">
                          <div className="h-1.5 w-12 bg-blue-200 rounded mb-1"></div>
                          <div className="h-1 w-8 bg-blue-100 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-medium text-slate-500 mb-2 block">Settings</label>
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                      <span>Soft Delete</span>
                      <div className="w-8 h-4 bg-slate-200 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid (Bento Style) */}
      <section id="features" className="py-24 bg-slate-50 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Everything you need to <br /> design better databases.</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Stop wrestling with SQL scripts and migration files. Visualize your entire stack in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Card */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Multi-Database Support</h3>
                <p className="text-slate-600 text-lg leading-relaxed max-w-md">
                  Whether you're building a relational system with PostgreSQL/MySQL or a document storage with MongoDB, we've got you covered. Switch concepts instantly.
                </p>
              </div>
            </div>

            {/* Tall Card */}
            <div className="md:row-span-2 p-8 rounded-3xl bg-slate-900 text-white shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"></div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Real-time <br /> Collaboration</h3>
                <p className="text-slate-300 leading-relaxed mb-8 flex-1">
                  Work together with your team in real-time. Comments, cursors, and live updates make remote design sessions seamless.
                </p>
                <div className="mt-auto">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-xs font-bold text-white relative z-10">
                        U{i}
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-blue-600 flex items-center justify-center text-xs font-bold text-white relative z-20">
                      +5
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Card 1 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Export Code</h3>
              <p className="text-slate-600 text-sm">Get production-ready Prisma schemas and SQL migrations.</p>
            </div>

            {/* Small Card 2 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Auto Layout</h3>
              <p className="text-slate-600 text-sm">One-click cleanup for messy diagrams using smart algorithms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Loved by engineering teams.</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">See why thousands of developers trust SchemaFlow for their database architecture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform">
              <div className="flex gap-1 mb-4 text-yellow-500">
                {Array(5).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-slate-700 leading-relaxed mb-6">
                "Finally, a tool that handles both SQL and MongoDB without feeling kludgy. The real-time collaboration is a game changer for our remote team."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">S</div>
                <div>
                  <div className="font-bold text-slate-900">Sarah Chen</div>
                  <div className="text-xs text-slate-500 font-medium">Tech Lead @ Vercel</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform">
              <div className="flex gap-1 mb-4 text-yellow-500">
                {Array(5).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-slate-700 leading-relaxed mb-6">
                "The visualization is stunning. I use it to explain complex data models to stakeholders, and they actually understand it now. Worth every penny."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">M</div>
                <div>
                  <div className="font-bold text-slate-900">Mike Ross</div>
                  <div className="text-xs text-slate-500 font-medium">Senior Engineer @ Uber</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform">
              <div className="flex gap-1 mb-4 text-yellow-500">
                {Array(5).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-slate-700 leading-relaxed mb-6">
                "The auto-layout feature saved me days of work refactoring our legacy database. It's intuitive, fast, and simply beautiful."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">A</div>
                <div>
                  <div className="font-bold text-slate-900">Alex Jensen</div>
                  <div className="text-xs text-slate-500 font-medium">CTO @ StartupX</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-100">
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

