export function buildAnalysisPrompt(contexte) {
  return 'Tu es un expert en pathologie des structures (BA, maconnerie, bois, metal, ETICS). ' +
    'Tu recois une ou plusieurs photos d un MEME desordre/zone. ' +
    'Analyse l ENSEMBLE et produis UNE SEULE fiche JSON avec TOUS les desordres visibles. ' +
    'Plusieurs angles = confiance plus haute. ' +
    (contexte ? 'CONTEXTE OUVRAGE: ' + contexte + ' ' : '') +
    'TYPES: FISSURE(structurelle/faicencage/retrait/tassement)|EPAUFRURE|ECLATEMENT_BETON|CORROSION_ARMATURES|DECOLLEMENT_ENDUIT|DECOLLEMENT_ETICS|INFILTRATION|CARBONATATION|MOUVEMENT_STRUCTURAL|DEGRADATION_BOIS|DEGRADATION_METAL|DEFAUT_ETANCHEITE|VEGETATION_PARASITE|AUTRE ' +
    'JSON strict: {"synthese":"","gravite_globale":1,"gravite_globale_label":"Mineur|Modere|Significatif|Critique","recommandation_globale":"surveillance|investigation|travaux_legers|travaux_lourds|mise_en_securite","contexte":{"interieur_exterieur":"","element_structurel_principal":"","materiau_principal":"","conditions_visibilite":"","observations_generales":""},"desordres":[{"numero":1,"type":"","sous_type":"","description":"","localisation_relative":"","dimensions_estimees":{"ouverture_mm":null,"longueur_cm":null,"surface_m2":null,"note":""},"gravite":1,"gravite_label":"","evolutivite":"stable|evolutif|urgent","impact":"esthetique|fonctionnel|structurel"}],"confiance":{"score":0.0,"limites":""}} ' +
    'REGLES: UN objet JSON. FACTUEL. Confiance HONNETE. Jamais inventer. JSON seul sans texte ni backticks.';
}

export function buildBatchAnalysisPrompt(contexte) {
  return 'Expert pathologie structures BTP (BA, maconnerie, bois, metal, ETICS). Tu recois N photos d une mission de diagnostic, indexees 0..N-1 dans l ordre fourni. ' +
    'OBJECTIF: identifie chaque DESORDRE DISTINCT visible. Un meme desordre photographie sous plusieurs angles ou distances = UN SEUL element regroupant TOUS les indices concernes. Plus de photos d un meme desordre = confiance plus haute, jamais une fiche supplementaire. ' +
    (contexte ? 'CONTEXTE OUVRAGE: ' + contexte + ' ' : '') +
    'TYPES: FISSURE(structurelle/faiencage/retrait/tassement)|EPAUFRURE|ECLATEMENT_BETON|CORROSION_ARMATURES|DECOLLEMENT_ENDUIT|DECOLLEMENT_ETICS|INFILTRATION|CARBONATATION|MOUVEMENT_STRUCTURAL|DEGRADATION_BOIS|DEGRADATION_METAL|DEFAUT_ETANCHEITE|VEGETATION_PARASITE|AUTRE ' +
    'SORTIE: array JSON. Chaque element: {"photo_indices":[...],"fiche":{...}}. ' +
    'Schema fiche: {"synthese":"","gravite_globale":1,"gravite_globale_label":"Mineur|Modere|Significatif|Critique","recommandation_globale":"surveillance|investigation|travaux_legers|travaux_lourds|mise_en_securite","contexte":{"interieur_exterieur":"","element_structurel_principal":"","materiau_principal":"","conditions_visibilite":"","observations_generales":""},"desordres":[{"numero":1,"type":"","sous_type":"","description":"","localisation_relative":"","dimensions_estimees":{"ouverture_mm":null,"longueur_cm":null,"surface_m2":null,"note":""},"gravite":1,"gravite_label":"","evolutivite":"stable|evolutif|urgent","impact":"esthetique|fonctionnel|structurel"}],"confiance":{"score":0.0,"limites":""}}. ' +
    'REGLES: regrouper les photos d un meme desordre meme s il y en a 40. Couvrir TOUTES les photos: chaque indice 0..N-1 doit apparaitre dans au moins un photo_indices. Si une photo est ambigue, rattache-la au desordre le plus proche. FACTUEL. Confiance HONNETE. Renvoyer UNIQUEMENT l array JSON, sans texte ni backticks.';
}

export var SYNTHESIS_PROMPT = 'Expert diagnostic structurel. Synthese pro (400 mots): 1.ETAT GENERAL 2.DESORDRES PRINCIPAUX 3.ZONES CRITIQUES 4.RECOMMANDATIONS 5.CONCLUSION. Factuel, technique, texte courant, pas de JSON.';
