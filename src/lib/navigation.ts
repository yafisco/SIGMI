import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users2,
  Briefcase,
  Target,
  FileCheck,
  Mail,
  MessageSquare,
  Calendar,
  Package,
  Truck,
  Warehouse,
  FileText,
  ShoppingCart,
  ClipboardList,
  ShoppingBag,
  Wallet,
  Receipt,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Megaphone,
  Radio,
  UserPlus,
  ClipboardCheck,
  FolderKanban,
  Users,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import type { AppRole } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: AppRole[];
  badge?: string;
}

export interface NavSection {
  key: string;
  label: string;
  icon: LucideIcon;
  roles: AppRole[];
  items: NavItem[];
}

const ROLES_METIER: AppRole[] = [
  'direction_generale',
  'commercial',
  'finance_comptabilite',
  'responsable_pole',
  'back_office',
];

export const NAV_SECTIONS: NavSection[] = [
  {
    key: 'dashboard',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    roles: ROLES_METIER,
    items: [
      { href: '/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard, roles: ROLES_METIER },
    ],
  },
  {
    key: 'commercial',
    label: 'Commercial',
    icon: Briefcase,
    roles: ['direction_generale', 'commercial', 'responsable_pole'],
    items: [
      { href: '/commercial/prospection', label: 'Prospection', icon: Target, roles: ['direction_generale', 'commercial', 'responsable_pole'] },
      { href: '/clients', label: 'Clients', icon: Users2, roles: ROLES_METIER },
      { href: '/commercial/interactions', label: 'Interactions', icon: MessageSquare, roles: ['direction_generale', 'commercial', 'responsable_pole'] },
      { href: '/commercial/calendrier', label: 'Calendrier', icon: Calendar, roles: ['direction_generale', 'commercial', 'responsable_pole'] },
      { href: '/opportunites', label: 'Opportunités', icon: Briefcase, roles: ['direction_generale', 'commercial', 'responsable_pole'] },
      { href: '/commercial/demandes-agrement', label: 'Demandes d\'agrément', icon: FileCheck, roles: ['direction_generale', 'commercial', 'responsable_pole'] },
      { href: '/commercial/modeles-emails', label: 'Modèles d\'e-mails', icon: Mail, roles: ['direction_generale', 'commercial'] },
    ],
  },
  {
    key: 'gestion-commerciale',
    label: 'Gestion commerciale',
    icon: ShoppingCart,
    roles: ['direction_generale', 'commercial', 'responsable_pole', 'back_office'],
    items: [
      { href: '/gestion-commerciale/produits', label: 'Produits', icon: Package, roles: ['direction_generale', 'commercial', 'responsable_pole', 'back_office'] },
      { href: '/gestion-commerciale/fournisseurs', label: 'Fournisseurs', icon: Truck, roles: ['direction_generale', 'commercial', 'responsable_pole', 'back_office'] },
      { href: '/gestion-commerciale/stocks', label: 'Stocks', icon: Warehouse, roles: ['direction_generale', 'commercial', 'responsable_pole', 'back_office'] },
      { href: '/gestion-commerciale/devis', label: 'Devis', icon: FileText, roles: ['direction_generale', 'commercial', 'responsable_pole'] },
      { href: '/gestion-commerciale/ventes', label: 'Ventes', icon: ShoppingBag, roles: ['direction_generale', 'commercial', 'responsable_pole'] },
    ],
  },
  {
    key: 'finance',
    label: 'Finance et comptabilité',
    icon: Wallet,
    roles: ['direction_generale', 'finance_comptabilite'],
    items: [
      { href: '/finance/facturation', label: 'Facturation', icon: Receipt, roles: ['direction_generale', 'finance_comptabilite'] },
      { href: '/finance/encaissements-decaissements', label: 'Encaissements et décaissements', icon: ArrowLeftRight, roles: ['direction_generale', 'finance_comptabilite'] },
      { href: '/finance/budgets', label: 'Budgets', icon: PieChart, roles: ['direction_generale', 'finance_comptabilite', 'responsable_pole'] },
      { href: '/finance/rapports', label: 'Rapports', icon: BarChart3, roles: ['direction_generale', 'finance_comptabilite'] },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    roles: ['direction_generale'],
    items: [
      { href: '/marketing/campagnes', label: 'Campagnes', icon: Megaphone, roles: ['direction_generale'] },
      { href: '/marketing/sources-prospects', label: 'Sources de prospects', icon: Radio, roles: ['direction_generale'] },
    ],
  },
  {
    key: 'recrutement',
    label: 'Recrutement',
    icon: UserPlus,
    roles: ['direction_generale', 'back_office'],
    items: [
      { href: '/recrutement/postes', label: 'Postes', icon: ClipboardCheck, roles: ['direction_generale', 'back_office'] },
      { href: '/recrutement/candidatures', label: 'Candidatures', icon: UserPlus, roles: ['direction_generale', 'back_office'] },
    ],
  },
  {
    key: 'projets',
    label: 'Projets',
    icon: FolderKanban,
    roles: ['direction_generale', 'finance_comptabilite', 'responsable_pole', 'back_office'],
    items: [
      { href: '/projets', label: 'Tous les projets', icon: FolderKanban, roles: ['direction_generale', 'finance_comptabilite', 'responsable_pole', 'back_office'] },
    ],
  },
  {
    key: 'collaborateurs',
    label: 'Collaborateurs',
    icon: Users,
    roles: ['direction_generale', 'back_office', 'admin'],
    items: [
      { href: '/collaborateurs', label: 'Tous les collaborateurs', icon: Users, roles: ['direction_generale', 'back_office', 'admin'] },
    ],
  },
  {
    key: 'admin',
    label: 'Administration',
    icon: ShieldCheck,
    roles: ['admin'],
    items: [
      { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: ShieldCheck, roles: ['admin'] },
    ],
  },
];

export function getVisibleSections(role: AppRole | null | undefined): NavSection[] {
  if (!role) return [];
  return NAV_SECTIONS
    .filter((section) => section.roles.includes(role))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}

export function getAllowedPaths(role: AppRole): string[] {
  return NAV_SECTIONS.flatMap((section) =>
    section.items
      .filter((item) => item.roles.includes(role))
      .map((item) => item.href),
  );
}

export const ROUTE_ROLE_MAP: Record<string, AppRole[]> = {};
for (const section of NAV_SECTIONS) {
  for (const item of section.items) {
    ROUTE_ROLE_MAP[item.href] = item.roles;
  }
}
// Routes parentes (section landing pages)
ROUTE_ROLE_MAP['/commercial'] = ['direction_generale', 'commercial', 'responsable_pole'];
ROUTE_ROLE_MAP['/gestion-commerciale'] = ['direction_generale', 'commercial', 'responsable_pole', 'back_office'];
ROUTE_ROLE_MAP['/finance'] = ['direction_generale', 'finance_comptabilite'];
ROUTE_ROLE_MAP['/marketing'] = ['direction_generale'];
ROUTE_ROLE_MAP['/recrutement'] = ['direction_generale', 'back_office'];
// Sous-routes existantes
ROUTE_ROLE_MAP['/clients/create'] = ROLES_METIER;
ROUTE_ROLE_MAP['/opportunites/create'] = ['direction_generale', 'commercial', 'responsable_pole'];
ROUTE_ROLE_MAP['/projets/create'] = ['direction_generale', 'responsable_pole', 'back_office'];
ROUTE_ROLE_MAP['/collaborateurs/create'] = ['back_office', 'admin'];
ROUTE_ROLE_MAP['/contacts'] = ROLES_METIER;
ROUTE_ROLE_MAP['/contacts/create'] = ['direction_generale', 'commercial', 'responsable_pole', 'back_office'];
ROUTE_ROLE_MAP['/commercial/interactions'] = ['direction_generale', 'commercial', 'responsable_pole'];
ROUTE_ROLE_MAP['/commercial/interactions/create'] = ['direction_generale', 'commercial', 'responsable_pole'];
ROUTE_ROLE_MAP['/commercial/calendrier'] = ['direction_generale', 'commercial', 'responsable_pole'];
ROUTE_ROLE_MAP['/commercial/calendrier/create'] = ['direction_generale', 'commercial', 'responsable_pole'];
ROUTE_ROLE_MAP['/documents'] = ROLES_METIER;
ROUTE_ROLE_MAP['/documents/create'] = ROLES_METIER;
ROUTE_ROLE_MAP['/taches'] = ROLES_METIER;
ROUTE_ROLE_MAP['/taches/create'] = ROLES_METIER;
ROUTE_ROLE_MAP['/pipeline'] = ['direction_generale', 'commercial', 'responsable_pole'];
