import { db } from '@/lib/db'
import { registerFinal } from '../actions'
export const dynamic = 'force-dynamic'
export default async function P({ searchParams }: any) {
  const d = db(); const { data: st } = await d.from('settings').select('*')
  const cap = Number(st?.find((x: any) => x.k === 'final_capacity')?.v ?? 30), open = st?.find((x: any) => x.k === 'final_open')?.v === 'true'
  const { count } = await d.from('final_signups').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'); const n = count ?? 0
  return (<div className="max-w-xl mx-auto card"><span className="badge">OPÉRATION FINALE · 21 h</span><h1 className="text-2xl my-3">15 contre 15</h1>
    <div className="h-3 bg-ink rounded overflow-hidden"><div className="h-full bg-alert" style={{ width: Math.min(100, n / cap * 100) + '%' }} /></div>
    <p className="text-sm my-2">{n} / {cap} · {!open ? 'Inscriptions fermées' : n >= cap ? 'Complet — liste d\'attente' : 'Places disponibles'}</p>
    <p className="text-xs text-zinc-500 mb-4">Les deux équipes de 15 sont constituées par l'administrateur ; elles ne sont pas équilibrées tant que la répartition n'est pas faite.</p>
    {searchParams.err && <p className="text-red-400 mb-3">{searchParams.err === 'dup' ? 'Déjà inscrit.' : 'Erreur ou inscriptions fermées.'}</p>}
    {open && <form action={registerFinal}><input name="rp" required placeholder="Nom RP" className="inp" /><input name="discord" required placeholder="Pseudo Discord" className="inp" /><button className="btn w-full">S'inscrire à l'opération finale</button></form>}</div>)
}
