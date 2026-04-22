import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'
import { Bangers } from "next/font/google"
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

export default async function ManageImages({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  
  // 1. Pagination Logic
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 10;
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // 2. Fetch with Range
  const { data: images, count, error } = await supabase
    .from('images')
    .select('id, created_by_user_id, created_datetime_utc, image_description, url', { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / itemsPerPage);

async function addImage(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const url = formData.get('url')
    const description = formData.get('description')
    
    const { error } = await supabase.from('images').insert([
      { 
        url: url, 
        image_description: description 
      }
    ])
    
    if (!error) {
      revalidatePath('/images')
      redirect('/images')
    }
  }

  async function deleteImage(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const id = formData.get('id')
    await supabase.from('images').delete().eq('id', id)
    revalidatePath('/images')
    redirect('/images')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-white font-mono selection:bg-yellow-400 selection:text-black">
      {/* HEADER SECTION */}
      <header className="mb-8 border-b-2 border-yellow-400 pb-4 flex justify-between items-end">
        <div>
          <h1 className={`${bangers.className} text-5xl text-yellow-400 tracking-[0.5em]`}>IMAGE_ASSET_MANAGER</h1>
          <p className="text-[10px] text-zinc-500 mt-2 uppercase">Index_View: {from + 1}-{Math.min(to + 1, count || 0)} of {count}</p>
        </div>
<Link 
  href="/" 
  className="group relative px-6 py-2 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 font-black text-[10px] tracking-[0.2em] transition-all hover:border-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
>
  <span className="relative z-10">
    [<span className="text-red-500 group-hover:animate-pulse"> ! </span>] EXIT_ARCHIVE
  </span>
  <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
</Link>
    </header>

      {/* UPLOAD DRAWER (Simplified for space) */}
      <section className="mb-8 bg-zinc-900 border border-zinc-800 p-4">
        <form action={addImage} className="flex flex-wrap gap-4">
          <input name="url" placeholder="IMAGE_URL" className="flex-1 bg-black border border-zinc-700 p-2 text-[10px]" required />
          <input name="description" placeholder="ADD A DESCRIPTION" className="flex-1 bg-black border border-zinc-700 p-2 text-[10px]" required />
          <button className="bg-yellow-400 text-black px-6 py-2 font-black text-xs hover:invert transition-all">UPLOAD</button>
        </form>
      </section>

      {/* DATA CARDS*/}
      <div className="space-y-4">
        {images?.map((img) => (
          <div key={img.id} className="bg-zinc-900/50 border-l-4 border-zinc-800 hover:border-yellow-400 p-4 flex gap-6 transition-all">
            {/* Visual */}
            <div className="w-24 h-24 flex-shrink-0 bg-black border border-zinc-800 overflow-hidden">
                <img src={img.url} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
            </div>

            {/* Info Block */}
            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] text-yellow-400 font-black tracking-widest">SPECIMEN_ID: {img.id.slice(0,8)}</span>
                    <span className="text-[9px] text-zinc-600 italic">{new Date(img.created_datetime_utc).toLocaleString()}</span>
                </div>
                {/* Description: Now wraps instead of cutting off */}
                <p className="text-sm font-bold text-zinc-100 leading-tight mb-2 break-words">{img.image_description}</p>
                <p className="text-[9px] text-zinc-500 truncate mb-2">SOURCE: {img.url}</p>
                <p className="text-[9px] text-blue-500 uppercase tracking-tighter">AGENT_ID: {img.created_by_user_id || "ANONYMOUS"}</p>
            </div>

            {/* Actions */}
            <form action={deleteImage} className="flex items-center">
                <input type="hidden" name="id" value={img.id} />
                <button className="bg-red-900/20 text-red-500 border border-red-900/50 px-3 py-1 text-[8px] font-black hover:bg-red-600 hover:text-white transition-colors">
                    DELETE
                </button>
            </form>
          </div>
        ))}
      </div>

      {/* PAGINATION CONTROLS */}
      <footer className="mt-12 flex justify-center gap-4 items-center font-black">
        <Link 
          href={`/images?page=${currentPage - 1}`}
          className={`p-2 border border-zinc-800 ${currentPage <= 1 ? 'opacity-20 pointer-events-none' : 'hover:bg-white hover:text-black'}`}
        >
          &lt;&lt; PREV
        </Link>
        <span className="text-xs text-zinc-500 uppercase tracking-widest px-4">
          PHASE {currentPage} / {totalPages}
        </span>
        <Link 
          href={`/images?page=${currentPage + 1}`}
          className={`p-2 border border-zinc-800 ${currentPage >= totalPages ? 'opacity-20 pointer-events-none' : 'hover:bg-white hover:text-black'}`}
        >
          NEXT &gt;&gt;
        </Link>
      </footer>
    </div>
  )
}