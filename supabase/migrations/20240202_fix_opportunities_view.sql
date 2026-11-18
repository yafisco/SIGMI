-- Corriger la vue v_opportunities_detail pour éviter l'erreur Internal Server Error
-- Simplifier en utilisant only la table clients pour le nom du client

DROP VIEW IF EXISTS v_opportunities_detail;

CREATE OR REPLACE VIEW v_opportunities_detail AS
SELECT
  o.*,
  c.nom as client_nom,
  c.email as client_email
FROM opportunities o
LEFT JOIN clients c ON o.client_id = c.id;
