import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { db, isAdmin } from '@/lib/db'
import { adminLogin, adminLogout, setStatus, setTeam, saveSession, saveFinal, saveEval } from '@/app/actions'

export const dynamic = 'force-dynamic'

export default async function AdminPage({ searchParams }: { searchParams: { err?: string } }) {
  const authenticated = await isAdmin()

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto card mt-12 p-6 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Espace État-Major - Connexion</h1>
        {searchParams.err && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-400 text-sm rounded">
            Identifiants incorrects ou non autorisés.
          </div>
        )}
        <form action={adminLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="w-full px-3 py-2 bg-black/40 border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Mot de passe</label>
            <input 
              type="password" 
              name="password" 
              required 
              className="w-full px-3 py-2 bg-black/40 border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500" 
            />
          </div>
          <button type="submit" className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition">
            Se connecter
          </button>
        </form>
      </div>
    )
  }

  // Si l'utilisateur est connecté, on récupère les données de l'état-major
  const { data: registrations } = await db().from('registrations').select('*').order('created_at', { ascending: false })
  const { data: sessions } = await db().from('sessions').select('*').order('id', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-bold text-white">Tableau de bord - État-Major</h1>
        <form action={adminLogout}>
          <button type="submit" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm text-white rounded transition">
            Se déconnecter
          </button>
        </form>
      </div>

      {/* Gestion des sessions */}
      <div className="card bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Sessions de formation</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {sessions?.map((session: any) => (
            <div key={session.id} className="bg-black/40 p-4 border border-zinc-800 rounded">
              <h3 className="font-bold text-red-500 mb-2">Créneau {session.id} : {session.label}</h3>
              <p className="text-sm text-zinc-300 mb-2">{session.title}</p>
              <form action={saveSession} className="space-y-2 text-sm">
                <input type="hidden" name="id" value={session.id} />
                <div>
                  <label className="text-xs text-zinc-400">Titre</label>
                  <input type="text" name="title" defaultValue={session.title} className="w-full px-2 py-1 bg-black border border-zinc-700 rounded text-white" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Capacité</label>
                  <input type="number" name="capacity" defaultValue={session.capacity || ''} className="w-full px-2 py-1 bg-black border border-zinc-700 rounded text-white" />
                </div>
                <button type="submit" className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs">Enregistrer</button>
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des inscrits globale */}
      <div className="card bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Inscriptions enregistrées ({registrations?.length || 0})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="py-2 px-3">Discord</th>
                <th className="py-2 px-3">Nom RP</th>
                <th className="py-2 px-3">Créneau</th>
                <th className="py-2 px-3">Formations</th>
                <th className="py-2 px-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {registrations?.map((reg: any) => (
                <tr key={reg.id} className="border-b border-zinc-800/50">
                  <td className="py-2 px-3 font-medium text-white">{reg.discord}</td>
                  <td className="py-2 px-3">{reg.rp_name}</td>
                  <td className="py-2 px-3">Créneau {reg.session_id}</td>
                  <td className="py-2 px-3 text-xs text-zinc-400">{reg.grade}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-1 bg-zinc-800 rounded text-xs">{reg.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
