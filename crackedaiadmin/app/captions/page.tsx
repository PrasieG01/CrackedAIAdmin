import { createClient } from '../utils/supabase/server'
import { Bangers } from "next/font/google"

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

export default async function ViewCaptions() {
  const supabase = await createClient()

  // READ: Fetch captions and join with images for context
  const { data: captions, error } = await supabase
    .from('captions')
    .select(`
      id,
      content,
      created_at,
      images (
        url
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-900 p-8 text-white">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-12 border-b-4 border-green-500 pb-4 flex justify-between items-end">
          <div>
            <h1 className={`${bangers.className} text-5xl text-green-500 italic uppercase`}>
              Humor Archives
            </h1>
            <p className="text-zinc-500 font-mono text-xs">LOG_FILE: public.captions // READ_ONLY_ACCESS</p>
          </div>
          <a href="/" className="text-zinc-400 hover:text-white underline font-mono text-sm">
            RETURN_TO_COMMAND
          </a>
        </header>

        {error && (
          <div className="bg-red-900/50 border-2 border-red-500 p-4 mb-6">
            ERROR: {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {captions?.map((cap) => (
            <div key={cap.id} className="bg-zinc-800 border-l-8 border-green-500 p-6 flex gap-6 items-center shadow-lg hover:bg-zinc-700/50 transition-all">
              {/* Thumbnail of the associated image */}
              <div className="w-24 h-24 flex-shrink-0 bg-black border-2 border-zinc-600 overflow-hidden">
                {cap.images?.url ? (
                  <img src={cap.images.url} alt="Reference" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-700 uppercase">No Image</div>
                )}
              </div>

              <div className="flex-grow">
                <p className="text-zinc-500 text-[10px] font-mono mb-1">ID: {cap.id}</p>
                <p className="text-2xl font-bold italic text-zinc-100">
                  "{cap.content}"
                </p>
              </div>

              <div className="text-right">
                <p className="text-zinc-500 text-xs font-mono">
                  {new Date(cap.created_at).toLocaleDateString()}
                </p>
                <div className="text-[10px] text-green-500 font-black mt-1 uppercase tracking-tighter">
                  Verified Specimen
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}