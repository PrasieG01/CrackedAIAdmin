import { createClient } from '../utils/supabase/server'
import { Bangers } from "next/font/google"

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

export default async function ManageUsers() {
  const supabase = await createClient()

  // READ: Fetch all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-900 p-8 text-white">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-12 border-b-4 border-blue-500 pb-4 flex justify-between items-end">
          <div>
            <h1 className={`${bangers.className} text-5xl text-blue-500 italic uppercase`}>
              Staff Directory
            </h1>
            <p className="text-zinc-500 font-mono text-xs">AUTHORIZED PERSONNEL ONLY // SCHEMA: public.profiles</p>
          </div>
          <a href="/" className="text-zinc-400 hover:text-white underline font-mono text-sm">
            RETURN_TO_COMMAND
          </a>
        </header>

        {error && (
          <div className="bg-red-900/50 border-2 border-red-500 p-4 mb-6 text-red-200">
            CRITICAL ERROR: {error.message}
          </div>
        )}

        <div className="bg-zinc-800 border-4 border-zinc-700 shadow-[12px_12px_0px_0px_rgba(30,58,138,1)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-700 text-blue-300 uppercase text-sm tracking-widest">
                <th className="p-4 border-b-2 border-zinc-600">Status</th>
                <th className="p-4 border-b-2 border-zinc-600">User ID</th>
                <th className="p-4 border-b-2 border-zinc-600">Username / Email</th>
                <th className="p-4 border-b-2 border-zinc-600 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {profiles?.map((profile) => (
                <tr key={profile.id} className="hover:bg-zinc-700/50 transition-colors border-b border-zinc-700">
                  <td className="p-4">
                    {profile.is_superadmin ? (
                      <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-black rounded-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">
                        SUPERADMIN
                      </span>
                    ) : (
                      <span className="bg-zinc-600 text-zinc-300 px-2 py-0.5 text-[10px] font-black rounded-sm">
                        LAB_RAT
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-zinc-500 text-[10px]">{profile.id}</td>
                  <td className="p-4 font-bold text-zinc-200">
                    {profile.display_name || profile.username || "Anonymous Specimen"}
                  </td>
                  <td className="p-4 text-right text-zinc-500">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded">
          <p className="text-blue-400 text-xs italic">
            Note: User creation is handled via Google OAuth. Admin status must be toggled manually in the Supabase Table Editor.
          </p>
        </div>
      </div>
    </div>
  )
}