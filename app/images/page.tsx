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

  async function updateImage(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id')
  const url = formData.get('url')
  const description = formData.get('description')
  
  await supabase.from('images').update({ 
    url: url, 
    image_description: description 
  }).eq('id', id)
  
  revalidatePath('/images')
  redirect('/images') 
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

      {/* UPLOAD DRAWER */}
      <section className="mb-8 bg-zinc-900 border border-zinc-800 p-4">
        <form action={addImage} className="flex flex-wrap gap-4">
          <input name="url" placeholder="IMAGE_URL" className="flex-1 bg-black border border-zinc-700 p-2 text-[10px]" required />
          <input name="description" placeholder="ADD A DESCRIPTION" className="flex-1 bg-black border border-zinc-700 p-2 text-[10px]" required />
          <button className="bg-yellow-400 text-black px-6 py-2 font-black text-xs hover:invert transition-all">UPLOAD</button>
        </form>
      </section>

      {/* DATA CARDS*/}
      <div className="space-y-4">
        {images?.map((img) => {
  const isEditing = params.editId === img.id;

  return (
    <div key={img.id} className={`bg-zinc-900/50 border-l-4 p-4 flex gap-6 transition-all ${isEditing ? 'border-blue-500 bg-blue-900/10' : 'border-zinc-800 hover:border-yellow-400'}`}>
      
      {/* 1. VISUAL COLUMN */}
      <div className="flex flex-col gap-2 w-24 flex-shrink-0">
        <div className="w-24 h-24 bg-black border border-zinc-800 overflow-hidden">
          <img src={img.url} className={`w-full h-full object-cover transition-all duration-500 ${isEditing ? 'grayscale-0' : 'grayscale hover:grayscale-0'}`} />
        </div>
        
        {/* UNLOCK / CANCEL BUTTON UNDER IMAGE */}
        {isEditing ? (
          <Link 
            href="/images" 
            className="w-full bg-zinc-800 text-zinc-400 py-1 text-[8px] font-black text-center hover:bg-zinc-700 hover:text-white uppercase tracking-tighter"
          >
            [ Cancel_Edit ]
          </Link>
        ) : (
          <Link 
            href={`/images?editId=${img.id}`} 
            className="w-full bg-blue-900/20 text-blue-500 border border-blue-900/30 py-1 text-[8px] font-black text-center hover:bg-blue-600 hover:text-white uppercase tracking-tighter transition-all"
          >
            Unlock_Edit
          </Link>
        )}
      </div>

      {/* 2. INFO / FORM COLUMN */}
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[9px] text-yellow-400 font-black tracking-widest uppercase">
            SPECIMEN_ID: {img.id.slice(0,8)}
          </span>
          {isEditing && (
            <span className="text-[10px] bg-blue-600 text-white px-2 font-black animate-pulse uppercase">
              MOD_ACTIVE
            </span>
          )}
        </div>

        {isEditing ? (
          <form action={updateImage} className="space-y-3">
            <input type="hidden" name="id" value={img.id} />
            <div>
              <label className="text-[8px] text-zinc-500 uppercase font-bold mb-1 block">Internal_Description</label>
              <input 
                name="description" 
                defaultValue={img.image_description} 
                className="w-full bg-black border border-blue-900 p-2 text-sm font-bold text-white focus:border-blue-500 outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[8px] text-zinc-500 uppercase font-bold mb-1 block">Asset_Url_Source</label>
              <input 
                name="url" 
                defaultValue={img.url} 
                className="w-full bg-black border border-blue-900 p-2 text-[9px] font-mono text-zinc-400 focus:border-blue-500 outline-none"
              />
            </div>

            <button 
            type="submit" 
            className="bg-green-950/20 text-green-500 border border-green-900/50 px-6 py-2 text-[8px] font-black hover:bg-green-600 hover:text-white transition-all uppercase tracking-widest"
            >
            SAVE_CHANGES
            </button>
          </form>
        ) : (
          <div className="h-full flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-zinc-100 leading-tight mb-2 break-words">{img.image_description}</p>
              <p className="text-[9px] text-zinc-500 truncate font-mono">PATH: {img.url}</p>
            </div>
            <p className="text-[9px] text-zinc-700 uppercase tracking-widest mt-4">
              Agent: {img.created_by_user_id?.slice(0,8) || "System_Root"}
            </p>
          </div>
        )}
      </div>

      {/* 3. DELETE ACTION */}
      {!isEditing && (
        <form action={deleteImage} className="flex items-start">
          <input type="hidden" name="id" value={img.id} />
          <button className="bg-red-950/20 text-red-700 border border-red-900/20 px-3 py-1 text-[10px] font-black hover:bg-red-600 hover:text-white transition-all">
            DELETE
          </button>
        </form>
      )}
    </div>
  );
})}
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