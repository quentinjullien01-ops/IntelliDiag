# CLAUDE.md — DiagIA / IntelliDiag

Ce fichier oriente Claude Code (et toi, futur·e moi) dans ce projet. **Version courante : 1.2.0**.

## Quoi
**DiagIA Desktop** (package `diag-ia`, déployé sous `/IntelliDiag/`) — application web (React + Vite) de traitement post-mission pour le diagnostic structurel BTP. L'ingénieur importe les photos d'une mission, l'IA produit une fiche de constat normalisée par groupe de photos, l'opérateur valide/corrige avant export Word.

Single-page app, **100 % client** : pas de backend. Trois moteurs d'analyse au choix de l'utilisateur (UI sur l'écran d'accueil) :
- **Demo** (gratuit, sans clé) — renvoie des fiches mock réalistes après un délai simulé
- **Gemini** (gratuit, clé Google AI) — `gemini-2.5-flash` via `generativelanguage.googleapis.com`
- **Claude** (payant, clé Anthropic) — `claude-sonnet-4-20250514` via `api.anthropic.com` avec `anthropic-dangerous-direct-browser-access: true`

Le moteur et la clé API sont stockés en `localStorage` ; les requêtes partent du navigateur directement vers le fournisseur choisi.

## Stack
- React 18 + Vite 6 (ES modules, `"type": "module"`)
- Pas de TypeScript, pas de tests, pas de linter configuré
- Pas de framework CSS — tout en **inline styles** via le module [src/theme.js](src/theme.js)
- Modèles codés en dur dans [src/api.js](src/api.js) : à bumper manuellement lors d'une migration

## Architecture (`src/`)
| Fichier | Rôle |
|---|---|
| [main.jsx](src/main.jsx) | Entry point React |
| [App.jsx](src/App.jsx) | **Tout l'état + UI** : 3 écrans (`home` / `setup` / `mission`), file d'attente d'analyse, persistance auto |
| [api.js](src/api.js) | `analyzePhotos(files, prompt, apiKey, engine)` + `generateSynthesis(...)` ; routage vers `callClaude`/`callGemini`/mock démo |
| [prompts.js](src/prompts.js) | `buildAnalysisPrompt(contexte)` + `SYNTHESIS_PROMPT` (utilisé par Claude ; Gemini a un prompt inline plus court) |
| [storage.js](src/storage.js) | Missions → `localStorage` (JSON) ; Photos → IndexedDB (blobs) |
| [export.js](src/export.js) | Génération du `.doc` (HTML compatible Word/LibreOffice) |
| [components.jsx](src/components.jsx) | Primitives UI : `Grav`, `Tag`, `Btn`, `EField`, `ConfBar` |
| [theme.js](src/theme.js) | Couleurs, échelle gravité, options dropdowns |
| [styles.css](src/styles.css) | Reset minimal + animations (`spin`, `pulse`) |

## Pipeline IA
**Pipeline mono-phase**, pas de pré/post-traitement IA :

1. L'opérateur drag&drop des photos → elles tombent dans le pool `ungrouped`.
2. Il sélectionne plusieurs photos puis clique **"Grouper"** (1 constat = N photos), OU clique **"1:1"** pour créer un constat par photo automatiquement. ⚠️ **Le regroupement est 100 % manuel** — aucune IA ne suggère ni ne fusionne les groupes.
3. Chaque constat est poussé dans une file d'attente (`qr.current`) traitée séquentiellement par `processQueue()`.
4. `analyzePhotos(files, prompt, apiKey, engine)` envoie **toutes** les photos du constat en une seule requête multimodale → l'engine choisi renvoie **un seul objet JSON** (la fiche), normalisé par `validateFiche()`.
5. Synthèse de mission : bouton ✨ → `generateSynthesis()` envoie l'agrégat des fiches JSON et reçoit un texte rédigé.

> Si on veut un jour un pipeline en plusieurs phases (description par photo → regroupement IA → fusion dans constats existants), tout est à construire — ce n'est pas là.

### Mode démo
Sans clé API ou `engine === 'demo'`, `analyzePhotos` renvoie une fiche mock après un délai aléatoire (~1.5–3.5 s). Utile pour tester l'UI sans consommer de quota et pour les démos commerciales.

## Format fiche (sortie IA)
JSON strict normalisé par `validateFiche()` ([api.js](src/api.js)) :

```
{
  synthese, gravite_globale (1-4), gravite_globale_label,
  recommandation_globale ∈ {surveillance, investigation, travaux_legers, travaux_lourds, mise_en_securite},
  contexte: { interieur_exterieur, element_structurel_principal, materiau_principal,
              conditions_visibilite, observations_generales },
  desordres: [ { numero, type, sous_type, description, localisation_relative,
                 dimensions_estimees: { ouverture_mm, longueur_cm, surface_m2, note },
                 gravite, gravite_label, evolutivite, impact } ],
  confiance: { score (0-1), limites }
}
```

### Échelle gravité (1–4, pas R0–R5)
Définie dans [theme.js](src/theme.js) — `GRAVITE` :

| Niveau | Label | Bordure | Fond |
|---|---|---|---|
| 1 | Mineur | `#22c55e` | `#dcfce7` |
| 2 | Modere | `#eab308` | `#fef9c3` |
| 3 | Significatif | `#f97316` | `#ffedd5` |
| 4 | Critique | `#ef4444` | `#fee2e2` |

> Note : depuis v1.2 les labels n'ont plus d'accents (`Modere` au lieu de `Modéré`, `Evolutif`, `securite`…) — alignement avec la sortie Gemini qui ne gère pas bien l'UTF-8 dans les prompts inline.

### Taxonomie désordres (codée dans le prompt Claude)
`FISSURE`, `EPAUFRURE`, `ECLATEMENT_BETON`, `CORROSION_ARMATURES`, `DECOLLEMENT_ENDUIT`, `DECOLLEMENT_ETICS`, `INFILTRATION`, `CARBONATATION`, `MOUVEMENT_STRUCTURAL`, `DEGRADATION_BOIS`, `DEGRADATION_METAL`, `DEFAUT_ETANCHEITE`, `VEGETATION_PARASITE`, `AUTRE`.

## Couleurs / charte

**Deux palettes distinctes** — ne pas confondre :

### UI (app web — thème sombre)
[theme.js](src/theme.js) :
- Accent principal : `#ff6b35` (orange) → `#ff8f5e` (gradient)
- Fonds : `#0a0a14` / `#10101e` / `#16162a`
- Textes : `#f0eeeb` / `#a8a4a0` / `#666`

### Export Word (rapport DOC — fond blanc)
[export.js](src/export.js) :
- Orange titres/accents : **`#E8752A`**
- Beige encadrés : **`#FFF5EC`**
- Couleurs gravité : `#4caf50` / `#f9a825` / `#e65100` / `#c62828`

## Persistance
- **Index missions** → `localStorage` clé `diag-ia:missions-index`
- **Mission complète** → `localStorage` clé `diag-ia:mission:{id}` (JSON, photos non incluses)
- **Photos** (blobs `File`) → IndexedDB `diag-ia-db` / store `photos` ([storage.js](src/storage.js))
- **Clé API** → `localStorage` clé `diag-ia:api-key`
- **Moteur choisi** → `localStorage` clé `diag-ia:engine` (`demo` | `gemini` | `claude`)
- Sauvegarde auto **debouncée 500 ms** sur chaque mutation des constats / `cx` / `syn`.

## Build & déploiement

```bash
npm run dev       # vite dev server (port 5173)
npm run build     # build → dist/
npm run preview   # preview le build local
```

`base: '/IntelliDiag/'` est codé en dur dans [vite.config.js](vite.config.js) — cohérent avec une URL `https://<user>.github.io/IntelliDiag/`.

⚠️ **Pas de script `deploy`** depuis v1.2 (la dépendance `gh-pages` a été supprimée). Déploiement à faire manuellement ou via une GitHub Action à créer (pas encore en place).

## Optimisations perf en place
À ne pas défaire en passant — ces patterns sont là pour scaler à 50+ photos :

- `ConstatCard`, `EditableDesordre`, `PhotoCell` sont **mémoïsés** (`React.memo`) — handlers passés en prop sont stabilisés via `useCallback` (`handleSelect`, `togglePhotoSel`).
- `FichePanel` utilise des **refs** (`fRef`, `onUpdateRef`) pour stabiliser `upd`/`updDes` malgré les changements de `f` à chaque keystroke. Combiné avec un **spread ciblé** (au lieu de `JSON.parse(JSON.stringify(f))`), seul le désordre modifié rerend.
- Auto-save **debouncée 500 ms** : évite `JSON.stringify` + `localStorage.setItem` à chaque touche tapée dans contexte/synthèse.
- `autoCreate` **batche** les setState : un seul `setConstats` avec tous les nouveaux constats au lieu de N appels successifs.
- `resumeMission` charge les photos en **`Promise.all`** — divise par N la latence de reprise sur grosses missions.

## Conventions de code
- **Pas de TypeScript** — types implicites, vigilance requise sur les formes JSON renvoyées par l'IA.
- **Inline styles partout** (pas de classes CSS, sauf reset/animations dans `styles.css`).
- Variables d'état très **abrégées** dans `App.jsx` (`ms`, `cm`, `cx`, `nm`, `op`, `qr`, `pr`, `dg`, `gs`…). C'est le style du projet — ne pas renommer en passant.
- Commentaires de section avec barres `═══` pour structurer les fichiers longs.
- Français pour les libellés UI et les prompts ; anglais pour les noms de fonctions/variables.
- Depuis v1.2, le code de `api.js` mélange `var`/`async` style ES5-ish — c'est volontaire (compaction). Ne pas re-moderniser sans demander.

## Pièges connus
- L'API Anthropic et Gemini depuis le navigateur **exposent la clé** au runtime DOM. Acceptable car la clé est celle de l'utilisateur (saisie sur `localhost` ou GitHub Pages personnel), pas une clé partagée.
- `URL.createObjectURL` est appelé pour chaque photo affichée — pas de `revokeObjectURL` systématique → fuite mémoire potentielle sur de grosses missions. Pas critique en post-mission ponctuelle.
- À la reprise d'une mission, si une photo manque dans IndexedDB (cache vidé), un placeholder est créé — la fiche reste éditable mais l'image est perdue.
- **2 modèles en dur** : `CLAUDE_URL` + `claude-sonnet-4-20250514` et `GEMINI_URL` + `gemini-2.5-flash` ([api.js](src/api.js)). À bumper ensemble lors d'une migration.
- Le mode démo retourne **toujours la même fiche structure** avec valeurs aléatoires — ne pas le tester comme un vrai diagnostic.
