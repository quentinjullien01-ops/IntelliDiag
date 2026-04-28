---
name: DiagIA / IntelliDiag
description: Outil sombre et dense pour le traitement post-mission de diagnostics structurels BTP, assisté par IA.
colors:
  surface-noir-bleute: "#0a0a14"
  surface-encre: "#10101e"
  surface-grain: "#16162a"
  trait-discret: "#ffffff0a"
  trait-standard: "#ffffff12"
  texte-papier-creme: "#f0eeeb"
  texte-pierre: "#a8a4a0"
  texte-cendre: "#666666"
  accent-chantier-orange: "#ff6b35"
  accent-chantier-clair: "#ff8f5e"
  gravite-1-fond: "#dcfce7"
  gravite-1-trait: "#22c55e"
  gravite-1-texte: "#166534"
  gravite-2-fond: "#fef9c3"
  gravite-2-trait: "#eab308"
  gravite-2-texte: "#854d0e"
  gravite-3-fond: "#ffedd5"
  gravite-3-trait: "#f97316"
  gravite-3-texte: "#9a3412"
  gravite-4-fond: "#fee2e2"
  gravite-4-trait: "#ef4444"
  gravite-4-texte: "#991b1b"
typography:
  display:
    fontFamily: "'DM Sans', -apple-system, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "'DM Sans', -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "'DM Sans', -apple-system, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "'DM Sans', -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'DM Sans', -apple-system, sans-serif"
    fontSize: "9px"
    fontWeight: 500
    letterSpacing: "1px"
  mono:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "11px"
    fontWeight: 400
rounded:
  xs: "3px"
  sm: "5px"
  md: "7px"
  lg: "8px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "linear-gradient(135deg, #ff6b35, #ff8f5e)"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 18px"
    typography: "{typography.title}"
  button-default:
    backgroundColor: "{colors.surface-grain}"
    textColor: "{colors.texte-pierre}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
    typography: "{typography.title}"
  button-small:
    backgroundColor: "{colors.surface-grain}"
    textColor: "{colors.texte-pierre}"
    rounded: "{rounded.md}"
    padding: "5px 12px"
    typography: "{typography.body}"
  input-field:
    backgroundColor: "{colors.surface-grain}"
    textColor: "{colors.texte-papier-creme}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
    typography: "{typography.body}"
  tag:
    backgroundColor: "{colors.surface-grain}"
    textColor: "{colors.texte-cendre}"
    rounded: "{rounded.xs}"
    padding: "2px 8px"
    typography: "{typography.mono}"
  card-list-item:
    backgroundColor: "{colors.surface-encre}"
    textColor: "{colors.texte-pierre}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  card-list-item-selected:
    backgroundColor: "#ff6b3512"
    textColor: "{colors.texte-papier-creme}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  validate-button-active:
    backgroundColor: "#22c55e18"
    textColor: "#22c55e"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
    typography: "{typography.title}"
---

# Design System: DiagIA / IntelliDiag

## 1. Overview

**Creative North Star: "L'Atelier de l'Ingénieur"**

L'Atelier de l'Ingénieur est un outil sombre, dense et silencieux. Pas un showroom, pas un dashboard de vanité : un poste de travail post-mission, où un expert revoit ses photos, valide des diagnostics, signe un rapport. La densité d'information est élevée mais maîtrisée : chaque pixel sert le métier. Les surfaces sont plates, empilées par tonalité plutôt que par ombre. Le seul accent chromatique est un orange chantier (`#ff6b35`) : il marque l'action, l'IA, l'état actif, et nulle part ailleurs.

Le système rejette frontalement trois langages visuels (anti-références reprises de PRODUCT.md) : le vieux logiciel BTP français (gris triste, formulaires denses sans hiérarchie, dialogues Win95) ; le AI SaaS slop (dégradés flous, cartes glassmorphisme, badges « ✨ Powered by AI ») ; l'amateurisme type Paint (alignements approximatifs, fonts système par défaut, palettes naïves). À la place : la précision visuelle d'un IDE, la sobriété d'un terminal, la chaleur discrète d'un cuir noir bleuté.

**Key Characteristics:**
- Thème sombre par défaut (laptop, intérieur, sessions de 30 min à 2 h), thème clair prévu en option, jamais imposé idéologiquement.
- Trois tons de surface stratifiés (`#0a0a14` → `#10101e` → `#16162a`) pour la profondeur, jamais d'ombre portée au repos.
- Typographie double : DM Sans pour la prose et l'UI, JetBrains Mono pour les sorties machine, identifiants, métriques.
- Échelle de gravité 1 à 4 codée par couleur (vert, jaune, orange, rouge), toujours combinée à un chiffre et un label, jamais couleur seule.
- Restraint coloriel total : un seul accent orange, jamais saupoudré, jamais décoratif.

## 2. Colors: La Palette Atelier

Une palette nuit plus un seul accent. Tout le reste est neutre tinté, jamais pur. Aucun `#000`, aucun `#fff`. Les tons de surface sont des bleus très désaturés, pour une lecture longue confortable et un contraste élevé sans agressivité. Le texte principal `#f0eeeb` est volontairement crémeux, pas blanc clinique : la lisibilité chaude d'un papier japonais sous lampe de bureau.

### Primary
- **Orange Chantier** (`#ff6b35`) : accent unique du système. Appliqué sur l'action principale, l'état actif, le score IA, le compteur de désordres, le focus d'input. Sa rareté est sa force.
- **Orange Chantier Clair** (`#ff8f5e`) : utilisé uniquement comme fin de gradient sur le bouton primaire. Jamais seul, jamais sur du texte.

### Neutral
- **Noir Bleuté** (`#0a0a14`) : fond global de l'application. Le visualiseur photo bascule à `#000` pur quand l'image domine, par exception.
- **Encre** (`#10101e`) : surface secondaire (panneau gauche, cartes de constat, barre de confiance).
- **Grain** (`#16162a`) : surface élevée (boutons par défaut, inputs, tags, chips).
- **Trait Discret** (`#ffffff0a`) : séparateurs internes, à peine perceptibles.
- **Trait Standard** (`#ffffff12`) : bordures de boutons et inputs au repos.
- **Papier Crème** (`#f0eeeb`) : texte principal. Warm-white, jamais `#fff`.
- **Pierre** (`#a8a4a0`) : texte secondaire, libellés, valeurs neutres.
- **Cendre** (`#666666`) : texte tertiaire, méta, placeholders.

### Tertiary: l'Échelle de Gravité (sémantique, pas décorative)

Quatre niveaux normalisés, codés en dur dans `src/theme.js`. Toujours rendus ensemble : pastille colorée + numéro 1-4 + label texte. **Jamais la couleur seule.**

- **Mineur (1)** : fond `#dcfce7`, trait `#22c55e`, texte `#166534`.
- **Modéré (2)** : fond `#fef9c3`, trait `#eab308`, texte `#854d0e`.
- **Significatif (3)** : fond `#ffedd5`, trait `#f97316`, texte `#9a3412`.
- **Critique (4)** : fond `#fee2e2`, trait `#ef4444`, texte `#991b1b`.

### Named Rules

**La Règle de l'Accent Unique.** L'orange `#ff6b35` est utilisé sur 10 % maximum de la surface visible. Il marque exclusivement : l'action principale (boutons primaires), l'état IA (en analyse, score, badge confiance), la confirmation utilisateur (carte sélectionnée). Quand tout est orange, plus rien ne l'est. Tout autre besoin de mise en avant passe par le poids typographique ou l'inversion de tonalité, pas par l'orange.

**La Règle du Pas de Pur Noir/Blanc.** Aucun `#000`, aucun `#fff` dans l'interface (le visualiseur photo en plein écran fait exception). Le texte le plus clair est `#f0eeeb` (papier crème). Le fond le plus sombre est `#0a0a14` (noir bleuté). Cette tinte permanente vers la chaleur unifie le système.

**La Règle Couleur + Forme.** Tout signal sémantique encodé en couleur (gravité, état, confiance) doit aussi être encodé en forme : numéro, icône, label, position. Daltonisme et impression noir et blanc doivent rester lisibles.

## 3. Typography

**UI / Prose Font:** DM Sans (avec `-apple-system, sans-serif` en fallback).
**Mono / Technique Font:** JetBrains Mono (avec `monospace` en fallback).

**Character:** DM Sans porte la prose, les libellés et les actions ; JetBrains Mono porte les identifiants, les compteurs, les codes de désordres, les pourcentages, tout ce qui est sortie machine. La frontière entre les deux familles est la frontière entre l'humain et l'IA. Cette dualité est le signal typographique principal du produit.

### Hierarchy

- **Display** (DM Sans 700, 24px, line-height 1.2) : pastilles de gravité globale en en-tête de fiche, titres d'écran d'accueil.
- **Headline** (DM Sans 600, 16px, line-height 1.3) : titres de section dans le panneau fiche.
- **Title** (DM Sans 600, 13px, line-height 1.4) : libellés de boutons, en-têtes de désordres, étiquettes de fiches.
- **Body** (DM Sans 400, 12px, line-height 1.5) : texte courant, descriptions, valeurs d'inputs. Mesure cible 65 à 75 caractères.
- **Label** (DM Sans 500, 9px, uppercase, letter-spacing 1px) : libellés de champs, eyebrows de section. La micro-typographie des formulaires.
- **Mono** (JetBrains Mono 400 ou 600, 10 à 11px) : identifiants `#001`, scores `87 %`, codes de désordres (`FISSURE`, `EPAUFRURE`), compteurs (`12/30`), tags techniques.

### Named Rules

**La Règle Mono = Machine.** Tout ce qui est généré ou indexé par la machine est en JetBrains Mono : numéros de constat, pourcentages, codes désordres, compteurs. Toute prose interprétative ou éditable est en DM Sans. L'utilisateur lit cette frontière sans y penser.

**La Règle Eyebrow Tracking.** Les libellés de champ et eyebrows de section sont en majuscules, 9px, letter-spacing 1px. Ce micro-traitement remplace les titres pleins et préserve la densité.

**La Règle 65 à 75ch.** Pour toute prose continue (synthèse, description de désordre), limiter la mesure à 65 à 75 caractères. Aucune ligne courante en pleine largeur d'écran.

## 4. Elevation

**Plat par défaut, profondeur par tonalité.** Le système n'utilise aucune `box-shadow` au repos. La profondeur est exprimée par trois tons de surface empilés : `surface-noir-bleute` (fond global) puis `surface-encre` (panneau, carte) puis `surface-grain` (input, bouton, tag). Les bordures à peine perceptibles (`#ffffff0a` à `#ffffff12`) tracent la séparation sans ajouter de poids visuel.

Cette absence d'ombre n'est pas un oubli : c'est une décision esthétique. Les ombres portées sont le principal vecteur de l'esthétique « SaaS 2018 » et glissent vite vers le glassmorphisme. Ici, la matière est plate et la lumière est interne. Si une élévation devait apparaître un jour (modal, popover), elle se ferait par tonalité plus claire, jamais par diffusion d'ombre.

### Named Rules

**La Règle Plate Par Défaut.** Aucune surface ne porte d'ombre au repos. La profondeur passe exclusivement par la stratification tonale (fond, surface, élément).

**La Règle Bordure Fantôme.** Les bordures sont blanches à 4 ou 12 % d'opacité, jamais des couleurs solides. Elles structurent sans bruit.

## 5. Components

Le langage visuel est tactile et confiant : surfaces nettes, coins doux mais pas ronds, transitions courtes (`.15s` à `.2s`), pas d'ornement. Chaque composant gagne sa place ; rien n'est là pour décorer.

### Buttons
- **Shape:** rectangle aux coins doux, radius 7px (`{rounded.md}`).
- **Primary:** dégradé linéaire 135° de `#ff6b35` à `#ff8f5e`, texte `#fff`, padding `10px 18px`, font-weight 600, fontSize 13px. Aucune bordure. **Un seul bouton primaire visible à l'écran à la fois.**
- **Default:** fond `surface-grain` (`#16162a`), texte `Pierre` (`#a8a4a0`), bordure `Trait Standard`, mêmes dimensions que primary.
- **Small:** padding réduit `5px 12px`, fontSize 11px. Pour les actions secondaires denses.
- **Hover / Focus:** transition `all .15s` ; pas de halo, pas de translateY. Le changement d'état passe par la luminosité du dégradé ou par un border-color qui vire `accent + 44` (orange à 27 % alpha).
- **Disabled:** fond `#222`, texte `Cendre`, opacité 0.5, cursor `not-allowed`.

### Tags / Chips
- **Style:** fond `surface-grain`, texte `Cendre` (ou couleur sémantique), bordure `Trait Standard`, radius 4px, padding `2px 8px`.
- **Typography:** mono 10px. C'est un signal machine, pas un libellé éditorial.
- **Usage:** compteurs (`12 photos`), états d'évolutivité (`urgent`, `evolutif`, `stable`), méta techniques.

### Cards / Constat List Item
- **Corner Style:** 8px (`{rounded.lg}`).
- **Background:** `surface-encre` au repos, `accent` à 12 % alpha quand sélectionné.
- **Border:** transparente au repos, `accent` à 40 % alpha quand sélectionné.
- **Shadow Strategy:** plate. La sélection passe par fond et bordure, pas par halo.
- **Internal Padding:** `10px 12px`, gap 10px entre miniature et contenu.
- **Density:** miniature photo 56×44px, indicateur de gravité 18px, libellé tronqué une ligne.

### Inputs / EField
- **Style:** fond `surface-grain`, texte `Papier Crème`, bordure `Trait Standard`, radius 5px, padding `4px 8px`, fontSize 12px.
- **Focus:** la bordure vire `accent + 44`. Pas de halo, pas de double anneau.
- **Pattern:** inline-edit. Au repos, l'input ressemble à du texte cliquable. Au clic, il devient un champ. Au blur, il redevient texte. Cette discrétion est le pattern signature des fiches éditables.
- **Label:** uppercase 9px, letter-spacing 1px, couleur `Cendre`, marge 3px sous.

### Navigation
Le shell d'application est composé de trois écrans (`home`, `setup`, `mission`), pas d'une nav globale. La transition d'écran est pilotée par état React, pas par routes URL. Sur l'écran `mission`, la navigation interne se fait par sélection de constat dans le panneau gauche (carte, fiche). Aucune barre latérale, aucun menu hamburger.

### Signature Components

**Indicateur de Gravité (`Grav`).** Carré 18 à 24px, coins 5px, fond pastel + bordure colorée + chiffre 1-4 en gras 800. Densité maximale dans un signal minuscule. **Toujours rendu en couleur + chiffre + label** : la couleur seule est interdite par la Règle Couleur + Forme.

**Barre de Confiance IA (`ConfBar`).** Libellé `Confiance IA` 10px Cendre, barre fine 4px de hauteur, pourcentage en mono 11px, badge `+ Validé` vert quand l'utilisateur a confirmé. La présence de l'IA s'affiche par cette barre, jamais par un badge `✨ Powered by AI`.

**Inline-Edit Field.** Voir Inputs : pattern texte/champ qui bascule au clic. C'est ce pattern qui permet la densité confiante du panneau fiche.

**Bouton Valider la Fiche.** Bouton dédié dans l'en-tête du panneau fiche, distinct du bouton primaire orange. Au repos : fond `surface-grain`, texte `Pierre`, bordure `Trait Standard`. Une fois validé : fond `#22c55e18`, texte `#22c55e`, bordure verte 1.5px, libellé `✓ Validé`. La validation est l'acte de signature de l'opérateur ; sa couleur (vert validation) est délibérément hors palette accent pour éviter la confusion avec une action en attente.

## 6. Do's and Don'ts

### Do:
- **Do** utiliser l'orange `#ff6b35` comme accent unique, sur 10 % maximum de toute surface visible.
- **Do** afficher la gravité par pastille colorée + numéro + label (toujours les trois ensemble).
- **Do** réserver JetBrains Mono aux sorties machine (IDs, pourcentages, codes désordres) et garder DM Sans pour la prose.
- **Do** empiler les surfaces par tonalité (`#0a0a14` puis `#10101e` puis `#16162a`) pour exprimer la profondeur.
- **Do** utiliser la couleur crème `#f0eeeb` pour le texte principal, jamais `#ffffff`.
- **Do** placer les bordures à `#ffffff0a` ou `#ffffff12` (4 à 12 % d'opacité), jamais en gris solide.
- **Do** respecter `prefers-reduced-motion` pour `spin` et `pulse` (états de chargement).
- **Do** garder une seule action primaire (bouton dégradé orange) visible par écran à la fois.
- **Do** prévoir un thème clair miroir : tous les composants doivent basculer proprement entre sombre et clair via tokens, sans palette parallèle codée en dur.

### Don't:
- **Don't** utiliser `#000` pur ou `#fff` pur dans l'interface. Toutes les neutres sont tintées.
- **Don't** ajouter d'ombres portées (`box-shadow`) aux cartes, panneaux ou boutons. La profondeur est tonale.
- **Don't** saupoudrer l'orange. Ce n'est pas une décoration, c'est un signal d'action ou d'état IA.
- **Don't** tomber dans le « vieux logiciel BTP français » : barres d'outils grises Office 2003, dialogues Win95, formulaires denses sans hiérarchie, palette terne « professionnelle ennuyeuse ».
- **Don't** tomber dans le « AI SaaS slop » : dégradés flous violet/bleu, hero metric template, cartes glassmorphisme, badges « ✨ Powered by AI », copies marketing onctueuses.
- **Don't** tomber dans l'« amateur type Paint » : alignements approximatifs, palettes naïves, fonts système par défaut, hiérarchie flottante.
- **Don't** utiliser de bordure latérale colorée supérieure à 1px comme accent visuel sur des cartes ou alertes. Interdit absolu, peu importe le contexte.
- **Don't** appliquer `background-clip: text` avec un dégradé pour faire du texte coloré.
- **Don't** ajouter de glassmorphism (`backdrop-filter: blur`) comme effet décoratif. Rare et purposeful, ou rien.
- **Don't** encoder un signal sémantique (gravité, statut, confiance) par couleur seule. Toujours forme + couleur.
- **Don't** imbriquer des cartes (cartes dans cartes). Si l'information ne tient pas dans une seule carte, retravailler la hiérarchie.
- **Don't** afficher plus d'un bouton primaire par écran. Multiplier les CTA tue le signal d'action.
- **Don't** animer les propriétés layout (`width`, `height`, `top`, `left`). Préférer `transform` et `opacity`.
- **Don't** utiliser de courbes d'easing « bounce » ou « elastic ». Ease-out exponentiel uniquement.
