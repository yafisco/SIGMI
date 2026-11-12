// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { to, subject, html, text } = await req.json()

    // Validation des champs requis
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Champs to, subject et html sont requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer la clé API Resend depuis les variables d'environnement
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY non configurée')
      return new Response(
        JSON.stringify({ error: 'Service d\'email non configuré' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Envoyer l'email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GROUP MI - Service Commercial <service.commercial@madinainfotech.com>',
        to: to,
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Erreur Resend:', data)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'envoi de l\'email', details: data }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('Email envoyé avec succès:', { to, subject })

    return new Response(
      JSON.stringify({ success: true, message: 'Email envoyé avec succès', data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de l\'envoi de l\'email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
