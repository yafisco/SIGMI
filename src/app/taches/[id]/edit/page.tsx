'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckSquare, Calendar, Clock, Save, Flag, User } from 'lucide-react';
import Link from 'next/link';
import { tasksService } from '@/lib/services';
import { collaborateursService } from '@/lib/services';
import { errorMessage } from '@/lib/utils/errorHandler';
import { useData } from '@/hooks/useData';
import type { TaskPriority, TaskStatus } from '@/types';

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as TaskPriority,
    assigned_to: '',
    status: 'todo' as TaskStatus,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const { data: collaborateurs } = useData({ fetchFn: () => collaborateursService.getAll() });

  useEffect(() => {
    async function fetchTask() {
      const data = await tasksService.getById(params.id as string);
      if (data) {
        setFormData({
          title: data.title,
          description: data.description || '',
          due_date: data.due_date || '',
          priority: data.priority,
          assigned_to: data.assigned_to || '',
          status: data.status,
        });
      }
      setInitialLoading(false);
    }
    fetchTask();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await tasksService.update({
        id: params.id as string,
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date || undefined,
        priority: formData.priority,
        status: formData.status,
        assigned_to: formData.assigned_to || undefined,
      });
      router.push(`/taches/${params.id}`);
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la modification de la tâche'));
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/taches/${params.id}`}>
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#D4AF37] bg-clip-text text-transparent">
                Modifier la tâche
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">Modifiez les informations de la tâche</p>
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
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Informations de la tâche</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Titre *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder="Titre de la tâche"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder="Description de la tâche..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Statut</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    >
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="done">Terminé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priorité</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date d'échéance</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Assigné à</label>
                    <select
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    >
                      <option value="">Non assigné</option>
                      {collaborateurs?.map((collab) => (
                        <option key={collab.id} value={collab.id}>
                          {collab.prenom} {collab.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Link href={`/taches/${params.id}`}>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
