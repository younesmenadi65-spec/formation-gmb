import { registerSession } from '../actions'
export const dynamic = 'force-dynamic'

const E: any = { 
  invalid: 'Formulaire incomplet (motivation requise, case à cocher requise).', 
  dup: 'Ce pseudo Discord est déjà inscrit. Consulte « Mon inscription ».', 
  closed: 'Cette session est fermée.' 
}

export default async function P({ searchParams }: any) {
  return (
    <form action={registerSession} className="max-w-xl mx-auto card">
      <h1 className="text-2xl mb-4">Inscription</h1>
      {searchParams.err && <p className="text-red-400 mb-3">{E[searchParams.err]}</p>}
      
      <input name="rp" required maxLength={60} placeholder="Nom RP" className="inp mb-3" />
      <input name="discord" required maxLength={40} placeholder="Pseudo Discord (jamais ton mot de passe !)" className="inp mb-3" />
      
      {/* Les créneaux horaires de formation à cocher */}
      <div className="mb-4 text-left border border-gray-700/50 p-3 rounded-md bg-black/20">
        <label className="block text-sm font-semibold mb-2 text-gray-200">Choisis tes créneaux de formation :</label>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input type="checkbox" name="forma1" defaultChecked className="accent-red-600" /> Session 16h — GM / GIGN
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input type="checkbox" name="forma2" defaultChecked className="accent-red-600" /> Session 18h — Lead d'intervention
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input type="checkbox" name="forma3" defaultChecked className="accent-red-600" /> Session 19h — Négociation & Tactique
          </label>
        </div>
      </div>

      <textarea name="motiv" required maxLength={1000} rows={4} placeholder="Pourquoi veux-tu participer à ces formations ?" className="inp mb-3" />
      
      <select name="final" className="inp mb-3">
        <option value="non">Opération finale 21 h : non</option>
        <option value="oui">Opération finale 21 h : oui</option>
      </select>
      
      <label className="text-sm block mb-4 flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="ok" required className="accent-red-600" /> Je confirme mon inscription et m'engage à la prendre au sérieux.
      </label>
      
      <button className="btn w-full">S'INSCRIRE À LA FORMATION</button>
    </form>
  )
}
