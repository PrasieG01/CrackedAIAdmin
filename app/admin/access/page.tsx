import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { Bangers } from "next/font/google"
import { Globe, Mail, Trash2 } from "lucide-react"

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

// --- CONSOLIDATED SERVER ACTION ---
async function handleAccessCRUD(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const table = formData.get('table') as string 
  const action = formData.get('action')
  const id = formData.get('id')
  
  const payload: any = {}
  if (table === 'allowed_signup_domains') payload.apex_domain = formData.get('value')
  if (table === 'whitelisted_email_addresses') payload.email_address = formData.get('value')

  if (action === 'create') await supabase.from(table).insert([payload])
  if (action === 'delete') await supabase.from(table).delete().eq('id', id)

  revalidatePath('/access')
}

export default async function AccessControl() {
  const supabase = await createClient();
  
  const [domains, emails] = await Promise.all([
    supabase.from('allowed_signup_domains').select('*').order('created_datetime_utc', { ascending: false }),
    supabase.from('whitelisted_email_addresses').select('*').order('created_datetime_utc', { ascending: false })
  ]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-8 font-mono selection:bg-red-600 selection:text-white">
      {/* HEADER */}
      <header className="mb-12 border-b-2 border-red-900 pb-6 flex justify-between items-end">
        <div>
          <h1 className={`${bangers.className} text-7xl text-red-600 uppercase italic tracking-tighter`}>Access_Gatekeeper</h1>
          <p className="text-[10px] text-zinc-500 mt-2 tracking-[0.4em] font-black uppercase italic">Security_Protocol: Enrollment_Filtering</p>
        </div>
        <Link href="/" className="border-2 border-zinc-800 px-6 py-2 text-[10px] font-black text-zinc-400 hover:border-red-600 hover:text-red-600 transition-all uppercase">Return_to_Deck</Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: DOMAIN PROTOCOLS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-red-600 pl-4 mb-8">
            <Globe className="text-red-600" size={24} />
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Domain_Filters</h2>
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest leading-none mt-1">Global Enrollment Permission</p>
            </div>
          </div>

          <form action={handleAccessCRUD} className="flex gap-2">
            <input type="hidden" name="table" value="allowed_signup_domains" />
            <input type="hidden" name="action" value="create" />
            <input 
              name="value" 
              placeholder="APEX_DOMAIN (e.g. university.edu)" 
              className="flex-grow bg-zinc-950 border-2 border-zinc-900 p-4 text-[10px] font-black text-white focus:border-red-600 outline-none uppercase transition-all"
              required 
            />
            <button className="bg-red-900/20 text-red-500 border-2 border-red-900 px-6 font-black uppercase text-[10px] hover:bg-red-600 hover:text-white transition-all">Grant</button>
          </form>

          <div className="space-y-3">
            {domains.data?.map(d => (
              <div key={d.id} className="bg-zinc-900/10 border border-zinc-800 p-4 flex justify-between items-center group hover:border-red-900 transition-all">
                <div>
                  <span className="text-[8px] text-zinc-500 font-black block uppercase mb-1">Active_Domain_Route</span>
                  <p className="text-sm font-black text-white uppercase italic">@{d.apex_domain}</p>
                </div>
                <form action={handleAccessCRUD}>
                  <input type="hidden" name="table" value="allowed_signup_domains" />
                  <input type="hidden" name="action" value="delete" />
                  <input type="hidden" name="id" value={d.id} />
                  <button className="text-zinc-600 hover:text-red-600 transition-colors p-2"><Trash2 size={16} /></button>
                </form>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT: EMAIL WHITELIST */}
<section className="space-y-6">
  <div className="flex items-center gap-3 border-l-4 border-zinc-500 pl-4 mb-8">
    <Mail className="text-zinc-100" size={24} />
    <div>
      <h2 className="text-xl font-black text-white uppercase tracking-tight">Individual_Keys</h2>
      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest leading-none mt-1">Specific Personnel Clearance</p>
    </div>
  </div>

  {/* Input Form */}
  <form action={handleAccessCRUD} className="flex gap-2 mb-8">
    <input type="hidden" name="table" value="whitelisted_email_addresses" />
    <input type="hidden" name="action" value="create" />
    <input 
      name="value" 
      type="email"
      placeholder="SPECIFIC_USER_EMAIL" 
      className="flex-grow bg-zinc-950 border-2 border-zinc-900 p-4 text-[10px] font-black text-white focus:border-white outline-none transition-all uppercase"
      required 
    />
    <button className="bg-zinc-800 text-zinc-200 border-2 border-zinc-700 px-6 font-black uppercase text-[10px] hover:bg-white hover:text-black transition-all">
      Auth
    </button>
  </form>

  {/* THE LIST: This is what shows you it was added */}
  <div className="space-y-3">
    {emails.data && emails.data.length > 0 ? (
      emails.data.map((e) => (
        <div key={e.id} className="bg-zinc-900/20 border border-zinc-800 p-4 flex justify-between items-center group hover:border-white transition-all">
          <div className="flex items-center gap-4">
            <div className="h-1.5 w-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            <div>
              <span className="text-[8px] text-zinc-500 font-black block uppercase mb-1 tracking-tighter">Authenticated_Entity</span>
              <p className="text-sm font-black text-zinc-200 italic leading-none">{e.email_address}</p>
            </div>
          </div>
          <form action={handleAccessCRUD}>
            <input type="hidden" name="table" value="whitelisted_email_addresses" />
            <input type="hidden" name="action" value="delete" />
            <input type="hidden" name="id" value={e.id} />
            <button className="text-zinc-700 hover:text-red-500 transition-colors p-2">
              <Trash2 size={16} />
            </button>
          </form>
        </div>
      ))
    ) : (
      <div className="border border-dashed border-zinc-900 p-8 text-center">
        <p className="text-[10px] text-zinc-800 font-black uppercase italic">No_Specific_Keys_Detected</p>
      </div>
    )}
  </div>
</section>

      </div>

      {/* FOOTER STATUS BAR */}
      <footer className="mt-20 border-t border-zinc-900 pt-8 flex items-center gap-10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Firewall_Active</span>
        </div>
        <div className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
          Auth_Checksum: {Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </footer>
    </div>
  )
}