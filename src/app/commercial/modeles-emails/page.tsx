'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Plus, Search, Filter, ArrowLeft, Edit, Eye, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { emailTemplatesService } from '@/lib/services';
import { EmailTemplate } from '@/types';
import Swal from 'sweetalert2';

export default function ModelesEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchTemplates() {
      const data = await emailTemplatesService.getAll();
      setTemplates(data);
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.sujet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.categorie === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Ce modèle sera supprimé définitivement',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await emailTemplatesService.delete(id);
        setTemplates(templates.filter(t => t.id !== id));
        Swal.fire('Supprimé !', 'Le modèle a été supprimé', 'success');
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer le modèle', 'error');
      }
    }
  };

  const handleCopy = async (template: EmailTemplate) => {
    try {
      await navigator.clipboard.writeText(template.corps);
      Swal.fire('Copié !', 'Le contenu du modèle a été copié', 'success');
    } catch (error) {
      Swal.fire('Erreur', 'Impossible de copier le contenu', 'error');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      prospection: 'bg-blue-100 text-blue-700',
      agrement: 'bg-purple-100 text-purple-700',
      relance: 'bg-amber-100 text-amber-700',
      rendezvous: 'bg-green-100 text-green-700',
      devis: 'bg-cyan-100 text-cyan-700',
      livraison: 'bg-orange-100 text-orange-700',
      contrat: 'bg-emerald-100 text-emerald-700',
      autre: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.autre;
  };

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'prospection', label: 'Prospection' },
    { value: 'agrement', label: 'Agrément' },
    { value: 'relance', label: 'Relance' },
    { value: 'rendez-vous', label: 'Rendez-vous' },
    { value: 'devis', label: 'Devis' },
    { value: 'livraison', label: 'Livraison' },
    { value: 'contrat', label: 'Contrat' },
    { value: 'autre', label: 'Autre' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Modèles d'E-mails"
        description="Bibliothèque de modèles d'e-mails pour la communication commerciale"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/commercial">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour à Commercial
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/commercial/modeles-emails/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau modèle
            </Button>
          </Link>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              Bibliothèque de modèles ({filteredTemplates.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Chargement...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 mb-4">Aucun modèle d'e-mail trouvé</p>
              <Link href="/commercial/modeles-emails/create">
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le premier modèle
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-slate-900">{template.nom}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.categorie)}`}>
                          {template.categorie}
                        </span>
                        {!template.actif && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Inactif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{template.sujet}</p>
                      <p className="text-sm text-slate-500 line-clamp-2">{template.corps.substring(0, 150)}...</p>
                      {template.variables && template.variables.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {template.variables.map((variable, i) => (
                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                              {variable}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/commercial/modeles-emails/${template.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/commercial/modeles-emails/${template.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(template)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
