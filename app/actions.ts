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

  // Enregistrement propre pour chaque session cochée
  for (const sid of selectedSessions) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36)

    // 1. On supprime l'ancienne inscription si elle existe pour ce pseudo et ce créneau précis
    await db().from('registrations').delete().ilike('discord', d).eq('session_id', sid)

    // 2. On insère la nouvelle inscription
    const { error } = await db().from('registrations').insert({
      discord: d,
      rp_name: rp,
      grade: selectedFormas,
      session_id: sid,
      motivation: m,
      token: token,
      status: 'pending'
    })

    if (error) {
      console.error("Erreur insertion:", error)
      redirect('/inscription?err=closed')
    }
  }

  if (fd.get('final') === 'oui') {
    await db().rpc('register_final', { p_discord: d, p_rp: rp })
  }

  redirect('/participants')
}
