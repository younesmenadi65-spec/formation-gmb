import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
export const db = () => createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
export async function isAdmin() {
  const t = cookies().get('adm')?.value
  if (!t) return false
  const d = db()
  const { data } = await d.auth.getUser(t)
  const e = data.user?.email
  if (!e) return false
  const { data: a } = await d.from('admins').select('email').eq('email', e).maybeSingle()
  return !!a
}
