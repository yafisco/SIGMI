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
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html, text },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  },
};
