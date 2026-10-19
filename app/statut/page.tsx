import { db } from '@/lib/db'
import { cancel } from '../actions'
export const dynamic = 'force-dynamic'
const L: any = { confirmed: 'Confirmée ✔', waitlist: 'Liste d\'attente', pending: 'En attente de validation', refused: 'Refusée' }
export default async function P({ searchParams: q }: any) {
  let rows: any[] = []
  if (q.d && q.t) { const d = db()
    const a = await d.from('registrations').select('status,session_id').ilike('discord', q.d).eq('token', q.t)
    const b = await d.from('final_signups').select('status').ilike('discord', q.d).eq('token', q.t)
    a.data?.forEach((x: any) => rows.push({ k: 'Session ' + ['', '16h', '18h', '19h'][x.session_id], s: x.status, table: 'reg' }))
    b.data?.forEach((x: any) => rows.push({ k: 'Opération finale 21h', s: x.status, table: 'final' })) }
  return (<div className="max-w-xl mx-auto card"><h1 className="text-2xl mb-3">Mon inscription</h1>
    {q.new && <p className="text-lime-300 mb-3">Inscription enregistrée ! <b>Garde ce code : {q.t}</b> (il permet de vérifier ou annuler).</p>}
    {q.cancelled && <p className="mb-3">Inscription annulée.</p>}
    <form className="mb-4"><input name="d" defaultValue={q.d} placeholder="Pseudo Discord" className="inp" /><input name="t" defaultValue={q.t} placeholder="Code de suivi" className="inp" /><button className="btn2 w-full">Vérifier</button></form>
    {rows.map((r, i) => <form key={i} action={cancel} className="flex justify-between items-center border-t border-zinc-800 py-2"><span>{r.k} : <b>{L[r.s]}</b></span>
      <input type="hidden" name="d" value={q.d} /><input type="hidden" name="t" value={q.t} /><input type="hidden" name="table" value={r.table} /><button className="text-xs text-red-400 underline">Annuler</button></form>)}
    {q.d && q.t && !rows.length && !q.cancelled && <p className="text-red-400">Aucune inscription trouvée.</p>}</div>)
}
