import { db } from '@/lib/db'
import { registerSession } from '../actions'
export const dynamic = 'force-dynamic'
const E: any = { invalid: 'Formulaire incomplet (motivation : 10 caractères minimum, case à cocher requise).', dup: 'Ce pseudo Discord est déjà inscrit. Consulte « Mon inscription ».', closed: 'Cette session est fermée.' }
export default async function P({ searchParams }: any) {
  const { data: ss } = await db().from('sessions').select('*').eq('open', true).order('id')
  return (<form action={registerSession} className="max-w-xl mx-auto card">
    <h1 className="text-2xl mb-4">Inscription</h1>{searchParams.err && <p className="text-red-400 mb-3">{E[searchParams.err]}</p>}
    <input name="rp" required maxLength={60} placeholder="Nom RP" className="inp" /><input name="discord" required maxLength={40} placeholder="Pseudo Discord (jamais ton mot de passe !)" className="inp" />
    <input name="grade" required maxLength={60} placeholder="Grade actuel" className="inp" />
    <select name="session" defaultValue={searchParams.s} required className="inp">{ss?.map((x: any) => <option key={x.id} value={x.id}>{x.label} — {x.title}</option>)}</select>
    <textarea name="motiv" required minLength={10} maxLength={1000} rows={4} placeholder="Pourquoi veux-tu découvrir le Lead d'intervention ?" className="inp" />
    <select name="final" className="inp"><option value="non">Opération finale 21 h : non</option><option value="oui">Opération finale 21 h : oui</option></select>
    <label className="text-sm block mb-4"><input type="checkbox" name="ok" required /> Je confirme mon inscription et m'engage à la prendre au sérieux.</label>
    <button className="btn w-full">S'INSCRIRE À LA FORMATION</button></form>)
}
