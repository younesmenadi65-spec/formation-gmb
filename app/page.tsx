import Link from 'next/link'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'
export default async function Home() {
  const d = db()
  const { data: ss } = await d.from('sessions').select('*').order('id')
  const { data: rs } = await d.from('registrations').select('session_id').eq('status', 'confirmed')
  const { data: st } = await d.from('settings').select('*')
  const cap = Number(st?.find((x: any) => x.k === 'final_capacity')?.v ?? 30)
  const { count } = await d.from('final_signups').select('*', { count: 'exact', head: true }).eq('status', 'confirmed')
  const n = count ?? 0
  return (<div className="space-y-12">
    <section className="text-center py-10 border-b border-kaki/40">
      <h1 className="text-4xl md:text-6xl">FORMATION GM / GIGN</h1>
      <p className="mt-4 text-lg text-zinc-400">Une journée pour découvrir, apprendre et démontrer ses capacités de Lead d'intervention.</p>
      <p className="mt-6 max-w-2xl mx-auto text-zinc-300">Une journée entière de formation en cadre RP : découverte du rôle de Lead d'intervention, évaluations bienveillantes pendant les sessions encadrées, puis grande opération finale à 21 h. Cohésion, communication, discipline et prise de décision en sont les piliers.</p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center"><Link href="/inscription" className="btn">S'INSCRIRE À LA FORMATION</Link><Link href="#planning" className="btn2">Consulter le planning</Link></div>
    </section>
    <section><h2 className="text-xl mb-4">Objectifs</h2><div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
      {['Découvrir le Lead d\'intervention', 'Apprendre les techniques présentées', 'Développer coordination et communication', 'Être évalué en mise en situation', 'Participer à une opération finale collective'].map(o => <div key={o} className="card text-sm">▸ {o}</div>)}</div></section>
    <section id="planning"><h2 className="text-xl mb-1">Planning de la journée</h2><p className="text-xs text-zinc-500 mb-4">Date exacte et responsables : à confirmer. Horaires indicatifs.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {ss?.map((x: any) => { const c = rs?.filter((r: any) => r.session_id === x.id).length ?? 0
          const full = x.capacity != null && c >= x.capacity
          const label = !x.open ? 'Inscriptions fermées' : full ? 'Complet · liste d\'attente' : 'Inscriptions ouvertes'
          return <div key={x.id} className="card"><div className="flex justify-between"><span className="text-3xl font-black text-kaki">{x.label}</span><span className="badge h-fit">{label}</span></div>
            <h3 className="font-bold mt-2">{x.title}</h3><p className="text-sm text-zinc-400 my-2">{x.description}</p>
            <p className="text-xs text-zinc-500">Responsable : à définir · {x.capacity != null ? `${Math.max(0, x.capacity - c)} place(s) restante(s)` : 'Places non limitées'}</p>
            {x.open && <Link href={`/inscription?s=${x.id}`} className="btn mt-3 text-sm">S'inscrire</Link>}</div> })}
        <div className="card md:col-span-2 border-alert"><span className="badge bg-alert/40 text-red-200">OPÉRATION FINALE</span>
          <div className="text-3xl font-black text-kaki mt-2">21h — 15 contre 15</div>
          <p className="text-sm text-zinc-400 my-2">Grande mise en situation collective dirigée par l'organisateur, pour mettre en pratique les techniques de la journée.</p>
          <div className="h-3 bg-ink rounded overflow-hidden"><div className="h-full bg-alert" style={{ width: Math.min(100, n / cap * 100) + '%' }} /></div><p className="text-xs mt-1">{n} / {cap} participants</p>
          <Link href="/finale" className="btn mt-3 text-sm">S'inscrire à l'opération finale</Link></div>
      </div></section></div>)
}
