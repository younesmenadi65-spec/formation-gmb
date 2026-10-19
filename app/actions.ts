'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { db, isAdmin } from '@/lib/db'

const s = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? '').trim().slice(0, max)
const guard = async () => { if (!(await isAdmin())) throw new Error('Non autorisé') }

export async function registerSession(fd: FormData) {
  const [d, rp, m] = [s(fd, 'discord', 40), s(fd, 'rp', 60), s(fd, 'motiv', 1000)]
  
  if (!d || !rp || !m || fd.get('ok') !== 'on') {
    redirect('/inscription?err=invalid')
  }

  // Récupération des sessions cochées (1 à 4)
  const selectedSessions: number[] = []
  if (fd.get('forma1')) selectedSessions.push(1)
  if (fd.get('forma2')) selectedSessions.push(2)
  if (fd.get('forma3')) selectedSessions.push(3)
  if (fd.get('forma4')) selectedSessions.push(4)

  if (selectedSessions.length === 0) {
    selectedSessions.push(1)
  }

  const forma1 = fd.get('forma1') ? 'Formation 1' : null
  const forma2 = fd.get('forma2') ? 'Formation 2' : null
  const forma3 = fd.get('forma3') ? 'Formation 3' : null
  const forma4 = fd.get('forma4') ? 'Formation 4' : null
  const selectedFormas = [forma1, forma2, forma3, forma4].filter(Boolean).join(', ') || 'Aucune'

  // Traitement et ajout pour chaque créneau sélectionné
  for (const sid of selectedSessions) {
    // 1. Suppression de l'ancienne inscription de CETTE personne pour CE créneau précis (au cas où elle réessaye)
    await db().from('registrations').delete().eq('discord', d).eq('session_id', sid)

    // 2. Génération d'un jeton unique pour CHAQUE entrée
    const uniqueToken = Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2)

    // 3. Insertion simple dans la liste
    const { error } = await db().from('registrations').insert({
      discord: d,
      rp_name: rp,
      grade: selectedFormas,
      session_id: sid,
      motivation: m,
      token: uniqueToken,
      status: 'pending'
    })

    if (error) {
      console.error("Erreur lors de l'ajout au créneau", sid, error)
    }
  }

  if (fd.get('final') === 'oui') {
    await db().rpc('register_final', { p_discord: d, p_rp: rp }).catch(() => null)
  }

  redirect('/participants')
}

export async function registerFinal(fd: FormData) {
  const [d, rp] = [s(fd, 'discord', 40), s(fd, 'rp', 60)]
  if (!d || !rp) redirect('/finale?err=invalid')
  const { data, error } = await db().rpc('register_final', { p_discord: d, p_rp: rp })
  if (error) redirect('/finale?err=' + (error.code === '23505' ? 'dup' : 'closed'))
  redirect(`/statut?new=1&d=${encodeURIComponent(d)}&t=${data[0].o_token}`)
}

export async function cancel(fd: FormData) {
  const t = fd.get('table') === 'final' ? 'final_signups' : 'registrations'
  await db().from(t).delete().ilike('discord', s(fd, 'd')).eq('token', s(fd, 't'))
  redirect('/statut?cancelled=1')
}

export async function adminLogin(fd: FormData) {
  const c = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const { data, error } = await c.auth.signInWithPassword({ email: s(fd, 'email'), password: String(fd.get('password') ?? '') })
  if (error || !data.session) redirect('/admin?err=1')
  cookies().set('adm', data.session.access_token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3600, path: '/' })
  redirect('/admin')
}

export async function adminLogout() { 
  cookies().delete('adm'); 
  redirect('/admin') 
}

export async function setStatus(fd: FormData) {
  await guard()
  const t = fd.get('table') === 'final' ? 'final_signups' : 'registrations'
  await db().from(t).update({ status: s(fd, 'status') }).eq('id', s(fd, 'id'))
  revalidatePath('/admin')
}

export async function setTeam(fd: FormData) {
  await guard()
  const v = Number(fd.get('team'))
  await db().from('final_signups').update({ team: v === 1 || v === 2 ? v : null }).eq('id', s(fd, 'id'))
  revalidatePath('/admin')
}

export async function saveSession(fd: FormData) {
  await guard()
  const cap = s(fd, 'capacity')
  await db().from('sessions').update({ label: s(fd, 'label', 20), title: s(fd, 'title'), description: s(fd, 'description', 600), capacity: cap ? Number(cap) : null, open: fd.get('open') === 'on' }).eq('id', Number(fd.get('id')))
  revalidatePath('/admin'); revalidatePath('/')
}

export async function saveFinal(fd: FormData) {
  await guard()
  await db().from('settings').upsert([{ k: 'final_capacity', v: String(Number(fd.get('cap')) || 30) }, { k: 'final_open', v: fd.get('open') === 'on' ? 'true' : 'false' }])
  revalidatePath('/admin'); revalidatePath('/')
}

export async function saveEval(fd: FormData) {
  await guard()
  const scores: any = {}, comments: any = {}
  for (let i = 0; i < 7; i++) { scores[i] = Math.min(5, Math.max(0, Number(fd.get('n' + i)) || 0)); comments[i] = s(fd, 'c' + i, 500) }
  await db().from('evaluations').upsert({ registration_id: s(fd, 'id'), scores, comments, strengths: s(fd, 'st', 800), improvements: s(fd, 'im', 800), final_comment: s(fd, 'fc', 1000), result: s(fd, 'res') })
  revalidatePath('/admin')
}
