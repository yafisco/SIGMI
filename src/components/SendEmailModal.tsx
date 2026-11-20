'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, Loader2, Paperclip, File, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { emailTemplatesService } from '@/lib/services';
import { emailService } from '@/lib/services/emailService';
import { createClient } from '@/lib/supabase/client';
import { EmailTemplate } from '@/types';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { useEnvoisEmail } from '@/lib/api/useEnvoisEmail';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
  clientEmail?: string;
  interactionId?: string;
  onSendPDF?: () => Promise<string | null>; // Fonction optionnelle pour générer un PDF
}

export function SendEmailModal({ isOpen, onClose, clientName = '', clientEmail = '', interactionId, onSendPDF }: SendEmailModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState('');
  const [toEmail, setToEmail] = useState(clientEmail);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const supabase = createClient();
  const { createEnvoi } = useEnvoisEmail();

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      try {
        const data = await emailTemplatesService.getAll();
        setTemplates(data.filter(t => t.actif));
      } catch (error) {
        console.error('Erreur lors du chargement des modèles:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTemplate) {
      let content = selectedTemplate.corps;
      // Remplacement des variables de base
      content = content.replace(/\{nom_client\}/g, clientName);
      content = content.replace(/\{client_email\}/g, toEmail);
      content = content.replace(/\{date\}/g, new Date().toLocaleDateString('fr-FR'));
      setPreview(content);
    }
  }, [selectedTemplate, clientName, toEmail]);

  useEffect(() => {
    setToEmail(clientEmail);
  }, [clientEmail, isOpen]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingAttachments(true);
    const newUrls: string[] = [];

    try {
      for (const file of files) {
        // Upload vers Supabase Storage bucket 'documents'
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (error) throw error;

        // Récupérer l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        newUrls.push(publicUrl);
      }

      setAttachments([...attachments, ...files]);
      setAttachmentUrls([...attachmentUrls, ...newUrls]);
    } catch (error) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors de l\'upload des pièces jointes',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    } finally {
      setUploadingAttachments(false);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    setAttachmentUrls(attachmentUrls.filter((_, i) => i !== index));
  };

  const handleAttachPDF = async () => {
    if (!onSendPDF) return;

    try {
      const pdfUrl = await onSendPDF();
      if (pdfUrl) {
        setAttachmentUrls([...attachmentUrls, pdfUrl]);
        setAttachments([...attachments, new File([''], 'Document.pdf', { type: 'application/pdf' })]);
      }
    } catch (error) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors de la génération du PDF',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    }
  };

  const handleSend = async () => {
    if (!selectedTemplate) return;

    setSending(true);
    try {
      // Envoi réel de l'email via Supabase Edge Function
      await emailService.sendEmail({
        to: toEmail,
        subject: selectedTemplate.sujet,
        html: preview,
        text: preview.replace(/<[^>]*>/g, ''),
        attachments: attachmentUrls,
      });

      // Créer l'enregistrement dans envois_email après envoi réussi
      try {
        await createEnvoi.mutateAsync({
          contact_id: null, // À mapper si contact email existe
          modele_id: selectedTemplate.id,
          objet: selectedTemplate.sujet,
          corps: preview,
          date_planifiee: new Date().toISOString().split('T')[0],
          statut: 'envoye',
        });
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement dans envois_email:', error);
        // Ne pas bloquer l'envoi si l'enregistrement échoue
      }

      await Swal.fire({
        title: 'Email envoyé !',
        text: `L'email a été envoyé à ${toEmail}`,
        icon: 'success',
        confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });

      onClose();
      setAttachments([]);
      setAttachmentUrls([]);
    } catch (error) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors de l\'envoi de l\'email',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Envoyer un email</h2>
                  <p className="text-white/80 text-sm">Sélectionnez un modèle d'email</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Liste des modèles */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Modèles disponibles</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Aucun modèle disponible
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {templates.map((template) => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTemplate(template)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'border-[#1D4ED8] bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 mb-1">{template.nom}</div>
                        <div className="text-sm text-slate-600">{template.sujet}</div>
                        <div className="text-xs text-slate-500 mt-1">{template.categorie}</div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Prévisualisation */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Prévisualisation</h3>
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Destinataire</label>
                      <input
                        type="email"
                        value={toEmail}
                        onChange={(e) => setToEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                        placeholder="email@exemple.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Sujet</label>
                      <input
                        type="text"
                        value={selectedTemplate.sujet}
                        onChange={(e) => {
                          // Permettre de modifier le sujet si nécessaire
                          const updatedTemplate = { ...selectedTemplate, sujet: e.target.value };
                          setSelectedTemplate(updatedTemplate);
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contenu</label>
                      <textarea
                        value={preview}
                        onChange={(e) => {
                          // Permettre de modifier le contenu
                          // Note: cela ne modifie pas le template original, seulement l'envoi
                          setPreview(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] min-h-[200px] whitespace-pre-wrap"
                      />
                    </div>
                    {/* Pièces jointes */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Pièces jointes</label>
                      <div className="space-y-2">
                        {attachments.length > 0 && (
                          <div className="space-y-2">
                            {attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
                                <div className="flex items-center gap-2">
                                  <File className="w-4 h-4 text-slate-500" />
                                  <span className="text-sm text-slate-700">{file.name}</span>
                                </div>
                                <button
                                  onClick={() => handleRemoveAttachment(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <XIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                            <Paperclip className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-700">Ajouter un fichier</span>
                            <input
                              type="file"
                              multiple
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </label>
                          {onSendPDF && (
                            <button
                              onClick={handleAttachPDF}
                              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                            >
                              <File className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-700">Joindre le PDF</span>
                            </button>
                          )}
                        </div>
                        {uploadingAttachments && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Upload en cours...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Mail className="w-12 h-12 mx-auto mb-3" />
                    <p>Sélectionnez un modèle pour voir la prévisualisation</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              onClick={handleSend}
              disabled={!selectedTemplate || sending}
              className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
