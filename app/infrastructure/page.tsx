import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { Bangers } from "next/font/google"
import { Server, Cpu, Link as LinkIcon, Activity, Trash2, Edit3, Plus } from "lucide-react"

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

// --- SERVER ACTION FOR MODELS/PROVIDERS ---
async function handleInfraCRUD(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const table = formData.get('table') as string // 'llm_models' or 'llm_providers'
  const action = formData.get('action')
  const id = formData.get('id')

  const payload: any = { name: formData.get('name') }
  if (table === 'llm_models') payload.llm_provider_id = formData.get('provider_id')

  if (action === 'create') await supabase.from(table).insert([payload])
  if (action === 'update') await supabase.from(table).update(payload).eq('id', id)
  if (action === 'delete') await supabase.from(table).delete().eq('id', id)

  revalidatePath('/infrastructure')
}

export default async function InfraHub({ searchParams }: { searchParams: Promise<{ editId?: string, table?: string }> }) {
  const supabase = await createClient();
  const params = await searchParams;

  // Fetch everything in parallel for that "Big Data" feel
  const [modelsRes, providersRes, chainsRes, responsesRes] = await Promise.all([
    supabase.from('llm_models').select('*, llm_providers(name)'),
    supabase.from('llm_providers').select('*'),
    supabase.from('llm_prompt_chains').select('*').limit(10).order('created_datetime_utc', { ascending: false }),
    supabase.from('llm_model_responses').select('*').limit(10).order('created_datetime_utc', { ascending: false })
  ]);

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 p-6 font-mono selection:bg-blue-500 selection:text-white">
      
      {/* 1. TOP STATUS HEADER */}
      <header className="mb-10 flex justify-between items-center border-b border-zinc-800 pb-6">
        <div>
          <h1 className={`${bangers.className} text-6xl text-blue-500 uppercase italic tracking-tighter`}>System_Core_Infrastructure</h1>
          <p className="text-[10px] text-zinc-600 mt-1 uppercase font-black tracking-widest">
            Hardware_ID: {Math.random().toString(16).slice(2, 10)} | Status: <span className="text-green-500 animate-pulse">Online</span>
          </p>
        </div>
        <div className="flex gap-3">

  {/* YOUR EXISTING EXIT BUTTON */}
<Link 
                  href="/" 
                  className="group relative px-6 py-2 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 font-black text-[10px] tracking-[0.2em] transition-all hover:border-green-500 hover:text-white hover:shadow-[0_0_15px_rgba(30,58,138,0.3)]"
                >
                  [ <span className="text-green-500 group-hover:animate-pulse"> ! </span> ] BACK_TO_BASE
                </Link></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. LEFT COLUMN: CRUD (Models & Providers) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* PROVIDERS SECTION (CRUD) */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black text-blue-400 uppercase flex items-center gap-2">
                <Server size={14} /> LLM_Providers
              </h2>
            </div>
            
            <form action={handleInfraCRUD} className="flex gap-2 mb-4">
              <input type="hidden" name="table" value="llm_providers" />
              <input type="hidden" name="action" value="create" />
              <input name="name" placeholder="PROVIDER_NAME" className="flex-grow bg-black border border-zinc-800 p-2 text-[10px] focus:border-blue-500 outline-none" required />
              <button className="bg-blue-600 text-black px-4 py-1 text-[10px] font-black uppercase hover:bg-blue-400">Add</button>
            </form>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {providersRes.data?.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-black/40 border border-zinc-900 p-2 group">
                  <span className="text-[10px] font-bold">{p.name}</span>
                  <form action={handleInfraCRUD} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="hidden" name="table" value="llm_providers" />
                    <input type="hidden" name="action" value="delete" />
                    <input type="hidden" name="id" value={p.id} />
                    <button className="text-red-500 hover:text-red-300"><Trash2 size={12} /></button>
                  </form>
                </div>
              ))}
            </div>
          </div>

          {/* MODELS SECTION (CRUD) */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-sm border-l-4 border-l-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.05)]">
            <h2 className="text-xs font-black text-blue-400 uppercase flex items-center gap-2 mb-6">
              <Cpu size={14} /> LLM_Models
            </h2>
            
            <form action={handleInfraCRUD} className="grid grid-cols-2 gap-2 mb-6">
              <input type="hidden" name="table" value="llm_models" />
              <input type="hidden" name="action" value="create" />
              <input name="name" placeholder="MODEL_NAME" className="bg-black border border-zinc-800 p-2 text-[10px] focus:border-blue-500 outline-none" required />
              <select name="provider_id" className="bg-black border border-zinc-800 p-2 text-[10px] text-zinc-500 outline-none">
                {providersRes.data?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button className="col-span-2 bg-blue-600 text-black py-2 text-[10px] font-black uppercase hover:bg-blue-400">Deploy_New_Model</button>
            </form>

            <div className="space-y-2">
              {modelsRes.data?.map(m => (
                <div key={m.id} className="bg-black/60 border border-zinc-800 p-3 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase text-white">{m.name}</p>
                    <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">{m.llm_providers?.name || "No Provider"}</p>
                  </div>
                  <form action={handleInfraCRUD}>
                    <input type="hidden" name="table" value="llm_models" />
                    <input type="hidden" name="action" value="delete" /><input type="hidden" name="id" value={m.id} />
                    <button className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: READ-ONLY LOGS (Chains & Responses) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-900/10 border border-zinc-800 p-6 rounded-sm relative overflow-hidden">
            {/* Visual Flair */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity size={100} className="text-blue-500" />
            </div>

            <h2 className="text-xs font-black text-green-500 uppercase flex items-center gap-2 mb-6">
              <LinkIcon size={14} /> Transmission_Audit_Feed
            </h2>

            {/* TABBED LOGS */}
            <div className="space-y-8">
              {/* Prompt Chains (Read) */}
              <div>
                <h3 className="text-[9px] font-black text-zinc-600 uppercase mb-3 tracking-[0.2em]">Active_Chains: {chainsRes.data?.length}</h3>
                <div className="space-y-2">
                  {chainsRes.data?.map(c => (
                    <div key={c.id} className="bg-black border border-zinc-900 p-2 text-[9px] flex justify-between border-l-2 border-l-zinc-700">
                      <span className="text-zinc-400">REQ_ID: {String(c.caption_request_id).slice(0,8)}...</span>
                      <span className="text-zinc-600">{new Date(c.created_datetime_utc).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Responses (Read) */}
              <div>
                <h3 className="text-[9px] font-black text-zinc-600 uppercase mb-3 tracking-[0.2em]">Model_Responses: Latest_10</h3>
                <div className="space-y-4">
                  {responsesRes.data?.map(r => (
                    <div key={r.id} className="bg-zinc-950 border border-zinc-800 p-4 group hover:border-blue-900 transition-all">
                      <div className="flex justify-between text-[8px] mb-2 font-black">
                        <span className="text-blue-500">MODEL_ID: {r.llm_model_id}</span>
                        <span className="text-zinc-700">AGENT: {String(r.created_by_user_id).slice(0,8)}</span>
                      </div>
                      <div className="border-l border-zinc-800 pl-4 py-1">
                        <p className="text-[10px] text-zinc-400 italic mb-2">"{r.llm_system_prompt.slice(0, 60)}..."</p>
                        <p className="text-xs text-green-400 font-bold leading-relaxed">{r.llm_model_response}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}