function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

export function exportToWord(nm, op, cx, constats, syn) {
  var gl = {1:'Mineur',2:'Modere',3:'Significatif',4:'Critique'};
  var gc = {1:'#4caf50',2:'#f9a825',3:'#e65100',4:'#c62828'};
  var rl = {surveillance:'Surveillance',investigation:'Investigation complementaire',travaux_legers:'Travaux legers',travaux_lourds:'Travaux lourds',mise_en_securite:'Mise en securite'};
  var done = constats.filter(function(c) { return c.fiche; });
  var td = done.reduce(function(s, c) { return s + (c.fiche.desordres ? c.fiche.desordres.length : 0); }, 0);
  var mg = done.length ? Math.max.apply(null, done.map(function(c) { return c.fiche.gravite_globale || 1; })) : 0;

  var h = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>body{font-family:Calibri;color:#2d2d2d;margin:40px 60px;line-height:1.5}h1{color:#E8752A;border-bottom:2px solid #E8752A;padding-bottom:8px}h2{color:#E8752A}table{width:100%;border-collapse:collapse;margin:10px 0}td{padding:6px 10px;border:1px solid #ddd;font-size:10pt}td:first-child{background:#f5f5f5;font-weight:bold;width:25%}.gb{padding:2px 10px;border-radius:4px;color:white;font-weight:bold;font-size:9pt}.rb{background:#FFF5EC;border:1px solid #E8752A;border-radius:6px;padding:10px 16px;margin:16px 0}.pb{page-break-before:always}.vb{background:#e8f5e9;border:1px solid #4caf50;border-radius:4px;padding:2px 8px;color:#2e7d32;font-size:9pt;font-weight:bold}</style></head><body>';
  h += '<div style="text-align:center;padding:80px 0"><h1 style="border:none;font-size:36pt">DiagIA</h1><p style="color:#888">RAPPORT DE DIAGNOSTIC</p><h2 style="color:#2d2d2d;font-size:22pt;border:none">' + esc(nm) + '</h2>' + (op ? '<p style="color:#666">Operateur: ' + esc(op) + '</p>' : '') + '<p style="color:#666">' + new Date().toLocaleDateString('fr-FR') + '</p><p style="margin-top:30px"><b style="font-size:28pt;color:#E8752A">' + done.length + '</b> constats - <b style="font-size:28pt;color:#E8752A">' + td + '</b> desordres</p></div>';
  if (cx) h += '<div style="background:#FFF5EC;border-left:4px solid #E8752A;padding:12px 16px;margin:20px 0;font-style:italic;color:#555"><b>Contexte:</b><br/>' + esc(cx) + '</div>';
  if (syn) { h += '<div class="pb"></div><h1>Synthese</h1>'; syn.split('\n').forEach(function(l) { var t = l.trim(); if (!t) return; if (t.match(/^\d+\.\s+[A-Z]/)) h += '<h2>' + esc(t) + '</h2>'; else h += '<p>' + esc(t) + '</p>'; }); }

  done.forEach(function(c, i) {
    var f = c.fiche;
    h += '<div class="pb"></div><h1>Constat #' + String(i + 1).padStart(3, '0') + ' ' + (c.validated ? '<span class="vb">Valide</span>' : '') + '</h1>';
    h += '<p style="color:#666"><span class="gb" style="background:' + gc[f.gravite_globale] + '">' + f.gravite_globale + '/4 ' + gl[f.gravite_globale] + '</span></p>';
    h += '<h2>Synthese</h2><p>' + esc(f.synthese) + '</p>';
    if (f.desordres && f.desordres.length) {
      h += '<h2>Desordres (' + f.desordres.length + ')</h2>';
      f.desordres.forEach(function(d, j) {
        h += '<h3>' + (j + 1) + '. ' + esc((d.type || '').replace(/_/g, ' ')) + (d.sous_type ? ' - ' + esc(d.sous_type) : '') + '</h3>';
        h += '<table><tr><td>Gravite</td><td><span class="gb" style="background:' + gc[d.gravite] + '">' + d.gravite + '/4</span></td></tr>';
        h += '<tr><td>Evolutivite</td><td>' + esc(d.evolutivite) + '</td></tr>';
        h += '<tr><td>Impact</td><td>' + esc(d.impact) + '</td></tr>';
        h += '<tr><td>Localisation</td><td>' + esc(d.localisation_relative) + '</td></tr></table>';
        h += '<p><b>Description:</b> ' + esc(d.description) + '</p>';
      });
    }
    h += '<div class="rb"><b>Recommandation:</b> ' + esc(rl[f.recommandation_globale] || '') + '</div>';
  });

  h += '</body></html>';
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([h], {type: 'application/msword'}));
  a.download = 'DiagIA_' + (nm || 'rapport').replace(/[^a-zA-Z0-9]/g, '_') + '.doc';
  a.click();
}
