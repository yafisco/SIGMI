'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Edit, Trash2, Download, Building2, FolderKanban, Calendar, User, Tag } from 'lucide-react';
import { useSingleData } from '@/hooks/useData';
import { documentsService } from '@/lib/services';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import Link from 'next/link';
import { errorMessage } from '@/lib/utils/errorHandler';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: document, loading, error } = useSingleData({
    fetchFn: documentsService.getById,
    id,
  });

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
      cancelButtonColor: SWEETALERT_CONFIG.cancelButtonColor,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      customClass: SWEETALERT_CONFIG.customClass,
    });

    if (result.isConfirmed) {
      try {
        await documentsService.delete(id);
        await Swal.fire({
          title: 'Supprimé !',
          text: 'Le document a été supprimé avec succès.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
        router.push('/documents');
      } catch (err) {
        await Swal.fire({
          title: 'Erreur',
          text: errorMessage(err, 'Erreur lors de la suppression'),
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const handleDownload = () => {
    if (document?.fichier_url) {
      window.open(document.fichier_url, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-600 font-medium">Chargement du document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Document non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title={document.nom}
        description="Fiche détaillée du document"
        actionHref="/documents"
        actionLabel="Retour"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header du document */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
          <div className="relative bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-purple-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full blur-2xl" />
            <div className="flex items-center gap-4 relative">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] rounded-xl flex items-center justify-center shadow-lg"
              >
                <FileText className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">{document.nom}</h2>
                <p className="text-slate-600 mt-1">{document.type}</p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDownload}
                  className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </motion.button>
                <Link href={`/documents/${document.id}/edit`}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all"
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Taille"
            value={formatFileSize(document.fichier_taille)}
            icon={FileText}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0}
          />
          <StatCard
            title="Statut"
            value={document.statut}
            icon={Tag}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.1}
          />
          <StatCard
            title="Date d'ajout"
            value={new Date(document.created_at).toLocaleDateString('fr-FR')}
            icon={Calendar}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0.2}
          />
        </div>

        {/* Informations du document */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
          <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-purple-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full blur-2xl" />
            <h3 className="text-xl font-bold text-slate-900 mb-4 relative">Informations du document</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <FileText className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-slate-500">Nom du fichier</p>
                  <p className="text-slate-700 font-medium">{document.fichier_nom}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Type</p>
                  <p className="text-slate-700 font-medium">{document.type}</p>
                </div>
              </div>
              {document.client_nom && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-xs text-slate-500">Client</p>
                    <p className="text-slate-700 font-medium">{document.client_nom}</p>
                  </div>
                </div>
              )}
              {document.projet_nom && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <FolderKanban className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-slate-500">Projet</p>
                    <p className="text-slate-700 font-medium">{document.projet_nom}</p>
                  </div>
                </div>
              )}
              {document.uploaded_by_nom && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                  <User className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-slate-500">Uploadé par</p>
                    <p className="text-slate-700 font-medium">{document.uploaded_by_nom}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Description */}
        {document.description && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
            <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-purple-200 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full blur-2xl" />
              <h3 className="text-xl font-bold text-slate-900 mb-4 relative">Description</h3>
              <p className="text-slate-600 relative">{document.description}</p>
            </div>
          </motion.div>
        )}

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative mt-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
            <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-purple-200 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full blur-2xl" />
              <h3 className="text-xl font-bold text-slate-900 mb-4 relative">Tags</h3>
              <div className="flex flex-wrap gap-2 relative">
                {document.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
