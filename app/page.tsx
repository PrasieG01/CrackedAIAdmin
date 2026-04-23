import { createClient } from '../utils/supabase/server'
import { Bangers } from "next/font/google"
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UsersRound, ImagePlus, MessageSquareQuote, Terminal, ShieldAlert, Book } from 'lucide-react'
const bangers = Bangers({ weight: "400", subsets: ["latin"] });

export default async function AdminDashboard() {
  const supabase = await createClient()

  // SERVER ACTION: The System Shutdown
  async function handleSignOut() {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/login')
  }

  // 1. Fetch Stats to display interesting statss
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: imageCount } = await supabase.from('images').select('*', { count: 'exact', head: true })
  const { count: captionCount } = await supabase.from('captions').select('*', { count: 'exact', head: true })
  
  // 2. Fetch all votes to calculate the "Total Lab Hilarity" (Sum of all upvotes)
  const { data: votes } = await supabase.from('caption_votes').select('vote_value')
  const totalVotes = votes?.length || 0
  const netHilarity = votes?.reduce((acc, curr) => acc + curr.vote_value, 0) || 0

  return (
<div 
  className="min-h-screen bg-[#0a0a0a] p-8 text-white font-sans selection:bg-yellow-400 selection:text-black"
  style={{ 
    backgroundImage: `linear-gradient(to right, #1a1a1a 1px, transparent 1px), 
                      linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)`,
    backgroundSize: '40px 40px' 
  }}
>
  
  {/*ADMIN HEADER: */}
  <header className="mb-12 border-l-8 border-red-600 pl-6 py-4 bg-zinc-900/50 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">LIVE_CONNECTION_ESTABLISHED</span>
          </div>
          <h1 className={`${bangers.className} text-7xl text-white italic leading-none`}>
            COMIC LAUGH LAB <span className="text-red-600">WRAPPED</span>
          </h1>
        </div>

        {/* THE SIGN OUT BUTTON */}
        <form action={handleSignOut}>
          <button 
            type="submit"
            className="group relative px-4 py-2 bg-black border-2 border-red-600 text-red-600 font-mono text-xs uppercase tracking-tighter hover:bg-red-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(255,0,0,0.3)] active:translate-y-1 active:shadow-none"
          >
            <span className="relative z-10">[ TERMINATE_SESSION ]</span>
            <div className="absolute inset-0 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left opacity-10"></div>
          </button>
        </form>
      </header>

  {/* STATS SECTION */}
  <section className="mb-16">
    <h2 className="font-black uppercase italic text-zinc-600 mb-6 tracking-tighter">Current Database Snapshots:</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Metric Card 1: Lab Rats */}
<div className="group relative bg-blue-600 p-8 border-4 border-black transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] cursor-help">
  
  {/* THE TOOLTIP BUBBLE */}
  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 bg-white text-black p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
    <div className="text-[10px] font-mono leading-tight">
      <span className="text-blue-600 font-bold underline">DEFINING_CRITERIA:</span><br/>
      Total unique users who have authenticated via Google OAuth.
    </div>
    {/* Small triangle at the bottom of the tooltip */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-black"></div>
  </div>

  <span className="absolute top-2 right-2 text-white/20 font-black text-4xl group-hover:text-white/40 transition-colors pointer-events-none">01</span>
  <h3 className="font-black uppercase text-xs tracking-widest mb-1 text-blue-200">Lab Rats</h3>
  <p className={`${bangers.className} text-7xl`}>{userCount}</p>
  <p className="text-[10px] font-mono mt-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
    Source: public.profiles
  </p>
</div>

      {/* Metric Card 2: Specimens */}
<div className="group relative bg-yellow-400 text-black p-8 border-4 border-black transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] cursor-help">
  
  {/* THE TOOLTIP BUBBLE */}
  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 bg-black text-white p-2 border-2 border-white shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
    <div className="text-[10px] font-mono leading-tight">
      <span className="text-yellow-400 font-bold underline">ASSET_INVENTORY:</span><br/>
      Total base images available for the AI to process and caption.
    </div>
    {/* Small triangle */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
  </div>

  <span className="absolute top-2 right-2 text-black/10 font-black text-4xl group-hover:text-black/20 transition-colors pointer-events-none">02</span>
  <h3 className="font-black uppercase text-xs tracking-widest mb-1">Specimens</h3>
  <p className={`${bangers.className} text-7xl`}>{imageCount}</p>
  <p className="text-[10px] font-mono mt-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
    Source: public.images
  </p>
</div>

      {/* Metric Card 3: Output */}
<div className="group relative bg-green-500 p-8 border-4 border-black transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] cursor-help">
  
  {/* THE TOOLTIP BUBBLE */}
  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 bg-white text-black p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
    <div className="text-[10px] font-mono leading-tight">
      <span className="text-green-600 font-bold underline">COMPUTATIONAL_LOG:</span><br/>
      Cumulative count of AI-generated humor attempts recorded.
    </div>
    {/* Small triangle */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-black"></div>
  </div>

  <span className="absolute top-2 right-2 text-white/20 font-black text-4xl group-hover:text-white/40 transition-colors pointer-events-none">03</span>
  <h3 className="font-black uppercase text-xs tracking-widest mb-1 text-green-200">Output</h3>
  <p className={`${bangers.className} text-7xl`}>{captionCount}</p>
  <p className="text-[10px] font-mono mt-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
    Source: public.captions
  </p>
</div>

      {/* Metric Card 4: Hilarity */}
<div className="group relative bg-purple-600 p-8 border-4 border-black transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(255,255,0,1)] cursor-help">
  
  {/* THE TOOLTIP BUBBLE */}
  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 bg-white text-black p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(168,85,247,1)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
    <div className="text-[10px] font-mono leading-tight">
      <span className="text-purple-600 font-bold underline">ALGORITHMIC_WEIGHT:</span><br/>
      The net sum of all engagement: Upvotes (+1) vs Downvotes (-1).
    </div>
    {/* Small triangle */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-black"></div>
  </div>

  <span className="absolute top-2 right-2 text-white/20 font-black text-4xl group-hover:text-white/40 transition-colors pointer-events-none">04</span>
  <h3 className="font-black uppercase text-xs tracking-widest mb-1 text-purple-200">Hilarity</h3>
  <p className={`${bangers.className} text-7xl`}>{netHilarity > 0 ? `+${netHilarity}` : netHilarity}</p>
  <p className="text-[10px] font-mono mt-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
    Calc: sum(vote_value)
  </p>
</div>
    </div>
  </section>

  <section className="mt-12">
  <h2 className="font-black uppercase italic text-zinc-600 mb-6 tracking-tighter">System Access Ports:</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    
    {/* PROFILE PORT */}
<Link href="/users" className="group relative bg-zinc-900/80 border border-zinc-800 p-8 text-center transition-all hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
  <UsersRound className="w-12 h-12 mx-auto mb-4 text-zinc-600 group-hover:text-blue-500 transition-colors" />
  <h2 className={`${bangers.className} text-3xl text-white italic tracking-[0.15em] uppercase`}>MANAGE PROFILES</h2>
  <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Read_Only Personnel Manifest</p>
</Link>

{/* IMAGES PORT */}
<Link href="/images" className="group relative bg-zinc-900/80 border border-zinc-800 p-8 text-center transition-all hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)]">
  <ImagePlus className="w-12 h-12 mx-auto mb-4 text-zinc-600 group-hover:text-yellow-400 transition-colors" />
  <h2 className={`${bangers.className} text-3xl text-white italic tracking-[0.15em] uppercase`}>
  MANAGE IMAGES
</h2>
  <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Full CRUD Access Control</p>
</Link>

{/* CAPTIONS PORT */}
<Link href="/captions" className="group relative bg-zinc-900/80 border border-zinc-800 p-8 text-center transition-all hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]">
  <MessageSquareQuote className="w-12 h-12 mx-auto mb-4 text-zinc-600 group-hover:text-green-500 transition-colors" />
  <h2 className={`${bangers.className} text-3xl text-white italic tracking-[0.15em] uppercase`}>VIEW CAPTIONS</h2>
  <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Humor Output Audit</p>
</Link>

{/* 04: FLAVOR ENGINE (Orange) */}
<Link href="/flavors" className="group relative bg-zinc-900/80 border border-zinc-800 p-8 text-center transition-all hover:border-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]">
  <MessageSquareQuote className="w-12 h-12 mx-auto mb-4 text-zinc-600 group-hover:text-orange-500 transition-colors" />
  <h2 className={`${bangers.className} text-3xl text-white italic tracking-[0.15em] uppercase`}>FLAVOR ENGINE</h2>
  <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Chain & Step Management</p>
</Link>

{/* 05: AUDIT TRAILS (Blue) */}
<Link href="/admin/audit" className="group relative bg-zinc-900/80 border border-zinc-800 p-8 text-center transition-all hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
  <Terminal className="w-12 h-12 mx-auto mb-4 text-zinc-600 group-hover:text-blue-500 transition-colors" />
  <h2 className={`${bangers.className} text-3xl text-white italic tracking-[0.15em] uppercase`}>AUDIT TRAILS</h2>
  <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">LLM Request/Response Debugging</p>
</Link>

{/* 05: TERM GLOSSARY */}
<Link href="/terms" className="group relative bg-zinc-900/80 border border-zinc-800 p-8 text-center transition-all hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]">
  <Book className="w-12 h-12 mx-auto mb-4 text-zinc-600 group-hover:text-green-500 transition-colors" />
  <h2 className={`${bangers.className} text-3xl text-white italic tracking-[0.15em] uppercase`}>TERM GLOSSARY</h2>
  <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Standardized Definitions & Linguistic Rules</p>
</Link>

{/* 06: ACCESS CONTROL (Red) */}
<Link href="/admin/access" className="group relative bg-zinc-900/80 border border-zinc-800 p-8 text-center transition-all hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]">
  <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
  <h2 className={`${bangers.className} text-3xl text-white italic tracking-[0.15em] uppercase`}>ACCESS CONTROL</h2>
  <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Whitelists & Allowed Domains</p>
</Link>
  </div>
</section>
  </div>
  )
}
