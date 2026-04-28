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

export var SYNTHESIS_PROMPT = 'Expert diagnostic structurel. Synthese pro (400 mots): 1.ETAT GENERAL 2.DESORDRES PRINCIPAUX 3.ZONES CRITIQUES 4.RECOMMANDATIONS 5.CONCLUSION. Factuel, technique, texte courant, pas de JSON.';
