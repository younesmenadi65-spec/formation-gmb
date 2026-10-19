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

  // Déterminer quelles sessions ont été cochées (Mapping : forma1 = 16h (1), forma2 = 18h (2), forma3 = 19h (3))
  const selectedSessions: number[] = []
  if (fd.get('forma1')) selectedSessions.push(1) // 16h
  if (fd.get('forma2')) selectedSessions.push(2) // 18h
  if (fd.get('forma3')) selectedSessions.push(3) // 19h

  // Par défaut si rien n'est coché, attribuer la session 1
  if (selectedSessions.length === 0) selectedSessions.push(1)

  let mainToken = ''

  // Inscription pour chaque session cochée
  for (const sid of selectedSessions) {
    const { data, error } = await db().rpc('register_session', { 
      p_discord: d, 
      p_rp: rp, 
      p_grade: 'Candidat', 
      p_session: sid, 
      p_motiv: m 
    })

    if (error && error.code === '23505') {
      redirect('/inscription?err=dup')
    } else if (error) {
      redirect('/inscription?err=closed')
    }

    if (data && data[0]?.o_token) {
      mainToken = data[0].o_token
    }
  }

  // Si l'opération finale est sélectionnée
  if (fd.get('final') === 'oui') {
    // Si la table final_signups possède un champ token, on l'aligne ou on l'enregistre
    await db().rpc('register_final', { p_discord: d, p_rp: rp })
    
    // On met à jour le token de l'opération finale pour qu'il soit IDENTIQUE au token de suivi principal
    if (mainToken) {
      await db().from('final_signups').update({ token: mainToken }).ilike('discord', d)
    }
  }

  redirect(`/statut?new=1&d=${encodeURIComponent(d)}&t=${encodeURIComponent(mainToken)}`)
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

export async function adminLogout() { cookies().delete('adm'); redirect('/admin') }

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
