import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'
import { Bangers } from "next/font/google";
import { headers } from 'next/headers'

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-black overflow-hidden relative">
      {/* Matrix-style scanline effect overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
      
      {/* The Admin Terminal Card */}
      <div className="max-w-md w-full bg-zinc-900 border-4 border-zinc-700 p-8 shadow-[0_0_30px_rgba(255,0,0,0.2)] relative z-20">
        
        {/* Technical Header Labels */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
            System: Lab_Admin_V2<br/>
            Security: Level_4
          </div>
          <div className="text-[10px] font-mono text-red-500 animate-pulse uppercase">
            [ UNKNOWN_USER_DETECTED ]
          </div>
        </div>

        {/* Title: Still uses Bangers for brand consistency but in cold Red */}
        <h1 className={`${bangers.className} text-6xl text-center text-red-600 mb-2 tracking-tighter`}>
          COMMAND <br/> CENTER
        </h1>
        
        {/* Warning Box */}
        <div className="bg-black border border-red-900 p-4 mb-8 font-mono">
          <p className="text-red-500 text-xs leading-relaxed uppercase">
            <span className="bg-red-600 text-black font-black px-1 mr-1">WARNING:</span> 
            Authorized SuperAdmin Access Only. All activities are logged and monitored by the Central Humor Core.
          </p>
        </div>

        {/* The Action Button */}
        <form action={signInWithGoogle}>
          <button 
            type="submit" 
            className="w-full bg-zinc-100 text-black border-2 border-white py-3 font-black text-xl tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex justify-center items-center gap-3 uppercase shadow-[4px_4px_0px_0px_rgba(150,0,0,1)] active:translate-y-1 active:shadow-none"
          >
            <span>Initiate Login</span>
            <span className="text-2xl">⚡</span>
          </button>
        </form>

        {/* Footer Technical Metadata */}
        <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-between">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
            <div className="text-[8px] font-mono text-zinc-600 uppercase">protocol: supabase_ssr // encrypted_jwt</div>
        </div>

      </div>
    </div>
  )
}