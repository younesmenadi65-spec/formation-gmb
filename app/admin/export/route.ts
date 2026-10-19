import { db, isAdmin } from '@/lib/db'
const q = (v: any) => { let t = String(v ?? ''); if (/^[=+\-@]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"' }
export async function GET() {
  if (!(await isAdmin())) return new Response('Non autorisé', { status: 401 })
  const { data } = await db().from('registrations').select('*').order('session_id')
  const csv = ['nom_rp,discord,grade,session,statut,motivation', ...(data ?? []).map((r: any) => [r.rp_name, r.discord, r.grade, r.session_id, r.status, r.motivation].map(q).join(','))].join('\n')
  return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename=inscrits.csv' } })
}
