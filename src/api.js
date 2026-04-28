var CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function fileToBase64(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() { resolve(reader.result.split(',')[1]); };
    reader.onerror = function() { reject(new Error('Erreur lecture fichier')); };
    reader.readAsDataURL(file);
  });
}

function extractJSONArray(text) {
  if (!text || typeof text !== 'string') return null;
  var cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  // Tentative directe
  try {
    var direct = JSON.parse(cleaned);
    if (Array.isArray(direct)) return direct;
    if (direct && Array.isArray(direct.results)) return direct.results;
    if (direct && Array.isArray(direct.fiches)) return direct.fiches;
  } catch (e) {}
  // Extraction bracket-aware (gere les chaines avec guillemets echappes)
  var start = cleaned.indexOf('[');
  if (start === -1) return null;
  var depth = 0, inStr = false, esc = false;
  for (var i = start; i < cleaned.length; i++) {
    var c = cleaned[i];
    if (esc) { esc = false; continue; }
    if (inStr) {
      if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === '[') depth++;
      else if (c === ']') {
        depth--;
        if (depth === 0) {
          try {
            var p = JSON.parse(cleaned.substring(start, i + 1));
            return Array.isArray(p) ? p : null;
          } catch (e2) { return null; }
        }
      }
    }
  }
  return null;
}

function validateBatch(arr, n) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  var out = [];
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    var rawIndices = (item && Array.isArray(item.photo_indices)) ? item.photo_indices : [];
    var indices = rawIndices.filter(function(idx) { return Number.isInteger(idx) && idx >= 0 && idx < n; });
    var ficheRaw = (item && item.fiche) ? item.fiche : item;
    var fiche = validateFiche(ficheRaw);
    if (!fiche || indices.length === 0) continue;
    out.push({ photo_indices: indices, fiche: fiche });
  }
  if (out.length === 0) return null;
  // Couvrir les photos orphelines
  var covered = {};
  for (var k = 0; k < out.length; k++) {
    for (var m = 0; m < out[k].photo_indices.length; m++) covered[out[k].photo_indices[m]] = true;
  }
  var orphans = [];
  for (var p = 0; p < n; p++) if (!covered[p]) orphans.push(p);
  if (orphans.length > 0) {
    out.push({ photo_indices: orphans, fiche: validateFiche({
      synthese: 'Photo(s) non rattachee(s) automatiquement, a examiner manuellement.',
      gravite_globale: 1, recommandation_globale: 'investigation',
      desordres: [], confiance: { score: 0.3, limites: 'Photo(s) orpheline(s) apres regroupement IA.' }
    }) });
  }
  return out;
}

function extractJSON(text) {
  if (!text || typeof text !== 'string') return null;
  var cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  var braceCount = 0;
  var start = -1;
  var end = -1;
  for (var i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') {
      if (start === -1) start = i;
      braceCount++;
    } else if (cleaned[i] === '}') {
      braceCount--;
      if (braceCount === 0 && start !== -1) {
        end = i;
        break;
      }
    }
  }
  if (start === -1 || end === -1) return null;
  try {
    var parsed = JSON.parse(cleaned.substring(start, end + 1));
    if (Array.isArray(parsed)) return parsed[0];
    return parsed;
  } catch (e) {
    return null;
  }
}

function validateFiche(obj) {
  if (!obj || typeof obj !== 'object') return null;
  var fiche = {
    synthese: obj.synthese || 'Analyse effectuee',
    gravite_globale: parseInt(obj.gravite_globale) || 2,
    gravite_globale_label: obj.gravite_globale_label || ['','Mineur','Modere','Significatif','Critique'][parseInt(obj.gravite_globale) || 2],
    recommandation_globale: obj.recommandation_globale || 'investigation',
    contexte: {
      interieur_exterieur: (obj.contexte && obj.contexte.interieur_exterieur) || 'exterieur',
      element_structurel_principal: (obj.contexte && obj.contexte.element_structurel_principal) || 'autre',
      materiau_principal: (obj.contexte && obj.contexte.materiau_principal) || 'beton_arme',
      conditions_visibilite: (obj.contexte && obj.contexte.conditions_visibilite) || 'bonne',
      observations_generales: (obj.contexte && obj.contexte.observations_generales) || ''
    },
    desordres: [],
    confiance: {
      score: (obj.confiance && typeof obj.confiance.score === 'number') ? obj.confiance.score : 0.5,
      limites: (obj.confiance && obj.confiance.limites) || ''
    }
  };
  if (obj.desordres && Array.isArray(obj.desordres)) {
    fiche.desordres = obj.desordres.map(function(d, i) {
      return {
        numero: d.numero || (i + 1),
        type: d.type || 'AUTRE',
        sous_type: d.sous_type || null,
        description: d.description || '',
        localisation_relative: d.localisation_relative || '',
        dimensions_estimees: {
          ouverture_mm: (d.dimensions_estimees && d.dimensions_estimees.ouverture_mm) || null,
          longueur_cm: (d.dimensions_estimees && d.dimensions_estimees.longueur_cm) || null,
          surface_m2: (d.dimensions_estimees && d.dimensions_estimees.surface_m2) || null,
          note: (d.dimensions_estimees && d.dimensions_estimees.note) || ''
        },
        gravite: parseInt(d.gravite) || 2,
        gravite_label: d.gravite_label || ['','Mineur','Modere','Significatif','Critique'][parseInt(d.gravite) || 2],
        evolutivite: d.evolutivite || 'stable',
        impact: d.impact || 'fonctionnel'
      };
    });
  }
  if (fiche.desordres.length === 0) {
    fiche.desordres.push({
      numero: 1, type: 'AUTRE', sous_type: null,
      description: fiche.synthese,
      localisation_relative: 'Zone photographiee',
      dimensions_estimees: { ouverture_mm: null, longueur_cm: null, surface_m2: null, note: '' },
      gravite: fiche.gravite_globale,
      gravite_label: fiche.gravite_globale_label,
      evolutivite: 'stable', impact: 'fonctionnel'
    });
  }
  return fiche;
}

var DD = [
  {t:'FISSURE',s:'structurelle',d:"Fissure verticale traversante, decalage des levres suggerant un mouvement differentiel.",i:'structurel',e:'evolutif',g:3},
  {t:'ECLATEMENT_BETON',s:'armatures apparentes',d:"Eclatement du beton d enrobage, armatures corrodees avec perte de section.",i:'structurel',e:'urgent',g:4},
  {t:'CORROSION_ARMATURES',s:null,d:"Coulures d oxyde de fer, eclatement naissant par gonflement des produits de corrosion.",i:'structurel',e:'evolutif',g:3},
  {t:'INFILTRATION',s:'efflorescences',d:"Traces blanches de lixiviation, zone humide active avec stalactites de calcite.",i:'fonctionnel',e:'evolutif',g:2},
  {t:'DECOLLEMENT_ENDUIT',s:null,d:"Decollement sur surface significative, zones creuses au sondage.",i:'fonctionnel',e:'evolutif',g:2},
  {t:'EPAUFRURE',s:null,d:"Epaufrure d angle, eclat de beton, origine mecanique probable.",i:'esthetique',e:'stable',g:1},
  {t:'CARBONATATION',s:null,d:"Enrobage friable, coloration grisatre. Test phenolphtaleine recommande.",i:'structurel',e:'evolutif',g:2},
  {t:'VEGETATION_PARASITE',s:null,d:"Vegetation dans fissures et joints, racines elargissant les fissures.",i:'fonctionnel',e:'evolutif',g:1}
];
var DE = ['poutre','poteau','voile','dalle','facade'];
var DM = ['beton_arme','maconnerie','bois','metal'];
var DL = ['Partie superieure','Zone centrale','Angle inferieur','Sous-face','Face exposee'];
function pk(a) { return a[Math.floor(Math.random() * a.length)]; }
function rn(a, b) { return Math.round((Math.random() * (b - a) + a) * 10) / 10; }

function demoFiche(n) {
  var nb = Math.floor(Math.random() * 2) + 1;
  var ds = [];
  var used = {};
  for (var i = 0; i < nb; i++) {
    var x;
    var attempts = 0;
    do { x = pk(DD); attempts++; } while (used[x.t] && attempts < 20);
    used[x.t] = true;
    ds.push({
      numero: i + 1, type: x.t, sous_type: x.s, description: x.d,
      localisation_relative: pk(DL),
      dimensions_estimees: {
        ouverture_mm: x.t === 'FISSURE' ? rn(0.1, 3) : null,
        longueur_cm: x.t === 'FISSURE' ? rn(15, 150) : null,
        surface_m2: null, note: 'Estimation visuelle'
      },
      gravite: x.g,
      gravite_label: ['','Mineur','Modere','Significatif','Critique'][x.g],
      evolutivite: x.e, impact: x.i
    });
  }
  var mg = 1;
  for (var j = 0; j < ds.length; j++) { if (ds[j].gravite > mg) mg = ds[j].gravite; }
  var conf = Math.min(0.95, 0.55 + n * 0.12 + Math.random() * 0.1);
  return {
    synthese: 'Element en ' + pk(DM).replace(/_/g, ' ') + ' - ' + nb + ' desordre' + (nb > 1 ? 's' : '') + '. ' + (mg >= 3 ? 'Attention particuliere requise.' : 'Etat convenable.'),
    gravite_globale: mg,
    gravite_globale_label: ['','Mineur','Modere','Significatif','Critique'][mg],
    recommandation_globale: mg >= 4 ? 'mise_en_securite' : mg >= 3 ? 'travaux_lourds' : mg >= 2 ? 'investigation' : 'surveillance',
    contexte: { interieur_exterieur: pk(['interieur','exterieur']), element_structurel_principal: pk(DE), materiau_principal: pk(DM), conditions_visibilite: 'bonne', observations_generales: 'MODE DEMO - Donnees fictives.' },
    desordres: ds,
    confiance: { score: Math.round(conf * 100) / 100, limites: 'MODE DEMO - Connectez une cle API pour une analyse reelle.' }
  };
}

function demoBatch(n) {
  // Simule 1-3 desordres distincts repartis sur les n photos
  var k = Math.min(n, Math.max(1, Math.floor(Math.random() * 3) + 1));
  var groups = [];
  for (var g = 0; g < k; g++) groups.push([]);
  for (var i = 0; i < n; i++) groups[i % k].push(i);
  return groups.map(function(indices) {
    return { photo_indices: indices, fiche: demoFiche(indices.length) };
  });
}

function demoSynthesis(name, n) {
  return '1. ETAT GENERAL\n\nMission "' + name + '" : ' + n + ' constats analyses. Pathologies diverses.\n\n2. DESORDRES PRINCIPAUX\n\nFissurations, eclatements, corrosion, infiltrations.\n\n3. ZONES CRITIQUES\n\nElements porteurs avec armatures apparentes.\n\n4. RECOMMANDATIONS\n\n- Court terme : mise en securite\n- Moyen terme : investigations\n- Long terme : reparations\n\n5. CONCLUSION\n\nMODE DEMO - Synthese fictive.';
}

async function callClaude(files, systemPrompt, apiKey) {
  try {
    var content = [];
    for (var i = 0; i < files.length; i++) {
      var b64 = await fileToBase64(files[i]);
      content.push({ type: 'image', source: { type: 'base64', media_type: files[i].type || 'image/jpeg', data: b64 } });
    }
    content.push({ type: 'text', text: files.length + ' photo(s). Analyse complete. Retourne UNIQUEMENT le JSON, rien d autre.' });
    var resp = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, system: systemPrompt, messages: [{ role: 'user', content: content }] })
    });
    var data = await resp.json();
    if (data.error) throw new Error(data.error.message || 'Erreur API Claude');
    var text = '';
    if (data.content) {
      for (var j = 0; j < data.content.length; j++) {
        if (data.content[j].text) text += data.content[j].text;
      }
    }
    var result = extractJSON(text);
    if (!result) throw new Error('Impossible de parser la reponse Claude');
    return validateFiche(result);
  } catch (e) {
    throw new Error('Claude: ' + e.message);
  }
}

async function callGemini(files, systemPrompt, apiKey) {
  try {
    var promptText = 'Analyse photo(s) desordre structurel. JSON uniquement: {synthese, gravite_globale(1-4), gravite_globale_label, recommandation_globale, contexte:{interieur_exterieur,element_structurel_principal,materiau_principal,conditions_visibilite,observations_generales}, desordres:[{numero,type,sous_type,description,localisation_relative,dimensions_estimees:{ouverture_mm,longueur_cm,surface_m2,note},gravite,gravite_label,evolutivite,impact}], confiance:{score,limites}}. ' + files.length + ' photo(s).';
    var parts = [{ text: promptText }];
    for (var i = 0; i < files.length; i++) {
      var b64 = await fileToBase64(files[i]);
      parts.push({ inlineData: { mimeType: files[i].type || 'image/jpeg', data: b64 } });
    }
    var resp = await fetch(GEMINI_URL + '?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192, responseMimeType: 'application/json' }
      })
    });
    var data = await resp.json();
    if (data.error) throw new Error(data.error.message || 'Erreur API Gemini');
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error('Reponse Gemini vide ou format inattendu');
    }
    var text = '';
    for (var j = 0; j < data.candidates[0].content.parts.length; j++) {
      if (data.candidates[0].content.parts[j].text) text += data.candidates[0].content.parts[j].text;
    }
    var result = extractJSON(text);
    if (!result) throw new Error('Impossible de parser la reponse Gemini. Reponse brute: ' + text.substring(0, 200));
    return validateFiche(result);
  } catch (e) {
    throw new Error('Gemini: ' + e.message);
  }
}

async function callBatchClaude(files, systemPrompt, apiKey) {
  try {
    var content = [];
    for (var i = 0; i < files.length; i++) {
      var b64 = await fileToBase64(files[i]);
      content.push({ type: 'text', text: 'Photo ' + i + ':' });
      content.push({ type: 'image', source: { type: 'base64', media_type: files[i].type || 'image/jpeg', data: b64 } });
    }
    content.push({ type: 'text', text: files.length + ' photos. Identifie les desordres distincts (regroupe les photos qui montrent le meme). Renvoie UNIQUEMENT l array JSON.' });
    var resp = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 8000, system: systemPrompt, messages: [{ role: 'user', content: content }] })
    });
    var data = await resp.json();
    if (data.error) throw new Error(data.error.message || 'Erreur API Claude');
    var text = '';
    if (data.content) {
      for (var j = 0; j < data.content.length; j++) {
        if (data.content[j].text) text += data.content[j].text;
      }
    }
    var arr = extractJSONArray(text);
    if (!arr) throw new Error('Impossible de parser le batch Claude');
    var validated = validateBatch(arr, files.length);
    if (!validated) throw new Error('Batch Claude invalide');
    return validated;
  } catch (e) {
    throw new Error('Claude batch: ' + e.message);
  }
}

async function callBatchGemini(files, systemPrompt, apiKey) {
  try {
    var parts = [{ text: systemPrompt + ' Photos numerotees 0..' + (files.length - 1) + ', dans l ordre ci-dessous.' }];
    for (var i = 0; i < files.length; i++) {
      var b64 = await fileToBase64(files[i]);
      parts.push({ text: 'Photo ' + i + ':' });
      parts.push({ inlineData: { mimeType: files[i].type || 'image/jpeg', data: b64 } });
    }
    var resp = await fetch(GEMINI_URL + '?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 16384, responseMimeType: 'application/json' }
      })
    });
    var data = await resp.json();
    if (data.error) throw new Error(data.error.message || 'Erreur API Gemini');
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error('Reponse Gemini vide');
    }
    var text = '';
    for (var j = 0; j < data.candidates[0].content.parts.length; j++) {
      if (data.candidates[0].content.parts[j].text) text += data.candidates[0].content.parts[j].text;
    }
    var arr = extractJSONArray(text);
    if (!arr) throw new Error('Impossible de parser le batch Gemini. Reponse: ' + text.substring(0, 300));
    var validated = validateBatch(arr, files.length);
    if (!validated) throw new Error('Batch Gemini invalide');
    return validated;
  } catch (e) {
    throw new Error('Gemini batch: ' + e.message);
  }
}

export async function analyzeBatch(files, systemPrompt, apiKey, engine) {
  if (!files || files.length === 0) throw new Error('Aucune photo a analyser');
  if (!engine || engine === 'demo' || !apiKey || apiKey.trim() === '') {
    await new Promise(function(r) { setTimeout(r, 2000 + Math.random() * 2000); });
    return demoBatch(files.length);
  }
  if (engine === 'gemini') return await callBatchGemini(files, systemPrompt, apiKey);
  return await callBatchClaude(files, systemPrompt, apiKey);
}

export async function analyzePhotos(files, systemPrompt, apiKey, engine) {
  if (!files || files.length === 0) throw new Error('Aucune photo a analyser');
  if (!engine || engine === 'demo' || !apiKey || apiKey.trim() === '') {
    await new Promise(function(r) { setTimeout(r, 1500 + Math.random() * 2000); });
    return demoFiche(files.length);
  }
  if (engine === 'gemini') return await callGemini(files, systemPrompt, apiKey);
  return await callClaude(files, systemPrompt, apiKey);
}

export async function generateSynthesis(systemPrompt, missionName, contexte, fichesData, apiKey, engine) {
  if (!engine || engine === 'demo' || !apiKey || apiKey.trim() === '') {
    await new Promise(function(r) { setTimeout(r, 1000 + Math.random() * 1500); });
    return demoSynthesis(missionName, fichesData.length);
  }
  var prompt = 'Mission : ' + missionName + '\n' + (contexte ? 'Contexte : ' + contexte + '\n' : '') + 'Fiches :\n' + JSON.stringify(fichesData);

  try {
    if (engine === 'gemini') {
      var resp = await fetch(GEMINI_URL + '?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\n' + prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
        })
      });
      var data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      if (!data.candidates || !data.candidates[0]) throw new Error('Reponse Gemini vide');
      var text = '';
      for (var i = 0; i < data.candidates[0].content.parts.length; i++) {
        if (data.candidates[0].content.parts[i].text) text += data.candidates[0].content.parts[i].text;
      }
      return text.trim() || 'Synthese indisponible.';
    }

    var resp2 = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, system: systemPrompt, messages: [{ role: 'user', content: prompt }] })
    });
    var data2 = await resp2.json();
    if (data2.error) throw new Error(data2.error.message);
    var text2 = '';
    for (var k = 0; k < data2.content.length; k++) {
      if (data2.content[k].text) text2 += data2.content[k].text;
    }
    return text2.trim() || 'Synthese indisponible.';
  } catch (e) {
    throw new Error('Synthese: ' + e.message);
  }
}