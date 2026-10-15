import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Créer le collaborateur si n'existe pas encore
      const { data: existingCollab } = await supabase
        .from('collaborateurs')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (!existingCollab) {
        const metadata = data.user.user_metadata
        await supabase.from('collaborateurs').insert({
          id: data.user.id,
          nom: metadata?.nom || 'Inconnu',
          prenom: metadata?.prenom || '',
          email: data.user.email || '',
          poste: 'Nouveau collaborateur',
          role: 'commercial',
          poles: [],
          date_embauche: new Date().toISOString().split('T')[0],
          actif: true,
        })
      }

      const forwardedHost = request.headers.get('host')
      const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
      const url = requestUrl.searchParams.get('redirect_to')?.toString()
      
      const redirectUrl = url || `${forwardedProto}://${forwardedHost}/dashboard`
      
      return Response.redirect(redirectUrl)
    }
  }

  // Retourner à la page de login avec une erreur
  return Response.redirect(`${requestUrl.origin}/login?error=auth`)
}
