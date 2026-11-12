import { supabase } from '@/lib/supabase';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const emailService = {
  async sendEmail({ to, subject, html, text }: SendEmailParams) {
    try {
      // Utiliser fetch direct avec l'URL complète de l'Edge Function
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xhgspkunwikvufrireqw.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/send-email`;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, html, text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de l\'email');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  },
};
