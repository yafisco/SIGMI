'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, FileText, Download, Calendar, Tag, Folder, User, HardDrive, Trash2 } from 'lucide-react';
import { Document, DocumentType, DocumentStatus } from '@/types';
import { useDocuments, useDocumentStats } from '@/hooks/useDocuments';
import Link from 'next/link';
import { StatCard } from '@/components/AnimatedCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { documentsService } from '@/lib/services';
import Swal from 'sweetalert2';
import { errorMessage } from '@/lib/utils/errorHandler';

const typeLabels: Record<DocumentType, string> = {
  'contrat': 'Contrat',
  'facture': 'Facture',
  'rapport': 'Rapport',
  'plan': 'Plan',
  'autre': 'Autre',
};

const typeIcons: Record<DocumentType, string> = {
  'contrat': '📄',
  'facture': '💰',
  'rapport': '📊',
  'plan': '📐',
  'autre': '📁',
};

const typeColors: Record<DocumentType, string> = {
  'contrat': 'bg-purple-100 text-purple-700',
  'facture': 'bg-green-100 text-green-700',
  'rapport': 'bg-blue-100 text-blue-700',
  'plan': 'bg-orange-100 text-orange-700',
  'autre': 'bg-slate-100 text-slate-700',
};

const statusLabels: Record<DocumentStatus, string> = {
  'brouillon': 'Brouillon',
  'validé': 'Validé',
  'archivé': 'Archivé',
};

const statusColors: Record<DocumentStatus, string> = {
  'brouillon': 'bg-slate-100 text-slate-700',
  'validé': 'bg-green-100 text-green-700',
  'archivé': 'bg-slate-200 text-slate-600',
};

const typeOptions: Array<{ value: DocumentType | 'tous'; label: string }> = [
  { value: 'tous', label: 'Tous les types' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'facture', label: 'Facture' },
  { value: 'rapport', label: 'Rapport' },
  { value: 'plan', label: 'Plan' },
  { value: 'autre', label: 'Autre' },
];

const statusOptions: Array<{ value: DocumentStatus | 'tous'; label: string }> = [
  { value: 'tous', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'validé', label: 'Validé' },
  { value: 'archivé', label: 'Archivé' },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default function DocumentsPage() {
  const { documents, loading, error } = useDocuments();
  const { stats: statsData, loading: statsLoading } = useDocumentStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'tous'>('tous');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'tous'>('tous');

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer le document "${name}". Cette action est irréversible !`,
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
      } catch (err) {
        await Swal.fire({
          title: 'Erreur',
          text: errorMessage(err, 'Erreur lors de la suppression du document'),
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const displayDocuments = error || loading ? [] : documents;
  const displayStats = error || statsLoading ? {
    total: 0,
    valides: 0,
    brouillons: 0,
    tailleTotale: 0,
  } : {
    total: statsData.total,
    valides: statsData.valides,
    brouillons: statsData.brouillons,
    tailleTotale: statsData.tailleTotale,
  };

  const filteredDocuments = (displayDocuments || []).filter((doc) => {
    const matchesSearch =
      doc.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'tous' || doc.type === filterType;
    const matchesStatus = filterStatus === 'tous' || doc.statut === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = displayStats;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-600 font-medium">Chargement des documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Documents"
        description="Gestion centralisée des documents"
        actionHref="/documents/create"
        actionLabel="Nouveau document"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total documents"
            value={stats.total}
            icon={Folder}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="Validés"
            value={stats.valides}
            icon={Tag}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.1}
          />
          <StatCard
            title="Brouillons"
            value={stats.brouillons}
            icon={FileText}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.2}
          />
          <StatCard
            title="Taille totale"
            value={formatFileSize(stats.tailleTotale)}
            icon={HardDrive}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.3}
          />
        </div>

        {/* Filtres et recherche */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher un document..."
          filters={[
            {
              label: 'Type',
              options: typeOptions,
              value: filterType,
              onChange: setFilterType,
            },
            {
              label: 'Statut',
              options: statusOptions,
              value: filterStatus,
              onChange: setFilterStatus,
            },
          ]}
          showFilters={false}
          onToggleFilters={() => {}}
        />

        {/* Liste des documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: 'easeOut' }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl group-hover:from-blue-200/50 transition-all duration-500" />
                
                <div className="flex items-start gap-4 mb-4 relative">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 text-2xl"
                  >
                    {typeIcons[doc.type]}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{doc.nom}</h3>
                    <p className="text-sm text-slate-600">{formatFileSize(doc.fichier_taille)}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(doc.id, doc.nom)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="space-y-2 relative">
                  {doc.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{doc.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${typeColors[doc.type]}`}>
                      {typeLabels[doc.type]}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[doc.statut]}`}>
                      {statusLabels[doc.statut]}
                    </span>
                  </div>
                  {doc.uploaded_by_nom && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="w-4 h-4" />
                      {doc.uploaded_by_nom}
                    </div>
                  )}
                  {doc.created_at && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  {doc.fichier_url && (
                    <Link href={doc.fichier_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
            >
              <FileText className="w-8 h-8 text-blue-600" />
            </motion.div>
            <p className="text-slate-600 text-lg">Aucun document trouvé</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
