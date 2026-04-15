# DiagIA Desktop

**Diagnostic structurel assisté par intelligence artificielle**

Application web desktop pour le traitement post-mission des photos de diagnostic structurel. L'IA analyse les photos de désordres et génère automatiquement des fiches de constat normalisées.

## Fonctionnalités

- 📸 **Import multi-photos** — Drag & drop de dossiers entiers de photos
- 🔗 **Groupement de photos** — Plusieurs photos par constat (vue large + détail)
- 🤖 **Analyse IA** — Détection et classification des désordres (fissures, épaufrures, corrosion, ETICS...)
- ✏️ **Édition manuelle** — Chaque champ est modifiable par l'ingénieur
- ✅ **Validation** — Système de validation par l'opérateur
- 📄 **Export Word** — Rapport professionnel avec page de garde, synthèse et fiches détaillées
- ✨ **Synthèse IA** — Génération automatique d'un résumé de mission
- 💾 **Historique persistant** — Missions sauvegardées avec photos (IndexedDB)
- 🔑 **Clé API personnelle** — Votre clé Anthropic, stockée localement

## Installation

```bash
# Cloner le repo
git clone https://github.com/VOTRE_USERNAME/diag-ia.git
cd diag-ia

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build

# Déployer sur GitHub Pages
npm run deploy
```

## Configuration

1. Obtenez une clé API sur [console.anthropic.com](https://console.anthropic.com)
2. Lancez l'app et entrez votre clé dans le champ prévu sur l'écran d'accueil
3. La clé est stockée uniquement dans le localStorage de votre navigateur

## Workflow

1. **Créer une mission** — Nom, opérateur, contexte de l'ouvrage
2. **Importer les photos** — Drag & drop depuis l'explorateur
3. **Trier les photos** — Grouper les photos du même désordre ou mode "1:1" automatique
4. **L'IA analyse** — Génération des fiches en arrière-plan
5. **Valider / corriger** — Vérifier et ajuster chaque fiche
6. **Exporter** — Rapport Word ou JSON

## Taxonomie des désordres

L'IA classifie les désordres selon cette taxonomie :

| Catégorie | Sous-types |
|-----------|-----------|
| FISSURE | structurelle, faïençage, retrait, tassement |
| EPAUFRURE | — |
| ECLATEMENT_BETON | avec/sans armatures apparentes |
| CORROSION_ARMATURES | — |
| DECOLLEMENT_ENDUIT | — |
| DECOLLEMENT_ETICS | couche de base, finition, isolant |
| INFILTRATION | traces, coulures, efflorescences |
| CARBONATATION | — |
| MOUVEMENT_STRUCTURAL | déformation, flèche, basculement |
| DEGRADATION_BOIS | pourriture, insectes, champignons |
| DEGRADATION_METAL | corrosion, flambement, déformation |
| DEFAUT_ETANCHEITE | — |
| VEGETATION_PARASITE | — |

## Stack technique

- **Frontend** : React 18 + Vite
- **IA** : Claude Sonnet (Anthropic API)
- **Stockage photos** : IndexedDB (local)
- **Stockage missions** : localStorage
- **Export** : HTML → .doc (compatible Word/LibreOffice)
- **Déploiement** : GitHub Pages

## Licence

Propriétaire — © 2026
