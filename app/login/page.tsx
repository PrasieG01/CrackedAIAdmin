import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'
import { Bangers } from "next/font/google";
import { headers } from 'next/headers'
import { Fingerprint, Database } from "lucide-react"; // icons

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

export default async function LoginPage() {
  
  const signInWithGoogle = async () => {
    'use server'
    const supabase = await createClient()
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'http'
    const origin = `${protocol}://${host}`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (data?.url) {
      redirect(data.url)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] overflow-hidden relative selection:bg-blue-500 selection:text-white">
      
      {/* 1. THE GRID BACKGROUND*/}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)`,
          backgroundSize: '40px 40px' 
        }}
      ></div>

      {/* 2. SCANLINE EFFECT */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(59,130,246,0.06),rgba(59,130,246,0.02),rgba(59,130,246,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
      
      {/* THE ADMIN TERMINAL CARD */}
      <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-sm relative z-20">
        
        {/* Technical Header */}
        <div className="flex justify-between items-start mb-10">
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            System: Lab_Admin_V2<br/>
            Security: Level_4
          </div>
          <div className="flex items-center gap-2 text-zinc-700">
            <span className="text-[8px] font-black uppercase tracking-widest">Encrypted_JWT</span>
            <Database size={12} />
          </div>
        </div>

        {/* Title: Spaced out for readability */}
        <h1 className={`${bangers.className} text-6xl text-center text-white mb-2 tracking-[0.1em] italic uppercase`}>
          COMMAND <br/> <span className="text-blue-500">CENTER</span>
        </h1>
        
        {/* Notice Box */}
        <div className="bg-blue-500/5 border-l-2 border-blue-500 p-4 mb-10 font-mono">
          <p className="text-blue-200 text-[10px] leading-relaxed uppercase tracking-tighter">
            <span className="text-blue-500 font-black mr-2">[ ACCESS_CONTROL ]</span> 
            Authorized SuperAdmin Access Only. All terminal sessions are logged by the Humor Core.
          </p>
        </div>

        {/* The Action Button */}
        <form action={signInWithGoogle}>
          <button 
            type="submit" 
            className="group w-full bg-white text-black py-4 font-black text-xs tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all flex justify-center items-center gap-3 uppercase relative overflow-hidden"
          >
            {/* Shimmer Effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="relative z-10">Initiate_Login</span>
          </button>
        </form>

        {/* Footer Technical Metadata */}
        <div className="mt-12 pt-4 border-t border-zinc-800/50 flex justify-center">
            <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.4em]">
                protocol: supabase_ssr // node_runtime
            </div>
        </div>

      </div>
    </div>
  )
}