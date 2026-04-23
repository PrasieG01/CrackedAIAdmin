import { createClient } from "@/utils/supabase/server"
import { Bangers } from "next/font/google"
import { ArrowLeft, Beaker, Zap, Fingerprint } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

export default async function FlavorDetails({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. Fetch Flavor (Read humor_flavors)
  const { data: flavor } = await supabase
    .from('humor_flavors')
    .select('description, slug, created_by_user_id, created_datetime_utc')
    .eq('id', id)
    .single();

  // 2. Fetch Steps and Mix in parallel
  const [stepsRes, mixRes] = await Promise.all([
    supabase.from('humor_flavor_steps').select('created_datetime_utc, llm_user_prompt, llm_system_prompt').eq('humor_flavor_id', id),
    supabase.from('humor_flavor_mix').select('id, humor_flavor_id, created_by_user_id, caption_count, created_datetime_utc').eq('humor_flavor_id', id)
  ]);


  async function createMix(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const flavorId = formData.get('flavorId')
  
  // Initialize with a default caption_count of 1
  const { error } = await supabase
    .from('humor_flavor_mix')
    .insert([{ 
      humor_flavor_id: flavorId, 
      caption_count: 1 
    }])

  if (!error) revalidatePath(`/flavors/${flavorId}`)
}
  // Server Action: Update humor_flavor_mix
  async function updateMix(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const mixId = formData.get('mixId')
    const captionCount = formData.get('caption_count')
    
    await supabase
      .from('humor_flavor_mix')
      .update({ caption_count: Number(captionCount) })
      .eq('id', mixId)

    revalidatePath(`/flavors/${id}`)
  }

  if (!flavor) return <div className="bg-black text-orange-500 p-20 font-mono italic underline uppercase text-center">! Specimen_Missing_From_Registry</div>

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono selection:bg-orange-500">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-10 border-b-2 border-zinc-900 pb-8 flex justify-between items-start">
          <div className="flex items-center gap-6">
            <Beaker size={48} className="text-orange-500" />
            <div>
              <h1 className={`${bangers.className} text-6xl uppercase leading-none text-white tracking-tighter italic`}>
                {flavor.slug}
              </h1>
              <p className="text-[10px] text-zinc-500 mt-2 font-black uppercase tracking-widest italic">
                Registry_Path: /flavors/{id}
              </p>
            </div>
          </div>
          <Link 
                  href="/" 
                  className="group relative px-6 py-2 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 font-black text-[10px] tracking-[0.2em] transition-all hover:border-orange-500 hover:text-white hover:shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                >
                  [ <span className="text-orange-500 group-hover:animate-pulse"> ! </span> ] EXIT_STATION
                </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* COLUMN 1: FLAVOR METADATA & MIX (READ/UPDATE) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Metadata Card */}
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Fingerprint size={14} /> Specimen_Metadata
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed italic mb-6">
                {flavor.description || "NO_DESCRIPTION_PROVIDED"}
              </p>
              <div className="grid grid-cols-2 gap-4 text-[9px] uppercase font-black text-zinc-600">
                <div>Created: {new Date(flavor.created_datetime_utc).toLocaleDateString()}</div>
                <div>Researcher: {flavor.created_by_user_id?.slice(0,8)}</div>
              </div>
            </div>

            {/* Mix Card (Read/Update) */}
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg border-l-4 border-l-orange-500">
  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-6">
    &gt; Humor_Flavor_Mix_Parameters
  </h3>
  
  <div className="space-y-6">
    {mixRes.data && mixRes.data.length > 0 ? (
      /* --- RENDER UPDATE FORMS --- */
      mixRes.data.map((item) => (
        <form key={item.id} action={updateMix} className="bg-black/40 border border-zinc-800 p-4 rounded group">
          <input type="hidden" name="mixId" value={item.id} />
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-[9px] font-black text-zinc-500">
              <span>AGENT_ID: {String(item.created_by_user_id).slice(0,8)}</span>
              <span>SYNCHRONIZED: {new Date(item.created_datetime_utc).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-grow">
                <label className="text-[8px] text-zinc-600 uppercase font-black block mb-1">Caption_Count</label>
                <input 
                  name="caption_count" 
                  type="number"
                  defaultValue={item.caption_count} 
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-orange-400 font-mono text-sm focus:border-green-600 outline-none"
                />
              </div>
              <button className="self-end bg-orange-950/20 text-orange-500 border border-orange-900/50 px-4 py-2 text-[10px] font-black hover:bg-orange-600 hover:text-white transition-all uppercase">
                Sync
              </button>
            </div>
          </div>
        </form>
      ))
    ) : (
      /* --- RENDER CREATE BUTTON --- */
      <div className="text-center py-4">
        <p className="text-[10px] text-zinc-700 italic mb-4 uppercase font-black tracking-tighter">
          Registry_Empty: No mix records detected.
        </p>
        <form action={createMix}>
          <input type="hidden" name="flavorId" value={id} />
          <button className="w-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-orange-500 hover:border-orange-500 py-3 text-[10px] font-black uppercase transition-all tracking-widest">
            [ Initialize_Mix_Specimen ]
          </button>
        </form>
      </div>
    )}
  </div>
</div>
          </div>

          {/* COLUMN 2: FLAVOR STEPS (READ ONLY) */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-lg">
              <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Zap size={14} /> Humor_Generation_Steps (Registry_Logs)
              </h3>
              
              <div className="space-y-6">
                {stepsRes.data && stepsRes.data.length > 0 ? (
                  stepsRes.data.map((step, idx) => (
                    <div key={idx} className="relative pl-8 border-l border-zinc-800 py-2">
                      <div className="absolute -left-1.5 top-5 w-3 h-3 bg-orange-500 rounded-full" />
                      <div className="bg-black/50 border border-zinc-900 p-4 group">
                        <div className="text-[8px] text-zinc-600 font-black mb-3 flex justify-between">
                          <span>STEP_{String(idx + 1).padStart(2, '0')}</span>
                          <span>LOGGED: {new Date(step.created_datetime_utc).toLocaleString()}</span>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-[8px] text-orange-500/50 font-black uppercase mb-1">System_Prompt:</p>
                            <p className="text-[11px] text-zinc-500 italic font-mono leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
                              {step.llm_system_prompt}
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] text-orange-500/50 font-black uppercase mb-1">User_Prompt:</p>
                            <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                              {step.llm_user_prompt}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 border border-dashed border-zinc-800 text-center text-[10px] text-zinc-700 uppercase italic">
                    Registry_Empty: No instruction steps mapped.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}