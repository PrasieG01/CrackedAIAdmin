import { createClient } from './utils/supabase/server'
import { Bangers } from "next/font/google"

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Fetch Stats for the "Interesting Statistics" requirement
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: imageCount } = await supabase.from('images').select('*', { count: 'exact', head: true })
  const { count: captionCount } = await supabase.from('captions').select('*', { count: 'exact', head: true })
  
  // 2. Fetch all votes to calculate the "Total Lab Hilarity" (Sum of all upvotes)
  const { data: votes } = await supabase.from('caption_votes').select('vote_value')
  const totalVotes = votes?.length || 0
  const netHilarity = votes?.reduce((acc, curr) => acc + curr.vote_value, 0) || 0

  return (
    <div className="min-h-screen bg-zinc-900 p-8 text-white font-sans">
      <header className="mb-12 border-b-4 border-red-600 pb-4">
        <h1 className={`${bangers.className} text-6xl tracking-tighter text-red-600 drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]`}>
          ADMIN MISSION CONTROL
        </h1>
        <p className="text-zinc-400 font-mono mt-2">SYSTEM STATUS: <span className="text-green-400">SUPERADMIN AUTHORIZED</span></p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric Card 1 */}
        <div className="bg-blue-600 border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,0,0,1)]">
          <h3 className="font-black uppercase text-sm mb-2">Total Lab Rats (Users)</h3>
          <p className={`${bangers.className} text-5xl`}>{userCount}</p>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-black">
          <h3 className="font-black uppercase text-sm mb-2">Visual Specimens (Images)</h3>
          <p className={`${bangers.className} text-5xl`}>{imageCount}</p>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-green-500 border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(50,50,50,1)]">
          <h3 className="font-black uppercase text-sm mb-2">Joke Frequency (Captions)</h3>
          <p className={`${bangers.className} text-5xl`}>{captionCount}</p>
        </div>

        {/* Metric Card 4 - Creative Stat */}
        <div className="bg-purple-600 border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,0,1)]">
          <h3 className="font-black uppercase text-sm mb-2">Net Lab Hilarity</h3>
          <p className={`${bangers.className} text-5xl`}>{netHilarity > 0 ? `+${netHilarity}` : netHilarity}</p>
        </div>

      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation to Management Areas */}
        <a href="/users" className="border-2 border-zinc-700 p-8 hover:bg-zinc-800 transition-all text-center group">
          <span className="text-4xl block mb-2 group-hover:scale-125 transition-transform">👥</span>
          <span className="font-bold uppercase tracking-widest">Manage Profiles</span>
        </a>
        <a href="/images" className="border-2 border-zinc-700 p-8 hover:bg-zinc-800 transition-all text-center group">
          <span className="text-4xl block mb-2 group-hover:scale-125 transition-transform">🖼️</span>
          <span className="font-bold uppercase tracking-widest">Manage Images</span>
        </a>
        <a href="/captions" className="border-2 border-zinc-700 p-8 hover:bg-zinc-800 transition-all text-center group">
          <span className="text-4xl block mb-2 group-hover:scale-125 transition-transform">💬</span>
          <span className="font-bold uppercase tracking-widest">View Captions</span>
        </a>
      </div>
    </div>
  )
}
