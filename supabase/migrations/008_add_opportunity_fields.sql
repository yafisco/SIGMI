-- Ajouter les nouveaux champs pour les opportunités selon les spécifications du commercial
-- Référence, structure concernée, secteur d'activité, pôle du Groupe MI, intitulé du besoin, source

-- Ajouter les nouveaux champs à la table opportunities
ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS reference TEXT,
ADD COLUMN IF NOT EXISTS structure_concernee TEXT,
ADD COLUMN IF NOT EXISTS secteur_activite TEXT,
ADD COLUMN IF NOT EXISTS pole_groupe_mi TEXT,
ADD COLUMN IF NOT EXISTS intitule_besoin TEXT,
ADD COLUMN IF NOT EXISTS source_opportunite TEXT;

-- Ajouter des commentaires pour documentation
COMMENT ON COLUMN opportunities.reference IS 'Référence unique de l''opportunité (ex: OPP-2024-001)';
COMMENT ON COLUMN opportunities.structure_concernee IS 'Nom de la structure/entreprise concernée';
COMMENT ON COLUMN opportunities.secteur_activite IS 'Secteur d''activité de la structure';
COMMENT ON COLUMN opportunities.pole_groupe_mi IS 'Pôle du Groupe MI concerné par l''opportunité';
COMMENT ON COLUMN opportunities.intitule_besoin IS 'Intitulé du besoin ou du marché';
COMMENT ON COLUMN opportunities.source_opportunite IS 'Source de l''opportunité (appel d''offres, réseau, partenaire, etc.)';
