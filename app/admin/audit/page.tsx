"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Terminal, ArrowLeft, ChevronLeft, ChevronRight, Cpu, User, Database, Maximize2, Minimize2 } from "lucide-react"
import { Bangers } from "next/font/google"

const bangers = Bangers({ weight: "400", subsets: ["latin"], display: 'swap' });
const PAGE_SIZE = 10;

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true)
      const { data, error, count } = await supabase
        .from('llm_model_responses')
        .select('*', { count: 'exact' })
        .order('created_datetime_utc', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (data) setLogs(data)
      if (count !== null) setTotalCount(count)
      setLoading(false)
    }
    fetchLogs()
  }, [page])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  if (loading && logs.length === 0) return (
    <div className="min-h-screen bg-black text-blue-500 p-10 font-mono animate-pulse">
      &gt; ACCESSING_ENCRYPTED_LOGS...
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans selection:bg-blue-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 border-l-4 border-blue-600 pl-6 flex justify-between items-end">
          <div>
            <h1 className={`${bangers.className} text-6xl italic uppercase tracking-tighter`}>
              Audit <span className="text-blue-600">Log</span>
            </h1>
            <p className="text-zinc-600 text-[10px] mt-2 uppercase tracking-[0.3em] font-bold">
              Secure_Storage: LLM_TRANSMISSION_RECORDS
            </p>
          </div>
          <div className="text-right text-zinc-500 font-mono text-[10px] hidden md:block">
            TOTAL_ENTRIES: {totalCount}
          </div>

          {/* NEW INFRASTRUCTURE BRIDGE */}
  <Link 
    href="/infrastructure" 
    className="flex items-center gap-2 border border-blue-900 bg-blue-950/20 px-6 py-2 text-[10px] font-black text-blue-400 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(30,58,138,0.3)]"
  >
    <Cpu size={14} className="animate-pulse" /> [ Access_System_Core ]
  </Link>
        </div>

        {/* Transmission List */}
        <div className="space-y-6">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            
            return (
              <div key={log.id} className="bg-zinc-900/20 border border-zinc-800 rounded-lg overflow-hidden transition-all hover:border-zinc-700">
                
                {/* Metadata Bar */}
                <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <span className="text-blue-500 font-mono text-[10px] font-bold">
                      [{new Date(log.created_datetime_utc).toLocaleString()}]
                    </span>
                    <span className="text-zinc-600 text-[9px] uppercase font-black tracking-widest flex items-center gap-1">
                      <User size={10} /> {String(log.created_by_user_id).substring(0, 8)}
                    </span>
                  </div>
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest"
                  >
                    {isExpanded ? <><Minimize2 size={10} /> Collapse</> : <><Maximize2 size={10} /> View Details</>}
                  </button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                  
                  {/* System Column */}
                  <div className="p-4 bg-zinc-900/10">
                    <h4 className="text-[9px] text-zinc-600 uppercase font-black mb-2 flex items-center gap-1">
                      <Database size={10} /> System_Prompt
                    </h4>
                    <div className={`text-[11px] text-zinc-500 font-mono leading-relaxed transition-all ${isExpanded ? '' : 'line-clamp-3 italic'}`}>
                      {log.llm_system_prompt || "EMPTY"}
                    </div>
                  </div>

                  {/* User Column (The "See More" target) */}
                  <div className="p-4 bg-zinc-900/5">
                    <h4 className="text-[9px] text-blue-400 uppercase font-black mb-2 flex items-center gap-1">
                      <Terminal size={10} /> User_Prompt
                    </h4>
                    <div className={`text-[11px] text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap transition-all ${isExpanded ? '' : 'line-clamp-4'}`}>
                      {log.llm_user_prompt}
                    </div>
                    {!isExpanded && log.llm_user_prompt?.length > 150 && (
                      <button 
                        onClick={() => setExpandedId(log.id)}
                        className="mt-2 text-blue-500 text-[9px] font-bold uppercase hover:underline"
                      >
                        [ See Full Transmission ]
                      </button>
                    )}
                  </div>

                  {/* Response Column */}
                  <div className="p-4 bg-blue-500/5">
                    <h4 className="text-[9px] text-green-500 uppercase font-black mb-2 flex items-center gap-1">
                      <Cpu size={10} /> Model_Response
                    </h4>
                    <div className={`text-[12px] text-green-400 font-mono leading-relaxed font-medium transition-all ${isExpanded ? '' : 'line-clamp-6'}`}>
                      {log.llm_model_response}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="mt-12 flex items-center justify-between border-t border-zinc-900 pt-8">

            <div className="flex gap-3">

  {/* YOUR EXISTING EXIT BUTTON */}
<Link 
                  href="/" 
                  className="group relative px-6 py-2 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 font-black text-[10px] tracking-[0.2em] transition-all hover:border-blue-500 hover:text-white hover:shadow-[0_0_15px_rgba(30,58,138,0.3)]"
                >
                  [ <span className="text-blue-500 group-hover:animate-pulse"> ! </span> ] EXIT_ARCHIVE
                </Link></div>

            <div className="flex items-center gap-6">
                <button 
                  onClick={() => { setPage(p => Math.max(0, p - 1)); setExpandedId(null); }} 
                  disabled={page === 0}
                  className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-zinc-500 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-500 transition-colors"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                
                <span className="text-[10px] text-zinc-700 font-mono font-bold">
                  PAGE_{String(page + 1).padStart(2, '0')}_OF_{String(totalPages).padStart(2, '0')}
                </span>

                <button 
                  onClick={() => { setPage(p => p + 1); setExpandedId(null); }} 
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-zinc-500 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-500 transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}