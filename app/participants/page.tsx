import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

export default async function P() {
  // Récupération de toutes les inscriptions en base
  const { data, error } = await db().from('registrations').select('rp_name, session_id, discord').order('created_at', { ascending: false })

  if (error) {
    console.error("Erreur de chargement des participants:", error)
  }

  return (
    <div className="max-w-4xl mx-auto card mt-6">
      <h1 className="text-2xl mb-4 font-bold">Liste des participants</h1>
      
      {/* Grille des créneaux 1, 2, 3 (correspondant à 16h, 18h, 19h) */}
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => {
          // Filtrer les inscrits pour ce créneau précis
          const participants = data?.filter((r: any) => Number(r.session_id) === i) || []

          return (
            <div key={i} className="card bg-black/20 p-4 border border-zinc-800 rounded">
              <h2 className="text-red-500 font-bold text-xl mb-3">
                {['', '16H', '18H', '19H'][i]}
              </h2>

              {participants.length > 0 ? (
                participants.map((r: any, j: number) => (
                  <div key={j} className="text-sm py-1 border-b border-zinc-800/50 last:border-0">
                    <span className="font-semibold">{r.rp_name}</span>
                    <span className="text-xs text-zinc-400 block">({r.discord})</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 italic">Aucun participant</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
