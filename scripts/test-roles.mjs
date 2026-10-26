// Test des droits par rôle avec des comptes et des données fictifs.
//
//   node scripts/test-roles.mjs --seed      crée les comptes de test et les données fictives
//   node scripts/test-roles.mjs             vérifie la matrice (docs/matrice-droits.md) rôle par rôle
//   node scripts/test-roles.mjs --cleanup   supprime comptes et données de test
//
// Lit .env.local (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).
// Les mots de passe générés sont stockés dans scripts/.test-users.json (ignoré par git), jamais affichés.

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const USERS_FILE = path.join(ROOT, 'scripts', '.test-users.json');

const env = Object.fromEntries(
  readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split(/\r?\n/)
    .map((l) => l.match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].trim()])
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !ANON || !SERVICE) {
  console.error('Variables manquantes dans .env.local (URL, clé publique et SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

const service = createClient(URL_, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

const POLE_A = 'ingénierie informatique';
const POLE_B = 'agrobusiness';
const T = '[TEST]';

// Comptes fictifs (domaine réservé example.com)
const ACCOUNTS = [
  { key: 'dg', role: 'direction_generale', pole: null, prenom: 'Awa', nom: 'Test Direction' },
  { key: 'com', role: 'commercial', pole: null, prenom: 'Moussa', nom: 'Test Commercial' },
  { key: 'fin', role: 'finance_comptabilite', pole: null, prenom: 'Fatou', nom: 'Test Finance' },
  { key: 'rp', role: 'responsable_pole', pole: POLE_A, prenom: 'Ibou', nom: 'Test Responsable' },
  { key: 'rp2', role: 'responsable_pole', pole: POLE_B, prenom: 'Coumba', nom: 'Test Responsable B' },
  { key: 'bo', role: 'back_office', pole: null, prenom: 'Ndeye', nom: 'Test BackOffice' },
  { key: 'adm', role: 'admin', pole: null, prenom: 'Lamine', nom: 'Test Admin' },
].map((a) => ({ ...a, email: `sigmi.test.${a.key}@example.com` }));

const rand = () => randomBytes(4).toString('hex');

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
async function must(promise, label) {
  const { data, error } = await promise;
  if (error) throw new Error(`${label} : ${error.message}`);
  return data;
}

async function seed() {
  const users = {};
  for (const a of ACCOUNTS) {
    const password = randomBytes(18).toString('base64url');
    const { data, error } = await service.auth.admin.createUser({ email: a.email, password, email_confirm: true });
    if (error) throw new Error(`compte ${a.email} : ${error.message} (déjà créé ? lancer --cleanup)`);
    const id = data.user.id;
    await must(service.from('collaborateurs').insert({ id, nom: a.nom, prenom: a.prenom, email: a.email, poste: a.role, role: a.role, poles: a.pole ? [a.pole] : [], actif: true }), 'collaborateur');
    await must(service.from('profiles').insert({ id, nom: a.nom, prenom: a.prenom, email: a.email, role: a.role, pole: a.pole, actif: true, collaborateur_id: id }), 'profil');
    users[a.key] = { id, email: a.email, password, role: a.role, pole: a.pole };
  }

  // Données fictives : une ligne par pôle (A et B) dans chaque table
  const fx = {};
  for (const [suffix, pole, owner] of [['A', POLE_A, users.rp.id], ['B', POLE_B, users.rp2.id]]) {
    const client = await must(service.from('clients').insert({ nom: `${T} Client ${suffix}`, poles: [pole] }).select().single(), 'client');
    const projet = await must(service.from('projets').insert({ nom: `${T} Projet ${suffix}`, poles: [pole] }).select().single(), 'projet');
    const facture = await must(service.from('factures').insert({ numero: `TEST-${suffix}-${rand()}`, client_id: client.id, pole, montant: 100000, date_emission: '2026-01-15' }).select().single(), 'facture');
    fx[suffix] = {
      clients: client.id,
      projets: projet.id,
      factures: facture.id,
      contacts: (await must(service.from('contacts').insert({ nom: `${T} Contact ${suffix}`, prenom: 'Test', client_id: client.id }).select().single(), 'contact')).id,
      opportunities: (await must(service.from('opportunities').insert({ name: `${T} Opportunité ${suffix}`, amount: 500000, poles: [pole], client_id: client.id }).select().single(), 'opportunité')).id,
      prospections: (await must(service.from('prospections').insert({ libelle: `${T} Prospection ${suffix}`, pole, client_id: client.id }).select().single(), 'prospection')).id,
      demandes_agrement: (await must(service.from('demandes_agrement').insert({ libelle: `${T} Agrément ${suffix}`, pole, client_id: client.id }).select().single(), 'agrément')).id,
      devis: (await must(service.from('devis').insert({ libelle: `${T} Devis ${suffix}`, reference: `TEST-${suffix}-${rand()}`, pole, client_id: client.id, montant: 250000 }).select().single(), 'devis')).id,
      ventes: (await must(service.from('ventes').insert({ libelle: `${T} Vente ${suffix}`, pole, client_id: client.id, montant: 250000 }).select().single(), 'vente')).id,
      paiements: (await must(service.from('paiements').insert({ facture_id: facture.id, pole, montant: 50000 }).select().single(), 'paiement')).id,
      budgets: (await must(service.from('budgets').insert({ libelle: `${T} Budget ${suffix}`, pole, projet_id: projet.id, montant_prevu: 1000000 }).select().single(), 'budget')).id,
      tasks: (await must(service.from('tasks').insert({ title: `${T} Tâche ${suffix}`, pole, created_by: owner }).select().single(), 'tâche')).id,
      interactions: (await must(service.from('interactions').insert({ type: 'note', title: `${T} Interaction ${suffix}`, created_by: owner }).select().single(), 'interaction')).id,
      documents: (await must(service.from('documents').insert({ nom: `${T} Document ${suffix}`, type: 'facture', projet_id: projet.id, client_id: client.id, fichier_url: 'https://example.com/fictif.pdf', fichier_nom: 'fictif.pdf', uploaded_by: owner }).select().single(), 'document')).id,
      collaborateurs: owner,
      profiles: owner,
    };
  }

  writeFileSync(USERS_FILE, JSON.stringify({ users, fixtures: fx }, null, 2));
  console.log(`Seed terminé : ${ACCOUNTS.length} comptes fictifs et données sur 2 pôles (${POLE_A}, ${POLE_B}).`);
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------
async function cleanup() {
  const { data: list } = await service.auth.admin.listUsers({ perPage: 1000 });
  const testUsers = (list?.users ?? []).filter((u) => /^sigmi\.test\.[a-z0-9]+@example\.com$/.test(u.email ?? ''));
  const ids = testUsers.map((u) => u.id);

  const { data: testFactures } = await service.from('factures').select('id').like('numero', 'TEST-%');
  const factureIds = (testFactures ?? []).map((f) => f.id);
  if (factureIds.length) await service.from('paiements').delete().in('facture_id', factureIds);
  await service.from('factures').delete().like('numero', 'TEST-%');
  for (const [table, col] of [['ventes', 'libelle'], ['devis', 'libelle'], ['demandes_agrement', 'libelle'], ['prospections', 'libelle'], ['budgets', 'libelle'], ['documents', 'nom'], ['tasks', 'title'], ['interactions', 'title'], ['contacts', 'nom'], ['opportunities', 'name'], ['projets', 'nom'], ['clients', 'nom']]) {
    const { error } = await service.from(table).delete().like(col, `${T}%`);
    if (error) console.warn(`nettoyage ${table} : ${error.message}`);
  }
  await service.from('collaborateurs').delete().like('nom', `${T}%`);
  for (const id of ids) {
    await service.from('profiles').delete().eq('id', id);
    await service.from('collaborateurs').delete().eq('id', id);
    await service.auth.admin.deleteUser(id);
  }
  if (existsSync(USERS_FILE)) unlinkSync(USERS_FILE);
  console.log(`Nettoyage terminé : ${ids.length} comptes de test supprimés.`);
}

// ---------------------------------------------------------------------------
// Matrice attendue (docs/matrice-droits.md)
//   L : 'all' (voit les 2 pôles), 'pole' (seulement son pôle A), 'none' (aucune ligne d'autrui)
//   C, M, S : autorisé ou non
// ---------------------------------------------------------------------------
const ROLES = ['dg', 'com', 'fin', 'rp', 'bo', 'adm'];
const exp = (L, C = '', M = '', S = '') =>
  Object.fromEntries(ROLES.map((r) => [r, { L: L[r] ?? 'none', C: C.split(' ').includes(r), M: M.split(' ').includes(r), S: S.split(' ').includes(r) }]));

const COMMERCIAL_TABLE = exp({ dg: 'all', com: 'all', rp: 'pole' }, 'com rp', 'dg com rp', 'com');
const EXPECTED = {
  profiles: exp({ dg: 'all', rp: 'pole', adm: 'all' }),
  collaborateurs: exp({ dg: 'all', com: 'all', fin: 'all', rp: 'all', bo: 'all', adm: 'all' }, 'bo adm', 'bo adm'),
  clients: exp({ dg: 'all', com: 'all', fin: 'all', rp: 'pole', bo: 'all' }, 'com rp bo', 'com rp bo', 'com'),
  contacts: exp({ dg: 'all', com: 'all', fin: 'all', rp: 'pole', bo: 'all' }, 'com rp bo', 'com rp bo', 'com'),
  opportunities: COMMERCIAL_TABLE,
  prospections: COMMERCIAL_TABLE,
  demandes_agrement: COMMERCIAL_TABLE,
  devis: COMMERCIAL_TABLE,
  ventes: COMMERCIAL_TABLE,
  factures: exp({ dg: 'all', fin: 'all' }, 'fin', 'fin'),
  paiements: exp({ dg: 'all', fin: 'all' }, 'fin', 'fin'),
  budgets: exp({ dg: 'all', fin: 'all', rp: 'pole' }, 'fin', 'fin'),
  projets: exp({ dg: 'all', fin: 'all', rp: 'pole', bo: 'all' }, 'rp bo', 'dg rp bo'),
  tasks: exp({ dg: 'all', rp: 'pole' }, 'com fin rp bo', 'com fin rp bo'),
  interactions: exp({ dg: 'all', com: 'all', rp: 'pole' }, 'com', 'com', 'com'),
  documents: exp({ dg: 'all', com: 'all', fin: 'all', rp: 'pole', bo: 'all' }, 'com fin rp bo', 'com fin rp bo'),
};

// Lignes à insérer / champ à modifier pour chaque table (rattachées au pôle A)
function insertPayload(table, me, fx) {
  const r = rand();
  switch (table) {
    case 'profiles': return { id: me.id, email: me.email, role: 'admin' };
    case 'collaborateurs': return { nom: `${T} Collab ${r}`, prenom: 'Test', email: `sigmi.test.collab.${r}@example.com` };
    case 'clients': return { nom: `${T} Client ${r}`, poles: [POLE_A] };
    case 'contacts': return { nom: `${T} Contact ${r}`, prenom: 'Test', client_id: fx.A.clients };
    case 'opportunities': return { name: `${T} Opp ${r}`, amount: 1000, poles: [POLE_A] };
    case 'prospections':
    case 'demandes_agrement':
    case 'ventes': return { libelle: `${T} ${table} ${r}`, pole: POLE_A, client_id: fx.A.clients };
    case 'devis': return { libelle: `${T} Devis ${r}`, reference: `TEST-${r}`, pole: POLE_A };
    case 'factures': return { numero: `TEST-${r}`, montant: 1000, date_emission: '2026-02-01', pole: POLE_A };
    case 'paiements': return { facture_id: fx.A.factures, montant: 10, pole: POLE_A };
    case 'budgets': return { libelle: `${T} Budget ${r}`, pole: POLE_A };
    case 'projets': return { nom: `${T} Projet ${r}`, poles: [POLE_A] };
    case 'tasks': return { title: `${T} Tâche ${r}`, created_by: me.id, pole: POLE_A };
    case 'interactions': return { type: 'note', title: `${T} Interaction ${r}`, created_by: me.id };
    case 'documents': return { nom: `${T} Document ${r}`, type: 'facture', client_id: fx.A.clients, projet_id: fx.A.projets, fichier_url: 'https://example.com/fictif.pdf', fichier_nom: 'fictif.pdf', uploaded_by: me.id };
  }
}

const UPDATE_FIELD = {
  profiles: { telephone: '+221000000000' }, collaborateurs: { telephone: '+221000000000' }, clients: { ville: 'Thiès' },
  contacts: { notes: 'maj test' }, opportunities: { description: 'maj test' }, prospections: { montant: 1 },
  demandes_agrement: { decision: 'maj test' }, devis: { montant: 1 }, ventes: { montant: 1 }, factures: { description: 'maj test' },
  paiements: { mode: 'cheque' }, budgets: { montant_consomme: 1 }, projets: { description: 'maj test' },
  tasks: { description: 'maj test' }, interactions: { description: 'maj test' }, documents: { description: 'maj test' },
};

async function check() {
  if (!existsSync(USERS_FILE)) {
    console.error('Lancer d\'abord : node scripts/test-roles.mjs --seed');
    process.exit(1);
  }
  const { users, fixtures: fx } = JSON.parse(readFileSync(USERS_FILE, 'utf8'));
  let ecarts = 0;
  const resume = {};

  for (const roleKey of ROLES) {
    const me = users[roleKey];
    const client = createClient(URL_, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error: loginError } = await client.auth.signInWithPassword({ email: me.email, password: me.password });
    if (loginError) throw new Error(`connexion ${roleKey} : ${loginError.message}`);

    resume[roleKey] = {};
    for (const table of Object.keys(EXPECTED)) {
      const want = EXPECTED[table][roleKey];

      // L : quelles lignes fictives (pôle A, pôle B) sont visibles ?
      const { data: rows } = await client.from(table).select('id').in('id', [fx.A[table], fx.B[table]]);
      const ids = (rows ?? []).map((x) => x.id);
      const seesA = ids.includes(fx.A[table]);
      const seesB = ids.includes(fx.B[table]);
      const L = seesA && seesB ? 'all' : seesA ? 'pole' : seesB ? 'autre-pole' : 'none';

      // C : insertion d'une ligne du pôle A
      const ins = await client.from(table).insert(insertPayload(table, me, fx)).select('id');
      const createdId = !ins.error && ins.data?.[0]?.id;
      const C = Boolean(createdId);

      // M : modification de la ligne créée, sinon de la ligne fictive du pôle A
      const targetId = createdId || fx.A[table];
      const upd = await client.from(table).update(UPDATE_FIELD[table]).eq('id', targetId).select('id');
      const M = !upd.error && (upd.data?.length ?? 0) > 0;

      // S : suppression de la ligne créée (sinon tentative sur une ligne fictive)
      const del = await client.from(table).delete().eq('id', targetId).select('id');
      const S = !del.error && (del.data?.length ?? 0) > 0;

      // Remise en état si une ligne fictive a été supprimée à tort
      if (S && !createdId) console.warn(`  ! ${roleKey} a supprimé la ligne fictive ${table} (relancer --cleanup puis --seed)`);
      if (createdId && !S) await service.from(table).delete().eq('id', createdId);

      const got = { L, C, M, S };
      const ok = got.L === want.L && got.C === want.C && got.M === want.M && got.S === want.S;
      if (!ok) {
        ecarts++;
        console.log(`ÉCART ${roleKey} / ${table} : attendu ${JSON.stringify(want)}, obtenu ${JSON.stringify(got)}`);
      }
      resume[roleKey][table] = `${L === 'all' ? 'L' : L === 'pole' ? 'Lp' : '-'}${C ? 'C' : ''}${M ? 'M' : ''}${S ? 'S' : ''}`;
    }
    await client.auth.signOut();
  }

  // Tableau récapitulatif (L = tout, Lp = son pôle, - = rien)
  const tables = Object.keys(EXPECTED);
  console.log('\nRésultat obtenu (L = lit tout, Lp = lit son pôle, C/M/S = crée/modifie/supprime, - = aucun accès)\n');
  console.log(['table'.padEnd(18), ...ROLES.map((r) => r.padEnd(7))].join(' '));
  for (const t of tables) console.log([t.padEnd(18), ...ROLES.map((r) => (resume[r][t] || '-').padEnd(7))].join(' '));
  console.log(`\n${ecarts === 0 ? 'OK : conforme à la matrice' : `${ecarts} écart(s) avec la matrice`}`);
  process.exit(ecarts === 0 ? 0 : 1);
}

const arg = process.argv[2];
if (arg === '--seed') await seed();
else if (arg === '--cleanup') await cleanup();
else await check();
