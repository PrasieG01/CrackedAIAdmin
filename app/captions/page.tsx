import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bangers } from "next/font/google"
import { MessageSquare, Send, Lightbulb, Trash2, Edit3, ChevronLeft, ChevronRight } from "lucide-react"

const bangers = Bangers({ weight: "400", subsets: ["latin"] });
const ITEMS_PER_PAGE = 10;

async function handleExampleCRUD(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const action = formData.get('action')
  const id = formData.get('id')
  const page = formData.get('page') || "1"
  
  const exampleData = {
    image_description: formData.get('image_description')?.toString() || "",
    caption: formData.get('caption')?.toString() || "",
    explanation: formData.get('explanation')?.toString() || "", 
  }

  if (action === 'create') {
    await supabase.from('caption_examples').insert([exampleData])
  } else if (action === 'update') {
    await supabase.from('caption_examples').update(exampleData).eq('id', id)
  } else if (action === 'delete') {
    await supabase.from('caption_examples').delete().eq('id', id)
  }

  revalidatePath('/captions')
  // This clears the editId from the URL and keeps you on the same page
  redirect(`/captions?tab=examples&page=${page}`)
}

export default async function CaptionStudio({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; editId?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const activeTab = params.tab || "outputs";
  const currentPage = Number(params.page) || 1;
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // --- DATA FETCHING ---
  const tableMap: Record<string, string> = { 
    outputs: 'captions', 
    requests: 'caption_requests', 
    examples: 'caption_examples' 
  };
  const targetTable = tableMap[activeTab];

  const { data, count } = await supabase
    .from(targetTable)
    .select('*', { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-mono selection:bg-green-500">
      {/* HEADER */}
      <header className="mb-8 border-b-2 border-zinc-900 pb-6 flex justify-between items-end">
        <div>
          <h1 className={`${bangers.className} text-7xl text-green-500 tracking-tighter uppercase italic leading-none`}>Audit_Console</h1>
          <p className="text-[10px] text-zinc-600 mt-2 tracking-[0.4em] font-black uppercase italic">
            Buffer: {activeTab} | Registry_Count: {count}
          </p>
        </div>
        <Link 
                  href="/" 
                  className="group relative px-6 py-2 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 font-black text-[10px] tracking-[0.2em] transition-all hover:border-green-500 hover:text-white hover:shadow-[0_0_15px_rgba(0, 255, 0, 1)]"
                >
                  [ <span className="text-green-500 group-hover:animate-pulse"> ! </span> ] EXIT_STATION
                </Link>
      </header>

      {/* TAB NAVIGATION */}
      <nav className="flex gap-2 mb-10">
        {[
          { id: 'outputs', label: 'READ_CAPTIONS', icon: MessageSquare },
          { id: 'requests', label: 'READ_REQUESTS', icon: Send },
          { id: 'examples', label: 'TRAINING_EXAMPLES', icon: Lightbulb },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={`/captions?tab=${tab.id}&page=1`}
            className={`flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-tighter transition-all border-2 ${
              activeTab === tab.id ? 'bg-green-600 border-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:border-zinc-700'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: UPLOAD FORM (Only for Examples) */}
        {activeTab === 'examples' && (
          <section className="lg:col-span-4">
            <div className="bg-zinc-900/40 border-2 border-zinc-800 p-6 sticky top-8">
              <h3 className="text-xs font-black text-green-500 mb-6 uppercase italic tracking-widest border-l-2 border-green-500 pl-3">New_Specimen_Upload</h3>
              <form action={handleExampleCRUD} className="space-y-4">
                <input type="hidden" name="action" value="create" />
                <input name="image_description" placeholder="IMAGE_DESCRIPTION" className="w-full bg-black border border-zinc-800 p-3 text-[10px] focus:border-green-500 outline-none" required />
                <textarea name="caption" placeholder="TARGET_HUMOR_OUTPUT" className="w-full bg-black border border-zinc-800 p-3 text-[10px] h-20 focus:border-green-500 outline-none" required />
                <textarea name="explanation" placeholder="LOGIC_EXPLANATION" className="w-full bg-black border border-zinc-800 p-3 text-[10px] h-20 focus:border-green-600 outline-none" />
                <button className="w-full bg-green-900/10 text-green-500 border border-green-900/50 py-4 text-[10px] font-black uppercase hover:bg-green-600 hover:text-white transition-all">Initialize_Specimen</button>
              </form>
            </div>
          </section>
        )}

        {/* RIGHT: DATA LIST area */}
        <section className={`${activeTab === 'examples' ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
          {data?.map((item: any) => {
            const isEditing = params.editId === String(item.id);
            return (
              <div key={item.id} className={`flex border-2 transition-all ${isEditing ? 'border-blue-500 bg-blue-900/10' : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'}`}>
                <div className={`w-2 flex-shrink-0 ${activeTab === 'outputs' ? 'bg-green-600' : activeTab === 'requests' ? 'bg-blue-600' : 'bg-yellow-600'}`} />
                
                <div className="flex-grow p-6">
                  {isEditing ? (
                    <form action={handleExampleCRUD} className="space-y-4">
                      <input type="hidden" name="action" value="update" /><input type="hidden" name="id" value={item.id} />
                      <input name="image_description" defaultValue={item.image_description} className="w-full bg-black border border-blue-900 p-2 text-xs font-bold text-white outline-none" />
                      <textarea name="caption" defaultValue={item.caption} className="w-full bg-black border border-blue-900 p-2 text-sm font-mono text-white h-24 outline-none" />
                      <textarea name="explanation" defaultValue={item.explanation} className="w-full bg-black border border-blue-900 p-2 text-sm font-mono text-white h-24 outline-none" />
                      <div className="flex gap-2">
                        <button type="submit" className="bg-green-600 text-black px-6 py-2 text-[10px] font-black uppercase">Confirm_Mod</button>
                        <Link href={`/captions?tab=examples&page=${currentPage}`} className="bg-zinc-800 text-zinc-400 px-6 py-2 text-[10px] font-black uppercase">Cancel</Link>
                      </div>  
                    </form>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-4 text-[9px] font-black uppercase text-zinc-700">
                        <span>ID: {String(item.id).slice(0,8)} | Agent: {String(item.created_by_user_id || "SYSTEM").slice(0,8)}</span>
                        <span>{new Date(item.created_datetime_utc).toLocaleDateString()}</span>
                      </div>
                      {activeTab === 'outputs' && <p className="text-2xl font-bold italic tracking-tight text-zinc-200 leading-tight">"{item.caption_text || item.content}"</p>}
                      {activeTab === 'requests' && <p className="text-sm font-mono text-blue-400 uppercase">Target_Image: {String(item.image_id).slice(0,12)}</p>}
                      {activeTab === 'examples' && (
                        <div>
                          <p className="text-xs text-zinc-500 uppercase font-black mb-2 italic">Prompt_Context: {item.image_description}</p>
                          <p className="text-2xl font-bold italic text-white tracking-tight leading-tight">"{item.caption}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!isEditing && activeTab === 'examples' && (
                  <div className="w-40 border-l-2 border-zinc-900 flex flex-col divide-y-2 divide-zinc-900">
                    <Link href={`/captions?tab=examples&editId=${item.id}&page=${currentPage}`} className="flex-1 flex items-center justify-center gap-2 bg-zinc-950 text-blue-500 hover:bg-blue-600 hover:text-white text-[10px] font-black uppercase transition-all">Unlock_Mod</Link>
                    <form action={handleExampleCRUD} className="flex-1">
                      <input type="hidden" name="action" value="delete" /><input type="hidden" name="id" value={item.id} />
                      <button className="w-full h-full flex items-center justify-center gap-2 bg-zinc-950 text-red-700 hover:bg-red-600 hover:text-white text-[10px] font-black uppercase transition-all tracking-widest">Destroy</button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}

          <footer className="mt-12 flex justify-between items-center bg-zinc-900/20 border border-zinc-800 p-4">
            <span className="text-[10px] text-zinc-600 font-black uppercase">Sector {currentPage} / {totalPages}</span>
            <div className="flex gap-2">
              <Link href={`/captions?tab=${activeTab}&page=${Math.max(1, currentPage - 1)}`} className={`px-6 py-2 border-2 border-zinc-800 text-[10px] font-black uppercase transition-all ${currentPage <= 1 ? 'opacity-10 pointer-events-none' : 'hover:border-green-500 text-green-500'}`}>Prev_Sector</Link>
              <Link href={`/captions?tab=${activeTab}&page=${Math.min(totalPages, currentPage + 1)}`} className={`px-6 py-2 border-2 border-zinc-800 text-[10px] font-black uppercase transition-all ${currentPage >= totalPages ? 'opacity-10 pointer-events-none' : 'hover:border-green-500 text-green-500'}`}>Next_Sector</Link>
            </div>
          </footer>
        </section>
      </div>
    </div>
  )
}