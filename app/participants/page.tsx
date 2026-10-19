import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

export default async function P() {
  const { data } = await db().from('registrations').select('rp_name,session_id').order('created_at')
  
  return (
    <div>
      <h1 className="text-2xl mb-4">Liste des participants</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card">
            <h2 className="text-kaki text-xl mb-2">{['', '16h', '18h', '19h'][i]}</h2>
            {data?.filter((r: any) => Number(r.session_id) === i).map((r: any, j: number) => (
              <p key={j} className="text-sm">{r.rp_name}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
