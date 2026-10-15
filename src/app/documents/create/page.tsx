'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Upload, Tag, Calendar, Save, FolderOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { documentsService } from '@/lib/services';
import { storageService } from '@/lib/services';

export default function CreateDocumentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    type: 'pdf',
    statut: 'brouillon',
    tags: '',
    file: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let fichier_url = null;
      let fichier_nom = null;
      let fichier_taille = null;

      // Upload du fichier si présent
      if (formData.file) {
        setUploading(true);
        const uploadResult = await storageService.uploadFile(formData.file);
        fichier_url = uploadResult.url;
        fichier_nom = formData.file.name;
        fichier_taille = formData.file.size;
        setUploading(false);
      }

      await documentsService.create({
        nom: formData.nom,
        description: formData.description,
        type: formData.type as any,
        statut: formData.statut as any,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        fichier_url,
        fichier_nom,
        fichier_taille,
      });
      router.push('/documents');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du document');
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/documents">
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#D4AF37] bg-clip-text text-transparent">
                Nouveau document
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">Ajoutez un nouveau document</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg shadow-blue-100/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations du document</h2>
                  <p className="text-slate-500 text-sm">Détails et métadonnées</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1D4ED8]" />
                    Nom du document *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1D4ED8]" />
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    rows={3}
                    placeholder="Description du document"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-[#1D4ED8]" />
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    >
                      <option value="pdf">PDF</option>
                      <option value="doc">Document Word</option>
                      <option value="xls">Excel</option>
                      <option value="img">Image</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#1D4ED8]" />
                      Statut
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    >
                      <option value="brouillon">Brouillon</option>
                      <option value="valide">Validé</option>
                      <option value="archive">Archivé</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#1D4ED8]" />
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    placeholder="facture, client, 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#1D4ED8]" />
                    Fichier
                  </label>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-[#2563EB] transition-colors bg-slate-50 hover:bg-blue-50">
                    <div className="space-y-2 text-center">
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#1D4ED8] hover:text-[#2563EB] focus-within:outline-none px-3 py-1 border border-[#1D4ED8] hover:border-[#2563EB] transition-all">
                          <span>Télécharger un fichier</span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                          />
                        </label>
                        <p className="pl-2 self-center">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-slate-500">
                        PDF, Word, Excel, Images (max 10MB)
                      </p>
                      {formData.file && (
                        <p className="text-sm text-slate-700 mt-2 bg-blue-100 px-3 py-2 rounded-lg inline-block">
                          Fichier sélectionné: {formData.file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/documents">
                <Button variant="outline" className="px-6 py-3 rounded-xl hover:bg-slate-100" disabled={loading || uploading}>
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading || uploading} className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] hover:from-[#B89B6E] hover:to-[#D4AF37] text-[#1D4ED8] shadow-lg border-2 border-[#D4AF37] px-6 py-3 rounded-xl transition-all hover:scale-105">
                <Save className="w-4 h-4 mr-2" />
                {uploading ? 'Upload...' : loading ? 'Création...' : 'Créer le document'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
