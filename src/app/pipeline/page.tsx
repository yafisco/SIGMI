'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, TrendingUp, DollarSign, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Opportunity, OpportunityStage } from '@/types';
import Link from 'next/link';

// Données initialisées à vide
const mockOpportunities: Opportunity[] = [];

const stageColors: Record<OpportunityStage, string> = {
  nouveau: 'bg-gray-100 text-gray-700 border-gray-300',
  qualifié: 'bg-blue-100 text-blue-700 border-blue-300',
  proposition: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  négociation: 'bg-orange-100 text-orange-700 border-orange-300',
  gagné: 'bg-green-100 text-green-700 border-green-300',
  perdu: 'bg-red-100 text-red-700 border-red-300',
};

const stageLabels: Record<OpportunityStage, string> = {
  nouveau: 'Nouveau',
  qualifié: 'Qualifié',
  proposition: 'Proposition',
  négociation: 'Négociation',
  gagné: 'Gagné',
  perdu: 'Perdu',
};

const stageOrder: OpportunityStage[] = ['nouveau', 'qualifié', 'proposition', 'négociation', 'gagné', 'perdu'];

export default function PipelinePage() {
  const [opportunities] = useState<Opportunity[]>(mockOpportunities);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOpportunities = opportunities.filter((opp) => {
    return (
      opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.client_nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const stats = {
    total: opportunities.length,
    total_value: opportunities.reduce((sum, opp) => sum + opp.amount, 0),
    weighted_value: opportunities.reduce((sum, opp) => sum + (opp.amount * opp.probability / 100), 0),
    won: opportunities.filter((o) => o.stage === 'gagné').length,
    won_value: opportunities.filter((o) => o.stage === 'gagné').reduce((sum, o) => sum + o.amount, 0),
    lost: opportunities.filter((o) => o.stage === 'perdu').length,
  };

  const formatAmount = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M FCFA`;
    }
    return `${(value / 1000).toFixed(0)}K FCFA`;
  };

  const opportunitiesByStage = stageOrder.reduce((acc, stage) => {
    acc[stage] = filteredOpportunities.filter((o) => o.stage === stage);
    return acc;
  }, {} as Record<OpportunityStage, Opportunity[]>);

  const stageValue = (stage: OpportunityStage) => {
    return opportunitiesByStage[stage]?.reduce((sum, opp) => sum + opp.amount, 0) || 0;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Pipeline Commercial</h1>
              <p className="text-slate-600 mt-1">Vue globale du pipeline d'opportunités</p>
            </div>
            <Link href="/opportunites/create">
              <Button className="bg-groupmi-gold-gradient hover:opacity-90 text-[#1D4ED8] shadow-lg border-2 border-[#D4AF37]">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle opportunité
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total pipeline</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatAmount(stats.total_value)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Valeur pondérée</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatAmount(stats.weighted_value)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Opportunités gagnées</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.won}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Valeur gagnée</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatAmount(stats.won_value)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une opportunité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Pipeline Kanban */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stageOrder.map((stage) => (
              <div key={stage} className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-900 text-sm">{stageLabels[stage]}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${stageColors[stage]}`}>
                    {opportunitiesByStage[stage]?.length || 0}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-slate-600">{formatAmount(stageValue(stage))}</p>
                </div>
                <div className="space-y-3">
                  {opportunitiesByStage[stage]?.map((opp) => (
                    <div key={opp.id} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-slate-900 text-sm line-clamp-2">{opp.name}</p>
                        {opp.stage === 'gagné' && (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                        )}
                        {opp.stage === 'perdu' && (
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{opp.client_nom}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">{formatAmount(opp.amount)}</span>
                        <span className="text-xs text-slate-600">{opp.probability}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${opp.probability}%` }}
                        />
                      </div>
                      {opp.assigned_to_nom && (
                        <p className="text-xs text-slate-500 mt-2">{opp.assigned_to_nom}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
