'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Plus, Minus, Save, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/utils/errorHandler';
import { generateDevisPDF } from '@/lib/utils/devisTemplate';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';

interface LigneDevis {
  produit_id?: string;
  designation: string;
  description?: string;
  unite?: string;
  quantite: number;
  prix_unitaire: number;
  remise?: number;
}

function CreateDevisPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '';
  const [formData, setFormData] = useState({
    numero: '',
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    objet: '',
    conditions_paiement: 'comptant',
    remise_globale: 0,
    remise_globale_type: 'montant',
    notes_client: '',
    notes_internes: '',
  });
  const [lignes, setLignes] = useState<LigneDevis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<{ id: string; nom: string; adresse?: string; telephone?: string; email?: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState<{ id: string; nom: string; adresse?: string; telephone?: string; email?: string } | null>(null);
  const [produits, setProduits] = useState<{ id: string; designation: string; prix_unitaire: number }[]>([]);

  const getBackLink = () => {
    if (from === 'gestion-commerciale') return '/gestion-commerciale';
    return '/gestion-commerciale/devis';
  };

  useEffect(() => {
    async function fetchData() {
      const [clientsData, produitsData] = await Promise.all([
        supabase.from('clients').select('id, nom, adresse, telephone, email').eq('statut', 'client').order('nom'),
        supabase.from('produits').select('id, designation, prix_unitaire').eq('actif', true).order('designation'),
      ]);
      setClients(clientsData.data || []);
      setProduits(produitsData.data || []);
      
      // Générer numéro auto
      generateNumero();
    }
    fetchData();
  }, []);

  const generateNumero = async () => {
    const currentYear = new Date().getFullYear();
    let newNumero = `DEV-${currentYear}-0001`;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 100) {
      const { data } = await supabase
        .from('devis')
        .select('numero')
        .eq('numero', newNumero)
        .limit(1);
      
      if (!data || data.length === 0) {
        isUnique = true;
      } else {
        const { data: lastDevis } = await supabase
          .from('devis')
          .select('numero')
          .like('numero', `DEV-${currentYear}-%`)
          .order('numero', { ascending: false })
          .limit(1);
        
        if (lastDevis && lastDevis.length > 0) {
          const lastNum = lastDevis[0].numero;
          const match = lastNum.match(/DEV-\d{4}-(\d{4})/);
          if (match) {
            const num = parseInt(match[1]) + 1;
            newNumero = `DEV-${currentYear}-${num.toString().padStart(4, '0')}`;
          }
        }
      }
      attempts++;
    }
    
    setFormData(prev => ({ ...prev, numero: newNumero }));
  };

  const addLigne = () => {
    setLignes([...lignes, { designation: '', quantite: 1, prix_unitaire: 0, unite: 'pièce' }]);
  };

  const duplicateLigne = (index: number) => {
    const ligneToDuplicate = lignes[index];
    setLignes([...lignes, { ...ligneToDuplicate }]);
  };

  const removeLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const updateLigne = (index: number, field: keyof LigneDevis, value: any) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    setLignes(newLignes);
  };

  const totalHT = lignes.reduce((sum, ligne) => {
    const remise = ligne.remise || 0;
    const ligneTotal = ligne.quantite * ligne.prix_unitaire * (1 - remise / 100);
    return sum + ligneTotal;
  }, 0);

  const remiseGlobale = formData.remise_globale_type === 'pourcentage'
    ? totalHT * (formData.remise_globale / 100)
    : formData.remise_globale;

  const totalHTApresRemise = Math.max(0, totalHT - remiseGlobale);
  const tva = totalHTApresRemise * 0.18;
  const totalTTC = totalHTApresRemise + tva;

  const nombreEnLettres = (montant: number): string => {
    // Fonction simplifiée pour convertir en lettres
    return `${Math.round(montant).toLocaleString('fr-FR')} FCFA`;
  };

  const handleClientChange = (clientId: string) => {
    setFormData({ ...formData, client_id: clientId });
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date });
    // Mettre à jour la date de validité pour être au minimum +30 jours
    const newDate = new Date(date);
    const minValidite = new Date(newDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const currentValidite = formData.date_validite ? new Date(formData.date_validite) : null;
    if (!currentValidite || currentValidite < minValidite) {
      setFormData(prev => ({ ...prev, date_validite: minValidite.toISOString().split('T')[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.client_id || lignes.length === 0) {
      setError('Veuillez sélectionner un client et ajouter au moins une ligne');
      setLoading(false);
      return;
    }

    // Validation des lignes
    const lignesInvalides = lignes.filter(l => !l.designation || l.quantite <= 0 || l.prix_unitaire < 0);
    if (lignesInvalides.length > 0) {
      setError('Veuillez remplir correctement toutes les lignes (désignation, quantité > 0, prix ≥ 0)');
      setLoading(false);
      return;
    }

    try {
      const { data: devis, error: devisError } = await supabase.from('devis').insert({
        numero: formData.numero,
        client_id: formData.client_id,
        date: formData.date,
        date_validite: formData.date_validite || null,
        objet: formData.objet,
        conditions_paiement: formData.conditions_paiement,
        total_ht: totalHTApresRemise,
        total_ttc: totalTTC,
        notes_client: formData.notes_client,
        notes_internes: formData.notes_internes,
        statut: 'brouillon',
      }).select().single();

      if (devisError) throw devisError;

      const lignesToInsert = lignes.map(ligne => ({
        devis_id: devis.id,
        produit_id: ligne.produit_id || null,
        designation: ligne.designation,
        description: ligne.description || null,
        unite: ligne.unite || 'pièce',
        quantite: ligne.quantite,
        prix_unitaire: ligne.prix_unitaire,
        remise: ligne.remise || 0,
      }));

      const { error: lignesError } = await supabase.from('lignes_devis').insert(lignesToInsert);
      if (lignesError) throw lignesError;

      // Générer et télécharger le PDF avec le template professionnel
      const client = clients.find(c => c.id === formData.client_id);
      const lignesForPDF = lignes.map((l, index) => ({
        n: index + 1,
        designation: l.designation,
        description: l.description || '',
        qte: l.quantite,
        unite: l.unite || 'pièce',
        pu_ht: l.prix_unitaire,
        remise: l.remise || 0,
        total_ligne: (l.quantite * l.prix_unitaire) * (1 - ((l.remise || 0) / 100)),
      }));
      
      const doc = await generateDevisPDF({
        numero: formData.numero,
        date: new Date(formData.date).toLocaleDateString('fr-FR'),
        date_validite: formData.date_validite ? new Date(formData.date_validite).toLocaleDateString('fr-FR') : 'Non spécifiée',
        objet: formData.objet || 'Devis client',
        client_nom: client?.nom || 'Client',
        client_adresse: client?.adresse || '-',
        client_tel: client?.telephone || '-',
        client_email: client?.email || '-',
        commercial_nom: 'Commercial',
        lignes: lignesForPDF,
        sous_total_ht: totalHT,
        montant_remise: remiseGlobale,
        total_ht: totalHTApresRemise,
        taux_tva: 18,
        montant_tva: tva,
        total_ttc: totalTTC,
        total_ttc_en_lettres: nombreEnLettres(totalTTC),
        conditions_paiement: formData.conditions_paiement,
        delai_livraison: 'À confirmer',
        garantie: 'Selon conditions générales',
        notes_client: formData.notes_client || '',
      });
      
      doc.save(`Devis_${formData.numero}.pdf`);

      await Swal.fire({
        title: 'Succès !',
        text: 'Le devis a été créé et téléchargé',
        icon: 'success',
        confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });

      router.push(getBackLink());
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la création du devis'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={getBackLink()}>
              <Button variant="ghost" size="icon" className="hover:bg-cyan-100 hover:text-cyan-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0891B2] to-[#06B6D4] bg-clip-text text-transparent">
                Nouveau devis
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0891B2] to-[#06B6D4] flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations du devis</h2>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Numéro</label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Client *</label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => handleClientChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      required
                    >
                      <option value="">Sélectionnez un client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Récap client */}
                {selectedClient && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Informations client</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Adresse</p>
                        <p className="text-slate-900">{selectedClient.adresse || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Téléphone</p>
                        <p className="text-slate-900">{selectedClient.telephone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Email</p>
                        <p className="text-slate-900">{selectedClient.email || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Objet du devis</label>
                  <input
                    type="text"
                    value={formData.objet}
                    onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    placeholder="Objet du devis..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date de validité</label>
                    <input
                      type="date"
                      value={formData.date_validite}
                      onChange={(e) => setFormData({ ...formData, date_validite: e.target.value })}
                      min={formData.date}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Lignes du devis</h3>
                <Button type="button" onClick={addLigne} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une ligne
                </Button>
              </div>

              {lignes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Aucune ligne ajoutée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lignes.map((ligne, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Produit / Désignation *</label>
                          <select
                            value={ligne.produit_id || ''}
                            onChange={(e) => {
                              const produit = produits.find(p => p.id === e.target.value);
                              updateLigne(index, 'produit_id', e.target.value);
                              if (produit) {
                                updateLigne(index, 'designation', produit.designation);
                                updateLigne(index, 'prix_unitaire', produit.prix_unitaire);
                              }
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          >
                            <option value="">Personnalisé</option>
                            {produits.map((p) => (
                              <option key={p.id} value={p.id}>{p.designation}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={ligne.designation}
                            onChange={(e) => updateLigne(index, 'designation', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mt-2"
                            placeholder="Désignation"
                            required
                          />
                          <input
                            type="text"
                            value={ligne.description || ''}
                            onChange={(e) => updateLigne(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mt-2"
                            placeholder="Description (optionnel)"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Unité</label>
                          <select
                            value={ligne.unite || 'pièce'}
                            onChange={(e) => updateLigne(index, 'unite', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          >
                            <option value="pièce">Pièce</option>
                            <option value="heure">Heure</option>
                            <option value="jour">Jour</option>
                            <option value="forfait">Forfait</option>
                            <option value="mètre">Mètre</option>
                            <option value="m2">M²</option>
                            <option value="m3">M³</option>
                            <option value="kg">Kg</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Quantité *</label>
                          <input
                            type="number"
                            value={ligne.quantite}
                            onChange={(e) => updateLigne(index, 'quantite', parseInt(e.target.value) || 0)}
                            min="1"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Prix unitaire *</label>
                          <input
                            type="number"
                            value={ligne.prix_unitaire}
                            onChange={(e) => updateLigne(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                            min="0"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Remise (%)</label>
                          <input
                            type="number"
                            value={ligne.remise || 0}
                            onChange={(e) => updateLigne(index, 'remise', parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => duplicateLigne(index)}>
                            Dupliquer
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-bold text-slate-900">
                            {((ligne.quantite * ligne.prix_unitaire) * (1 - ((ligne.remise || 0) / 100))).toLocaleString('fr-FR')} FCFA
                          </p>
                          <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeLigne(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total HT</span>
                  <span>{totalHT.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Remise globale</span>
                  <input
                    type="number"
                    value={formData.remise_globale}
                    onChange={(e) => setFormData({ ...formData, remise_globale: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-2 py-1 border border-slate-200 rounded text-sm"
                    min="0"
                  />
                  <select
                    value={formData.remise_globale_type}
                    onChange={(e) => setFormData({ ...formData, remise_globale_type: e.target.value })}
                    className="px-2 py-1 border border-slate-200 rounded text-sm"
                  >
                    <option value="montant">FCFA</option>
                    <option value="pourcentage">%</option>
                  </select>
                </div>
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Total HT</span>
                  <span>{totalHTApresRemise.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TVA (18%)</span>
                  <span>{tva.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total TTC</span>
                  <span>{totalTTC.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="text-sm text-slate-500 italic">
                  {nombreEnLettres(totalTTC)}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Conditions de paiement</label>
              <select
                value={formData.conditions_paiement}
                onChange={(e) => setFormData({ ...formData, conditions_paiement: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl mb-4"
              >
                <option value="comptant">Comptant</option>
                <option value="30j">30 jours</option>
                <option value="45j">45 jours</option>
                <option value="60j">60 jours</option>
                <option value="90j">90 jours</option>
                <option value="acompte50">Acompte 50%</option>
                <option value="acompte30">Acompte 30%</option>
              </select>

              <label className="block text-sm font-semibold text-slate-700 mb-2">Notes client (visibles sur PDF)</label>
              <textarea
                value={formData.notes_client}
                onChange={(e) => setFormData({ ...formData, notes_client: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl mb-4"
                rows={3}
                placeholder="Notes visibles par le client..."
              />

              <label className="block text-sm font-semibold text-slate-700 mb-2">Notes internes (non visibles)</label>
              <textarea
                value={formData.notes_internes}
                onChange={(e) => setFormData({ ...formData, notes_internes: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                rows={3}
                placeholder="Notes internes..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/gestion-commerciale/devis">
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#0891B2] to-[#06B6D4] text-white">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Création...' : 'Créer le devis'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreateDevisPage() {
  return (
    <Suspense>
      <CreateDevisPageContent />
    </Suspense>
  );
}
