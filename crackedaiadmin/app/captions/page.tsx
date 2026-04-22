import { createClient } from '../../utils/supabase/server'
import { Bangers } from "next/font/google"
import Link from 'next/link'

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

export default async function ViewCaptions({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  
  // 1. Pagination Setup
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 12; 
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // 2. READ: Fetching with my supabase column names
  const { data: captions, count, error } = await supabase
    .from('captions')
    .select('id, content, like_count, image_id, humor_flavor_id, created_datetime_utc', { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-white font-mono selection:bg-green-400 selection:text-black">
      
      {/* HEADER */}
      <header className="mb-12 border-b-2 border-green-500 pb-4 flex justify-between items-end">
        <div>
          <h1 className={`${bangers.className} text-5xl text-green-500 tracking-[0.2em]`}>HUMOR_OUTPUT_AUDIT</h1>
          <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-[0.3em]">
            Samples {from + 1}-{Math.min(to + 1, count || 0)} of {count}
          </p>
        </div>
        <Link 
          href="/" 
          className="group relative px-6 py-2 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 font-black text-[10px] tracking-[0.2em] transition-all hover:border-green-500 hover:text-white hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
        >
          [ <span className="text-green-500 group-hover:animate-pulse"> ! </span> ] EXIT_ARCHIVE
        </Link>
      </header>

      {/* CAPTIONS LIST */}
      <div className="grid grid-cols-1 gap-4">
        {captions?.map((caption) => (
          <div 
            key={caption.id} 
            className="group flex items-center bg-zinc-900/20 border border-zinc-800 p-4 hover:bg-zinc-900 transition-all"
          >
            {/* Stats Block */}
<div className="w-24 border-r border-zinc-800 mr-6">
  <p className="text-[7px] text-zinc-600 uppercase font-black mb-1">Impact_Score:</p>
  <div className={`text-xl font-black ${caption.like_count > 0 ? 'text-green-500' : 'text-zinc-700'}`}>
    {caption.like_count ?? 0} 
    <span className="text-[10px] block leading-none opacity-50 underline decoration-zinc-800">
      {caption.like_count === 1 ? 'LIKE' : 'LIKES'}
    </span>
  </div>
</div>

            {/* Content Block */}
            <div className="flex-grow">
              <p className="text-[7px] text-zinc-600 uppercase font-black mb-1 tracking-tighter">Output_Content:</p>
              <p className="text-sm font-bold text-zinc-200 leading-tight">
                "{caption.content}"
              </p>
            </div>

            {/* Metadata Tags */}
            <div className="hidden md:flex flex-col text-right gap-1 ml-6">
              <span className="text-[7px] text-zinc-700">FLAVOR_ID: {caption.humor_flavor_id}</span>
              <span className="text-[7px] text-zinc-700">SOURCE_IMG: {caption.image_id.slice(0,8)}</span>
              <span className="text-[7px] text-zinc-500 italic">
                {new Date(caption.created_datetime_utc).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <footer className="mt-16 flex justify-center gap-6 items-center font-black">
        <Link 
          href={`/captions?page=${currentPage - 1}`}
          className={`px-4 py-2 border-2 border-zinc-800 text-[10px] tracking-widest ${currentPage <= 1 ? 'opacity-10 pointer-events-none' : 'hover:border-green-500 hover:text-green-500'}`}
        >
          &lt;&lt; PREV_BATCH
        </Link>
        <span className="text-[10px] text-zinc-600 uppercase tracking-[0.4em]">
          Volume {currentPage} / {totalPages}
        </span>
        <Link 
          href={`/captions?page=${currentPage + 1}`}
          className={`px-4 py-2 border-2 border-zinc-800 text-[10px] tracking-widest ${currentPage >= totalPages ? 'opacity-10 pointer-events-none' : 'hover:border-green-500 hover:text-green-500'}`}
        >
          NEXT_BATCH &gt;&gt;
        </Link>
      </footer>
      
      {/* ERROR HANDLING */}
      {error && (
        <p className="mt-8 text-center text-red-900 text-[10px] uppercase font-mono">
          [!] DATABASE_LINK_FAILURE: {error.message}
        </p>
      )}
    </div>
  )
}