'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Package, User, Save, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/utils/errorHandler';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { useRouter } from 'next/navigation';

export default function CreateVentePage() {
  const router = useRouter();
  const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
  const [produits, setProduits] = useState<{ id: string; designation: string; prix_unitaire: number; stock_minimum?: number }[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProduit, setSelectedProduit] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [modePaiement, setModePaiement] = useState('especes');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [clientsData, produitsData] = await Promise.all([
        supabase.from('clients').select('id, nom').eq('statut', 'client').order('nom'),
        supabase.from('produits').select('id, designation, prix_unitaire, stock_minimum, actif').order('designation'),
      ]);
      console.log('Produits chargés:', produitsData.data);
      setClients(clientsData.data || []);
      setProduits(produitsData.data || []);
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!selectedClient || !selectedProduit || !quantite) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Veuillez remplir tous les champs obligatoires',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
      return;
    }

    const produit = produits.find(p => p.id === selectedProduit);
    if (!produit) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Produit non trouvé',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
      return;
    }

    const total = produit.prix_unitaire * quantite;

    setLoading(true);
    try {
      const numero = `VTE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      const { data: vente, error: venteError } = await supabase.from('ventes').insert({
        numero,
        client_id: selectedClient,
        total,
        mode_paiement: modePaiement,
        reduction: 0,
      }).select().single();

      if (venteError) throw venteError;

      const { error: lignesError } = await supabase.from('lignes_vente').insert({
        vente_id: vente.id,
        produit_id: selectedProduit,
        quantite,
        prix_unitaire: produit.prix_unitaire,
      });
      if (lignesError) throw lignesError;

      await Swal.fire({
        title: 'Succès !',
        text: 'Vente enregistrée avec succès !',
        icon: 'success',
        confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });

      router.push('/gestion-commerciale/ventes/historique');
    } catch (err) {
      await Swal.fire({
        title: 'Erreur',
        text: errorMessage(err, 'Erreur lors de l\'enregistrement de la vente'),
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Nouvelle Vente"
        description="Enregistrement d'une nouvelle vente"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/gestion-commerciale/ventes/historique">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour à l'historique
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
            <div className="space-y-6">
              {/* Client */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Client *
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                >
                  <option value="">Sélectionnez un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>

              {/* Produit */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Produit *
                </label>
                <select
                  value={selectedProduit}
                  onChange={(e) => setSelectedProduit(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                >
                  <option value="">Sélectionnez un produit</option>
                  {produits.map((p) => (
                    <option key={p.id} value={p.id}>{p.designation} - {p.prix_unitaire.toLocaleString('fr-FR')} FCFA</option>
                  ))}
                </select>
              </div>

              {/* Quantité */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Quantité *
                </label>
                <input
                  type="number"
                  value={quantite}
                  onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                />
              </div>

              {/* Mode de paiement */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mode de paiement
                </label>
                <select
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                >
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="carte">Carte</option>
                </select>
              </div>

              {/* Prix total */}
              {selectedProduit && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Prix total</span>
                    <span className="text-xl font-bold text-slate-900">
                      {(produits.find(p => p.id === selectedProduit)?.prix_unitaire || 0 * quantite).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={loading || !selectedClient || !selectedProduit}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8] font-semibold"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Enregistrement...' : 'Enregistrer la vente'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
