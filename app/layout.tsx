import './globals.css'
import Link from 'next/link'
export const metadata = { title: 'Formation GM / GIGN', description: 'Journée de formation Lead d’intervention' }
export default function L({ children }: any) {
  return (<html lang="fr"><body>
    <nav className="border-b border-zinc-800 px-4 py-3 flex flex-wrap gap-4 text-sm uppercase tracking-widest">
      <Link href="/" className="font-black text-kaki">GM / GIGN</Link><Link href="/#planning">Planning</Link>
      <Link href="/finale">Opération finale</Link><Link href="/participants">Participants</Link><Link href="/statut">Mon inscription</Link>
    </nav><main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    <footer className="text-center text-xs text-zinc-500 py-8">Projet autorisé par Aaron, Polar et Anatoly · Cadre RP</footer></body></html>)
}
