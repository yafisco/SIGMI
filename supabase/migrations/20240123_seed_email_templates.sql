-- Insertion des modèles d'e-mails pré-rédigés pour GROUP MI

-- 1. Présentation GROUP MI (Prospection)
INSERT INTO email_templates (nom, categorie, sujet, corps, variables, actif) VALUES (
  'Présentation GROUP MI - Prospection',
  'prospection',
  'GROUP MI : Votre partenaire pour des solutions innovantes',
  'Madame, Monsieur {nom_contact},

Nous avons le plaisir de vous présenter le GROUP MI, acteur majeur de l''ingénierie et du développement au Sénégal.

Notre groupe s''organise autour de 6 pôles d''activités complémentaires :
• Ingénierie informatique
• Génie civil et BTP
• Agrobusiness
• Trading international
• Transition énergétique
• Centre d''incubation et d''impulsion des entreprises

Fort de notre expertise et de notre engagement pour l''excellence, nous sommes convaincus que nous pouvons apporter une valeur ajoutée significative à {nom_entreprise}.

Nous souhaiterions avoir l''opportunité de vous rencontrer pour vous présenter plus en détail nos services et discuter de vos besoins potentiels.

Dans l''attente de votre retour, je vous prie d''agréer, Madame, Monsieur, l''expression de nos salutations distinguées.

{signature}',
  ARRAY['{nom_contact}', '{nom_entreprise}', '{signature}'],
  true
);

-- 2. Demande d'agrément
INSERT INTO email_templates (nom, categorie, sujet, corps, variables, actif) VALUES (
  'Demande d''agrément GROUP MI',
  'agrement',
  'Demande d''agrément - GROUP MI',
  'Madame, Monsieur {nom_contact},

Par la présente, nous avons l''honneur de solliciter auprès de {nom_entreprise} notre agrément en tant que prestataire de services.

Le GROUP MI est un groupe sénégalais structuré autour de 6 pôles d''activités :
• Ingénierie informatique
• Génie civil et BTP
• Agrobusiness
• Trading international
• Transition énergétique
• Centre d''incubation et d''impulsion des entreprises

Nos qualifications et notre expérience nous permettent de répondre aux exigences les plus élevées en matière de qualité et de professionnalisme.

Nous nous tenons à votre disposition pour tout complément d''information ou pour convenir d''un rendez-vous.

Nous vous remercions par avance de l''attention que vous porterez à notre demande et espérons une réponse favorable de votre part.

Dans l''attente de votre retour, je vous prie d''agréer, Madame, Monsieur, l''expression de nos salutations distinguées.

Le Directeur Général
GROUP MI',
  ARRAY['{nom_contact}', '{nom_entreprise}'],
  true
);

-- 3. Relance de dossier
INSERT INTO email_templates (nom, categorie, sujet, corps, variables, actif) VALUES (
  'Relance dossier en cours',
  'relance',
  'Suivi de votre dossier - GROUP MI',
  'Madame, Monsieur {nom_contact},

Nous faisons suite à notre demande d''agrément envoyée le {date} et souhaitons connaître l''état d''avancement de votre dossier.

Nous restons à votre entière disposition pour vous fournir tout document ou information complémentaire nécessaire à l''instruction de votre demande.

N''hésitezz pas à nous contacter si vous avez besoin de précisions supplémentaires.

Dans l''attente de votre retour, je vous prie d''agréer, Madame, Monsieur, l''expression de nos salutations distinguées.

{signature}',
  ARRAY['{nom_contact}', '{date}', '{signature}'],
  true
);

-- 4. Confirmation de rendez-vous
INSERT INTO email_templates (nom, categorie, sujet, corps, variables, actif) VALUES (
  'Confirmation rendez-vous',
  'rendez-vous',
  'Confirmation de rendez-vous - GROUP MI',
  'Madame, Monsieur {nom_contact},

Nous confirmons notre rendez-vous prévu le {date} à {heure} pour discuter de nos potentiels projets de collaboration.

Lieu : {lieu}
Durée estimée : {duree}

Vous trouverez ci-joint l''ordre du jour de notre rencontre.

Nous sommes impatients de vous rencontrer et d''échanger sur les opportunités de collaboration entre GROUP MI et {nom_entreprise}.

Dans l''attente de vous y retrouver, je vous prie d''agréer, Madame, Monsieur, l''expression de nos salutations distinguées.

{signature}',
  ARRAY['{nom_contact}', '{date}', '{heure}', '{lieu}', '{duree}', '{nom_entreprise}', '{signature}'],
  true
);

-- 5. Envoi de devis
INSERT INTO email_templates (nom, categorie, sujet, corps, variables, actif) VALUES (
  'Envoi de devis commercial',
  'devis',
  'Devis N°{reference} - GROUP MI',
  'Madame, Monsieur {nom_contact},

Nous avons le plaisir de vous soumettre notre devis N°{reference} pour les prestations sollicitées par {nom_entreprise}.

Ce devis d''un montant de {montant} FCFA est valable jusqu''au {date_validite}.

Il couvre les prestations suivantes :
{description_prestations}

Nous restons à votre entière disposition pour tout éclaircissement ou pour convenir d''une réunion de présentation détaillée.

Dans l''attente de votre retour, je vous prie d''agréer, Madame, Monsieur, l''expression de nos salutations distinguées.

{signature}',
  ARRAY['{nom_contact}', '{reference}', '{nom_entreprise}', '{montant}', '{date_validite}', '{description_prestations}', '{signature}'],
  true
);

-- 6. Remerciement après contrat
INSERT INTO email_templates (nom, categorie, sujet, corps, variables, actif) VALUES (
  'Remerciement signature contrat',
  'contrat',
  'Remerciements - Signature de contrat - GROUP MI',
  'Madame, Monsieur {nom_contact},

Nous tenons à vous exprimer notre gratitude pour la confiance que vous avez accordée au GROUP MI en signant le contrat N°{reference}.

Nous sommes honorés de collaborer avec {nom_entreprise} et nous mettrons tout en œuvre pour assurer le succès de ce partenariat.

Notre équipe est déjà mobilisée pour démarrer les travaux dans les meilleurs délais et selon les plus hauts standards de qualité.

Vous pouvez nous joindre à tout moment pour le suivi de l''exécution de ce projet.

Encore merci pour votre confiance, et au plaisir de collaborer avec vous.

Dans l''attente de notre collaboration, je vous prie d''agréer, Madame, Monsieur, l''expression de nos salutations distinguées.

{signature}',
  ARRAY['{nom_contact}', '{reference}', '{nom_entreprise}', '{signature}'],
  true
);

-- 7. Notification de livraison
INSERT INTO email_templates (nom, categorie, sujet, corps, variables, actif) VALUES (
  'Notification de livraison',
  'livraison',
  'Notification de livraison - GROUP MI',
  'Madame, Monsieur {nom_contact},

Nous avons le plaisir de vous informer que la commande N°{reference} a été livrée avec succès le {date}.

Détails de la livraison :
• Produits : {produits}
• Quantité : {quantite}
• Lieu de livraison : {lieu}

Nous espérons que cette livraison répond à vos attentes en termes de qualité et de délais.

N''hésitez pas à nous faire part de vos observations ou retours.

Dans l''attente de continuer à collaborer avec vous, je vous prie d''agréer, Madame, Monsieur, l''expression de nos salutations distinguées.

{signature}',
  ARRAY['{nom_contact}', '{reference}', '{date}', '{produits}', '{quantite}', '{lieu}', '{signature}'],
  true
);
