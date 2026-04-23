import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { Bangers } from "next/font/google"
import { Plus, Trash2, Edit3, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { redirect } from "next/navigation"

const bangers = Bangers({ weight: "400", subsets: ["latin"] });
const ITEMS_PER_PAGE = 6; // Smaller count to show off pagination

async function handleTermCRUD(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const action = formData.get('action')
  const id = formData.get('id')
  
  const payload = {
    term: formData.get('term'),
    definition: formData.get('definition'),
    example: formData.get('example'),
  }

  if (action === 'create') await supabase.from('terms').insert([payload])
  if (action === 'update') await supabase.from('terms').update(payload).eq('id', id)
  if (action === 'delete') await supabase.from('terms').delete().eq('id', id)

  revalidatePath('/terms')
  if (action === 'update') redirect('/terms') 
}

export default async function TermGlossary({ 
  searchParams 
}: { 
  searchParams: Promise<{ editId?: string; q?: string; page?: string }> 
}) {
  const supabase = await createClient();
  const params = await searchParams;
  
  const query = params.q || "";
  const currentPage = Number(params.page) || 1;
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // FETCH WITH SEARCH FILTER & PAGINATION
  let dbQuery = supabase
    .from('terms')
    .select('*', { count: 'exact' })
    .order('created_datetime_utc', { ascending: false }); // Latest first

  if (query) {
    dbQuery = dbQuery.ilike('term', `%${query}%`);
  }

  const { data: terms, count } = await dbQuery.range(from, to);
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-8 font-mono">
      {/* HEADER */}
      <header className="mb-10 border-b-2 border-yellow-600 pb-6 flex justify-between items-end">
        <div>
          <h1 className={`${bangers.className} text-7xl text-yellow-500 uppercase italic tracking-tighter`}>System_Glossary</h1>
          <p className="text-[10px] text-zinc-600 mt-2 tracking-[0.3em] font-black uppercase italic">Registry_Count: {count || 0} Specimens</p>
        </div>
        <Link href="/" className="border-2 border-zinc-800 px-6 py-2 text-[10px] font-black hover:border-yellow-500 hover:text-yellow-500 transition-all uppercase">[ ! ] Exit_Station</Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: THE REGISTRATION FORM */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/20 border-2 border-zinc-800 p-6 sticky top-8">
            <h2 className="text-[10px] font-black text-yellow-500 uppercase mb-6 flex items-center gap-2 border-l-2 border-yellow-500 pl-3">
              Add_New_Entry
            </h2>
            <form action={handleTermCRUD} className="space-y-4">
              <input type="hidden" name="action" value="create" />
              <input name="term" placeholder="TERM_NAME" className="w-full bg-black border border-zinc-800 p-3 text-[10px] focus:border-yellow-500 outline-none uppercase" required />
              <textarea name="definition" placeholder="FUNCTIONAL_DEFINITION" className="w-full bg-black border border-zinc-800 p-3 text-[10px] h-24 focus:border-yellow-500 outline-none" required />
              <textarea name="example" placeholder="USAGE_EXAMPLE" className="w-full bg-black border border-zinc-800 p-3 text-[10px] h-20 focus:border-yellow-500 outline-none" />
              <button className="w-full bg-yellow-600 text-black py-4 text-[10px] font-black uppercase hover:bg-yellow-400 transition-all">Commit_To_Lexicon</button>
            </form>
          </div>
        </section>

        {/* RIGHT: SEARCH + LIST */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          
          {/* SEARCH BAR */}
          <form className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-yellow-500" size={16} />
            <input 
              name="q" 
              defaultValue={query}
              placeholder="SEARCH_LEXICON..." 
              className="w-full bg-zinc-900/40 border-2 border-zinc-900 p-4 pl-12 text-xs font-black uppercase outline-none focus:border-yellow-600 transition-all"
            />
            {query && (
              <Link href="/terms" className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-white uppercase font-black underline">Clear</Link>
            )}
          </form>

          {/* LIST */}
          <div className="space-y-4">
            {terms?.map((t) => {
              const isEditing = params.editId === String(t.id);
              return (
                <div key={t.id} className={`border-2 transition-all ${isEditing ? 'border-blue-500 bg-blue-950/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-zinc-900 bg-zinc-950 hover:border-zinc-700'}`}>
                  <div className="p-6">
                    {isEditing ? (
                      <form action={handleTermCRUD} className="space-y-4">
                        <input type="hidden" name="action" value="update" />
                        <input type="hidden" name="id" value={t.id} />
                        <input name="term" defaultValue={t.term} className="w-full bg-black border border-blue-900 p-2 text-xl font-black text-white outline-none" />
                        <textarea name="definition" defaultValue={t.definition} className="w-full bg-black border border-blue-900 p-2 text-xs text-zinc-300 h-20 outline-none" />
                        <textarea name="example" defaultValue={t.example} className="w-full bg-black border border-blue-900 p-2 text-xs text-yellow-500 italic h-16 outline-none" />
                        <div className="flex gap-2">
                          <button type="submit" className="bg-green-600 text-black px-8 py-2 text-[10px] font-black uppercase">Save</button>
                          <Link href="/terms" className="bg-zinc-800 text-zinc-400 px-8 py-2 text-[10px] font-black uppercase">Cancel</Link>
                        </div>
                      </form>
                    ) : (
                      <div className="flex justify-between">
                        <div className="space-y-3 flex-grow">
                          <div className="flex items-center gap-3">
                            <span className="text-[7px] border border-yellow-900 text-yellow-700 px-2 py-0.5 font-black uppercase">v1.0.4</span>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{t.term}</h3>
                          </div>
                          <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">{t.definition}</p>
                          <div className="bg-black/50 border-l-2 border-yellow-600 p-3 italic">
                            <p className="text-[11px] text-yellow-500 font-mono">"{t.example}"</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-6">
                          <Link href={`/terms?editId=${t.id}&page=${currentPage}&q=${query}`} className="p-3 bg-zinc-900 text-zinc-600 hover:text-blue-500 transition-all border border-zinc-800"><Edit3 size={14} /></Link>
                          <form action={handleTermCRUD}>
                            <input type="hidden" name="action" value="delete" /><input type="hidden" name="id" value={t.id} />
                            <button className="p-3 bg-zinc-900 text-zinc-800 hover:text-red-500 transition-all border border-zinc-800"><Trash2 size={14} /></button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          <footer className="mt-8 flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-4">
            <span className="text-[10px] text-zinc-600 font-black uppercase">Sector {currentPage} / {totalPages || 1}</span>
            <div className="flex gap-2">
              <Link 
                href={`/terms?page=${Math.max(1, currentPage - 1)}&q=${query}`}
                className={`px-6 py-2 border-2 border-zinc-800 text-[10px] font-black uppercase ${currentPage <= 1 ? 'opacity-10 pointer-events-none' : 'hover:border-yellow-500 text-yellow-500'}`}
              >
                Prev_Sector
              </Link>
              <Link 
                href={`/terms?page=${Math.min(totalPages, currentPage + 1)}&q=${query}`}
                className={`px-6 py-2 border-2 border-zinc-800 text-[10px] font-black uppercase ${currentPage >= totalPages ? 'opacity-10 pointer-events-none' : 'hover:border-yellow-500 text-yellow-500'}`}
              >
                Next_Sector
              </Link>
            </div>
          </footer>
        </section>
      </div>
    </div>
  )
}