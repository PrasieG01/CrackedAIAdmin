import { createClient } from "@/utils/supabase/server"
import { Bangers } from "next/font/google"
import Link from "next/link"
import { Beaker, ChevronRight, ChevronLeft } from "lucide-react"

const bangers = Bangers({ weight: "400", subsets: ["latin"] });
const ITEMS_PER_PAGE = 10;

export default async function FlavorInventory({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  
  const currentPage = Number(params.page) || 1;
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: flavors, count } = await supabase
    .from('humor_flavors')
    .select('id, slug, created_by_user_id', { count: 'exact' })
    .order('slug', { ascending: true })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-mono">
      {/* HEADER SECTION - Using Hex for Yellow to force it */}
      <header className="mb-12 border-b-2 border-[#f97316] pb-6 flex justify-between items-end">
        <div>
          <h1 className={`${bangers.className} text-7xl text-orange-500 uppercase italic tracking-tighter`}>
            Flavor_Inventory
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.3em]">
              Access_Port: Humor_Pipeline
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-800" />
            <span className="text-orange-900 text-[10px] font-black uppercase">
              SPECIMENS_LOGGED: {count || 0}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] text-zinc-700 font-black uppercase mb-1">Sector_Index</p>
          <p className="text-xl font-bold text-zinc-500 font-mono italic">
            {String(currentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </p>
        </div>
      </header>

      {/* INVENTORY LIST */}
      <div className="space-y-3">
        {flavors?.map((flavor) => (
          <Link 
            key={flavor.id} 
            href={`/flavors/${flavor.id}`} 
            className="group block bg-zinc-950 border border-zinc-900 p-5 hover:border-[#f97316] hover:bg-orange-500/[0.02] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="h-12 w-12 bg-black border border-zinc-800 flex items-center justify-center text-zinc-800 group-hover:text-orange-500 group-hover:border-orange-500/50 transition-all">
                  <Beaker size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight group-hover:text-white transition-colors">
                    {flavor.slug}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Researcher: {String(flavor.created_by_user_id).slice(0, 8)}</p>
                    <span className="h-1 w-1 rounded-full bg-zinc-900" />
                    <p className="text-[9px] text-zinc-700 font-mono italic">UUID: {String(flavor.id).slice(0, 8)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
<span className="text-[8px] text-zinc-400 group-hover:text-orange-500 font-black uppercase tracking-[0.3em] transition-all hidden md:block">
  Analyze_Specimen
</span>                <ChevronRight className="text-zinc-900 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center">
        <Link 
          href="/" 
          className="group relative px-6 py-2 border-2 border-zinc-800 bg-zinc-950 text-zinc-500 font-black text-[10px] tracking-[0.2em] transition-all hover:border-orange-500 hover:text-white hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
        >
          [ <span className="text-orange-500 group-hover:animate-pulse"> ! </span> ] EXIT_STATION
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href={`/flavors?page=${Math.max(1, currentPage - 1)}`}
            className={`flex items-center gap-1 px-4 py-2 border border-zinc-800 text-[10px] font-black uppercase transition-all ${
              currentPage <= 1 ? 'opacity-10 pointer-events-none' : 'hover:border-orange-500 hover:text-orange-500'
            }`}
          >
            <ChevronLeft size={14} /> Prev_Sector
          </Link>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1 w-4 transition-all ${currentPage === i + 1 ? 'bg-orange-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-zinc-800'}`} 
              />
            ))}
          </div>

          <Link
            href={`/flavors?page=${Math.min(totalPages, currentPage + 1)}`}
            className={`flex items-center gap-1 px-4 py-2 border border-zinc-800 text-[10px] font-black uppercase transition-all ${
              currentPage >= totalPages ? 'opacity-10 pointer-events-none' : 'hover:border-orange-500 hover:text-orange-500'
            }`}
          >
            Next_Sector <ChevronRight size={14} />
          </Link>
        </div>
      </footer>
    </div>
  );
}