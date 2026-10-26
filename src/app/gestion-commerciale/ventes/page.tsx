'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Search, ArrowLeft, Package, User, DollarSign, Save, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/utils/errorHandler';

interface CartItem {
  produit_id: string;
  designation: string;
  prix_unitaire: number;
  quantite: number;
  sous_total: number;
}

export default function VentesPage() {
  const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
  const [produits, setProduits] = useState<{ id: string; designation: string; prix_unitaire: number }[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modePaiement, setModePaiement] = useState('especes');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      const [clientsData, produitsData] = await Promise.all([
        supabase.from('clients').select('id, nom').order('nom'),
        supabase.from('produits').select('id, designation, prix_unitaire').eq('actif', true).order('designation'),
      ]);
      setClients(clientsData.data || []);
      setProduits(produitsData.data || []);
    }
    fetchData();
  }, []);

  const filteredProduits = produits.filter(p =>
    p.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (produit: { id: string; designation: string; prix_unitaire: number }) => {
    const existingItem = cart.find(item => item.produit_id === produit.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.produit_id === produit.id
          ? { ...item, quantite: item.quantite + 1, sous_total: (item.quantite + 1) * item.prix_unitaire }
          : item
      ));
    } else {
      setCart([...cart, {
        produit_id: produit.id,
        designation: produit.designation,
        prix_unitaire: produit.prix_unitaire,
        quantite: 1,
        sous_total: produit.prix_unitaire,
      }]);
    }
  };

  const removeFromCart = (produit_id: string) => {
    setCart(cart.filter(item => item.produit_id !== produit_id));
  };

  const updateQuantity = (produit_id: string, newQuantite: number) => {
    if (newQuantite <= 0) {
      removeFromCart(produit_id);
      return;
    }
    setCart(cart.map(item =>
      item.produit_id === produit_id
        ? { ...item, quantite: newQuantite, sous_total: newQuantite * item.prix_unitaire }
        : item
    ));
  };

  const total = cart.reduce((sum, item) => sum + item.sous_total, 0);

  const handleSave = async () => {
    if (!selectedClient || cart.length === 0) {
      alert('Veuillez sélectionner un client et ajouter au moins un produit');
      return;
    }

    setLoading(true);
    try {
      const numero = `VTE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      const { data: vente, error: venteError } = await supabase.from('ventes').insert({
        numero,
        client_id: selectedClient,
        total,
        mode_paiement: modePaiement,
      }).select().single();

      if (venteError) throw venteError;

      const lignes = cart.map(item => ({
        vente_id: vente.id,
        produit_id: item.produit_id,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
      }));

      const { error: lignesError } = await supabase.from('lignes_vente').insert(lignes);
      if (lignesError) throw lignesError;

      alert('Vente enregistrée avec succès !');
      setCart([]);
      setSelectedClient('');
    } catch (err) {
      alert(errorMessage(err, 'Erreur lors de l\'enregistrement de la vente'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Espace de Vente"
        description="Enregistrement des ventes et clients"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-center justify-between"
        >
          <Link href="/gestion-commerciale">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour à Gestion commerciale
            </button>
          </Link>
          <Link href="/gestion-commerciale/ventes/historique">
            <Button variant="outline">
              <Receipt className="w-4 h-4 mr-2" />
              Historique des ventes
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sélection produits */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B89B6E] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client *</label>
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
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Rechercher un produit</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Nom du produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {filteredProduits.map((produit, index) => (
                  <motion.div
                    key={produit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-[#1D4ED8] transition-colors cursor-pointer"
                    onClick={() => addToCart(produit)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{produit.designation}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {produit.prix_unitaire.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Panier */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Panier</h3>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Le panier est vide</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.produit_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                        className="bg-slate-50 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900 text-sm">{item.designation}</h4>
                          <p className="font-semibold text-slate-900">{item.sous_total.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.produit_id, item.quantite - 1)}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantite}</span>
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.produit_id, item.quantite + 1)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => removeFromCart(item.produit_id)}>
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    <div className="flex justify-between text-slate-600">
                      <span>Sous-total</span>
                      <span>{total.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-600">Mode de paiement</label>
                      <select
                        value={modePaiement}
                        onChange={(e) => setModePaiement(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      >
                        <option value="especes">Espèces</option>
                        <option value="cheque">Chèque</option>
                        <option value="virement">Virement</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="carte">Carte</option>
                      </select>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t border-slate-200">
                      <span>Total</span>
                      <span>{total.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={loading || !selectedClient}
                    className="w-full mt-6 bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Enregistrement...' : 'Enregistrer la vente'}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
