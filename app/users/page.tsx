import { createClient } from '../../utils/supabase/server'
import { Bangers } from "next/font/google"
import Link from 'next/link'

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

export default async function ManageUsers({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  
  // 1. Pagination Logic
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 9;
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // 2. READ: Fetching with exact schema + Range
  const { data: profiles, count, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, is_superadmin, created_datetime_utc', { count: 'exact' })
    .order('is_superadmin', { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-white font-mono selection:bg-yellow-400 selection:text-black">
      
      {/* HEADER */}
      <header className="mb-12 border-b-2 border-blue-500 pb-4 flex justify-between items-end">
        <div>
          <h1 className={`${bangers.className} text-5xl text-blue-500 tracking-[0.10em]`}>PERSONNEL_MANIFEST</h1>
          <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-[0.3em]">
            Records {from + 1}-{Math.min(to + 1, count || 0)} of {count}
          </p>
        </div>
        <Link 
          href="/" 
          className="group relative px-6 py-2 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 font-black text-[10px] tracking-[0.2em] transition-all hover:border-blue-500 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        >
          [ <span className="text-blue-500 group-hover:animate-pulse"> ! </span> ] EXIT_DIRECTORY
        </Link>
      </header>

      {/* USER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles?.map((profile) => (
          <div 
            key={profile.id} 
            className={`relative group bg-zinc-900/30 border-2 p-6 transition-all ${
              profile.is_superadmin ? 'border-blue-500 shadow-[4px_4px_0_0_rgba(59,130,246,0.1)]' : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {profile.is_superadmin && (
              <div className="absolute -top-3 left-4 bg-blue-500 text-black px-2 py-0.5 text-[7px] font-black tracking-widest uppercase">
                Authorized_Admin
              </div>
            )}

            <div className="space-y-5">
              <div>
                <p className="text-[7px] text-zinc-600 uppercase mb-1 font-black tracking-tighter">Subject_Full_Name:</p>
                <h3 className="text-lg font-bold text-zinc-100 uppercase italic">
                  {profile.first_name} {profile.last_name}
                </h3>
              </div>

              <div>
                <p className="text-[7px] text-zinc-600 uppercase mb-1 font-black">Comm_Uplink:</p>
                <p className="text-xs text-blue-400 underline decoration-blue-900 underline-offset-4">
                  {profile.email}
                </p>
              </div>

              <div className="bg-black/40 p-3 border border-zinc-800/50">
                <p className="text-[7px] text-zinc-600 uppercase mb-1 font-black italic underline">Security_Signature (UUID):</p>
                <p className="text-[8px] text-zinc-500 font-mono break-all leading-tight">
                  {profile.id}
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="text-[7px] text-zinc-600 uppercase">
                  Indexed: {profile.created_datetime_utc ? new Date(profile.created_datetime_utc).toLocaleDateString() : 'UNKNOWN'}
                </span>
                <div className={`h-1.5 w-1.5 ${profile.is_superadmin ? 'bg-blue-500' : 'bg-zinc-800'}`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION CONTROLS */}
      <footer className="mt-16 flex justify-center gap-6 items-center font-black">
        <Link 
          href={`/users?page=${currentPage - 1}`}
          className={`px-4 py-2 border-2 border-zinc-800 text-[10px] tracking-widest ${currentPage <= 1 ? 'opacity-10 pointer-events-none' : 'hover:border-blue-500 hover:text-blue-500'}`}
        >
          &lt;&lt; PREV_BLOCK
        </Link>
        <span className="text-[10px] text-zinc-600 uppercase tracking-[0.4em]">
          Sector {currentPage} / {totalPages}
        </span>
        <Link 
          href={`/users?page=${currentPage + 1}`}
          className={`px-4 py-2 border-2 border-zinc-800 text-[10px] tracking-widest ${currentPage >= totalPages ? 'opacity-10 pointer-events-none' : 'hover:border-blue-500 hover:text-blue-500'}`}
        >
          NEXT_BLOCK &gt;&gt;
        </Link>
      </footer>
    </div>
  )
}