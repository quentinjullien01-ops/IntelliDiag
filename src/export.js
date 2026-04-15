// ═══ WORD EXPORT ═══
// Generates a .doc file using HTML format (compatible with Word/LibreOffice)

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const GRAV_LABELS = { 1: 'Mineur', 2: 'Modéré', 3: 'Significatif', 4: 'Critique' };
const GRAV_COLORS = { 1: '#4caf50', 2: '#f9a825', 3: '#e65100', 4: '#c62828' };
const RECO_LABELS = {
  surveillance: 'Surveillance',
  investigation: 'Investigation complémentaire',
  travaux_legers: 'Travaux légers',
  travaux_lourds: 'Travaux lourds',
  mise_en_securite: 'Mise en sécurité immédiate',
};

export function exportToWord(missionName, operateur, contexte, constats, synthese) {
  const done = constats.filter((c) => c.fiche);
  const totalDesordres = done.reduce((s, c) => s + (c.fiche?.desordres?.length || 0), 0);
  const maxGrav = done.length ? Math.max(...done.map((c) => c.fiche?.gravite_globale || 1)) : 0;
  const dateStr = new Date().toLocaleDateString('fr-FR');

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8">
<style>
  body { font-family: Calibri, sans-serif; color: #2d2d2d; margin: 40px 60px; line-height: 1.6; }
  h1 { color: #E8752A; border-bottom: 2px solid #E8752A; padding-bottom: 8px; font-size: 18pt; }
  h2 { color: #E8752A; font-size: 14pt; margin-top: 20px; }
  h3 { color: #555; font-size: 12pt; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  td { padding: 6px 10px; border: 1px solid #ddd; font-size: 10pt; vertical-align: top; }
  td:first-child { background: #f5f5f5; font-weight: bold; width: 25%; color: #555; }
  .gb { display: inline-block; padding: 2px 10px; border-radius: 4px; color: white; font-weight: bold; font-size: 9pt; }
  .rb { background: #FFF5EC; border: 1px solid #E8752A; border-radius: 6px; padding: 12px 16px; margin: 16px 0; }
  .pb { page-break-before: always; }
  .cb { background: #FFF5EC; border-left: 4px solid #E8752A; padding: 12px 16px; margin: 20px 0; font-style: italic; color: #555; }
  .vb { background: #e8f5e9; border: 1px solid #4caf50; border-radius: 4px; padding: 2px 8px; color: #2e7d32; font-size: 9pt; font-weight: bold; }
  .footer { color: #999; font-size: 8pt; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 10px; }
</style>
</head><body>`;

  // ── COVER PAGE ──
  html += `
<div style="text-align: center; padding: 100px 0 60px;">
  <h1 style="border: none; font-size: 36pt; margin: 0;">DiagIA</h1>
  <p style="color: #888; font-size: 14pt; margin: 10px 0 40px;">RAPPORT DE DIAGNOSTIC STRUCTUREL</p>
  <div style="color: #E8752A; font-size: 14pt;">━━━━━━━━━━━━━━━━━━</div>
  <h2 style="color: #2d2d2d; font-size: 22pt; border: none; margin-top: 30px;">${esc(missionName)}</h2>
  ${operateur ? `<p style="color: #666; font-size: 12pt;">Opérateur : ${esc(operateur)}</p>` : ''}
  <p style="color: #666; font-size: 12pt;">Date du rapport : ${dateStr}</p>
  <div style="margin-top: 40px;">
    <span style="font-size: 28pt; font-weight: bold; color: #E8752A;">${done.length}</span>
    <span style="color: #888; font-size: 11pt;"> constats &nbsp;&nbsp;·&nbsp;&nbsp; </span>
    <span style="font-size: 28pt; font-weight: bold; color: #E8752A;">${totalDesordres}</span>
    <span style="color: #888; font-size: 11pt;"> désordres &nbsp;&nbsp;·&nbsp;&nbsp; Gravité max </span>
    <span style="font-size: 28pt; font-weight: bold; color: ${GRAV_COLORS[maxGrav] || '#E8752A'};">${maxGrav}/4</span>
  </div>
</div>`;

  // Contexte
  if (contexte) {
    html += `<div class="cb"><strong>Contexte de l'ouvrage :</strong><br/>${esc(contexte)}</div>`;
  }

  // ── SYNTHÈSE ──
  if (synthese) {
    html += `<div class="pb"></div><h1>Synthèse de la mission</h1>`;
    synthese.split('\n').forEach((line) => {
      const t = line.trim();
      if (!t) return;
      if (t.match(/^\d+\.\s+[A-ZÉÈÊÀÂ]/)) {
        html += `<h2>${esc(t)}</h2>`;
      } else {
        html += `<p>${esc(t)}</p>`;
      }
    });
  }

  // ── FICHES DÉTAILLÉES ──
  done.forEach((constat, idx) => {
    const f = constat.fiche;
    const gv = f.gravite_globale || 1;

    html += `<div class="pb"></div>`;
    html += `<h1>Constat #${String(idx + 1).padStart(3, '0')} ${constat.validated ? '<span class="vb">✓ Validé par l\'opérateur</span>' : ''}</h1>`;
    html += `<p style="color: #666;">${constat.photos?.length || 1} photo(s) — ${new Date(constat.timestamp).toLocaleDateString('fr-FR')} — Gravité globale : <span class="gb" style="background: ${GRAV_COLORS[gv]};">${gv}/4 ${GRAV_LABELS[gv]}</span></p>`;

    // Synthèse
    html += `<h2>Synthèse</h2><p>${esc(f.synthese)}</p>`;

    // Contexte
    if (f.contexte) {
      const parts = [
        f.contexte.interieur_exterieur,
        f.contexte.element_structurel_principal?.replace(/_/g, ' '),
        f.contexte.materiau_principal?.replace(/_/g, ' '),
        `Visibilité : ${f.contexte.conditions_visibilite}`,
      ].filter(Boolean);
      html += `<p style="color: #888; font-style: italic;">${parts.join(' • ')}</p>`;
      if (f.contexte.observations_generales) {
        html += `<p style="color: #999; font-style: italic;">${esc(f.contexte.observations_generales)}</p>`;
      }
    }

    // Désordres
    if (f.desordres?.length > 0) {
      html += `<h2>Désordres constatés (${f.desordres.length})</h2>`;

      f.desordres.forEach((d, di) => {
        html += `<h3>${di + 1}. ${esc(d.type?.replace(/_/g, ' '))}${d.sous_type ? ` — ${esc(d.sous_type)}` : ''}</h3>`;
        html += `<table>`;
        html += `<tr><td>Gravité</td><td><span class="gb" style="background: ${GRAV_COLORS[d.gravite]};">${d.gravite}/4 ${GRAV_LABELS[d.gravite]}</span></td></tr>`;
        html += `<tr><td>Évolutivité</td><td>${esc(d.evolutivite)}</td></tr>`;
        html += `<tr><td>Impact</td><td>${esc(d.impact)}</td></tr>`;
        html += `<tr><td>Localisation</td><td>${esc(d.localisation_relative)}</td></tr>`;

        const dims = [];
        if (d.dimensions_estimees?.ouverture_mm != null) dims.push(`Ouverture : ${d.dimensions_estimees.ouverture_mm} mm`);
        if (d.dimensions_estimees?.longueur_cm != null) dims.push(`Longueur : ${d.dimensions_estimees.longueur_cm} cm`);
        if (d.dimensions_estimees?.surface_m2 != null) dims.push(`Surface : ${d.dimensions_estimees.surface_m2} m²`);
        if (dims.length > 0) html += `<tr><td>Dimensions</td><td>${dims.join(' • ')}</td></tr>`;

        html += `</table>`;
        html += `<p><strong>Description :</strong> ${esc(d.description)}</p>`;
      });
    }

    // Recommandation
    html += `<div class="rb"><strong>Recommandation globale :</strong> ${esc(RECO_LABELS[f.recommandation_globale] || f.recommandation_globale)}</div>`;

    // Confiance
    if (f.confiance) {
      html += `<p style="color: #999; font-size: 9pt;">Confiance IA : ${Math.round(f.confiance.score * 100)}%`;
      if (constat.validated) html += ` — <span style="color: #2e7d32;">Validé par l'opérateur</span>`;
      html += `</p>`;
      if (f.confiance.limites) {
        html += `<p style="color: #bbb; font-size: 9pt; font-style: italic;">Limites : ${esc(f.confiance.limites)}</p>`;
      }
    }
  });

  // Footer
  html += `<div class="footer">Rapport généré par DiagIA — ${dateStr}</div>`;
  html += `</body></html>`;

  // Download
  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DiagIA_Rapport_${missionName?.replace(/[^a-zA-Z0-9àâéèêëïôùûüç]/gi, '_') || 'mission'}_${new Date().toISOString().slice(0, 10)}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}
