import { createClient } from '../utils/supabase/server'
import { Bangers } from "next/font/google"
import { revalidatePath } from 'next/cache'

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

export default async function ManageImages() {
  const supabase = await createClient()
  const { data: images } = await supabase.from('images').select('*').order('created_at', { ascending: false })

  // --- SERVER ACTIONS ---

  async function addImage(formData: FormData) {
    'use server'
    const url = formData.get('url') as string
    const supabaseServer = await createClient()
    await supabaseServer.from('images').insert([{ url }])
    revalidatePath('/images')
  }

  async function updateImage(formData: FormData) {
    'use server'
    const id = formData.get('id')
    const newUrl = formData.get('newUrl') as string
    const supabaseServer = await createClient()
    await supabaseServer.from('images').update({ url: newUrl }).eq('id', id)
    revalidatePath('/images')
  }

  async function deleteImage(formData: FormData) {
    'use server'
    const id = formData.get('id')
    const supabaseServer = await createClient()
    await supabaseServer.from('images').delete().eq('id', id)
    revalidatePath('/images')
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b-4 border-yellow-400 pb-4 flex justify-between items-center">
          <h1 className={`${bangers.className} text-5xl text-yellow-400 italic`}>IMAGE SPECIMENS</h1>
          <a href="/" className="text-zinc-400 hover:text-white underline font-mono">BACK_TO_ROOT</a>
        </header>

        {/* CREATE: Specimen Intake Form */}
        <div className="bg-zinc-800 border-4 border-white p-6 mb-12 shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]">
          <h2 className="font-black uppercase mb-4 text-blue-400">Add New Specimen (CREATE)</h2>
          <form action={addImage} className="flex gap-4">
            <input 
              name="url" 
              placeholder="Paste Image URL here..." 
              className="flex-1 bg-black border-2 border-zinc-700 p-2 text-white font-mono"
              required
            />
            <button className="bg-blue-600 px-6 py-2 font-black hover:bg-blue-500 transition-colors uppercase">Register</button>
          </form>
        </div>

        {/* READ: The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images?.map((img) => (
            <div key={img.id} className="bg-zinc-800 border-4 border-zinc-700 flex flex-col">
              <div className="h-48 bg-black relative">
                <img src={img.url} className="w-full h-full object-cover" alt="" />
              </div>
              
              <div className="p-4 space-y-4">
                {/* UPDATE: Simple Edit Form */}
                <form action={updateImage} className="space-y-2">
                  <input type="hidden" name="id" value={img.id} />
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Edit Source URL:</label>
                  <div className="flex gap-1">
                    <input 
                      name="newUrl" 
                      defaultValue={img.url} 
                      className="bg-black text-[10px] p-1 border border-zinc-600 flex-1 font-mono"
                    />
                    <button className="bg-zinc-700 px-2 text-[10px] font-bold hover:bg-green-600">SAVE</button>
                  </div>
                </form>

                {/* DELETE */}
                <form action={deleteImage}>
                  <input type="hidden" name="id" value={img.id} />
                  <button className="w-full text-red-500 border border-red-900/50 py-1 text-xs font-bold hover:bg-red-900/20">
                    DELETE PERMANENTLY
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}