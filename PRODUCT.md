# Product

## Register

product

## Users

Ingénieurs et techniciens du diagnostic structurel BTP, en post-mission, sur
laptop, dans un contexte calme et concentré (bureau, fin de journée, session
de rédaction). Plusieurs profils selon le projet : opérateur seul qui trie ses
propres photos, expert senior qui relit un travail d'assistant, ou binôme
photographe + rédacteur. Pas de terrain, pas de tablette pour l'instant.

## Product Purpose

DiagIA / IntelliDiag traite les photos d'une mission de diagnostic et produit,
via IA, des fiches de constat normalisées (gravité 1 à 4, taxonomie de
désordres BTP, recommandations) que l'opérateur valide ou corrige avant export
Word. L'outil prend en charge la majeure partie du travail de rédaction
manuelle, tout en laissant le diagnostic final entre les mains de l'ingénieur.

## Brand Personality

Sobre, technique, confiant. Voix d'un outil professionnel pour expert :
précis, dense en information, sans décor, sans flatterie. L'IA est présente
(accent orange comme signature, monospace pour les sorties machine) mais
jamais vantée. L'outil parle à un pair, pas à un débutant à séduire.

## Anti-references

1. **Vieux logiciel BTP français.** Barres d'outils grises Office 2003,
   menus imbriqués, dialogues Win95, formulaires denses sans hiérarchie,
   palette terne dite « professionnelle ennuyeuse ». À éviter en bloc.
2. **AI SaaS slop.** Dégradés flous violet/bleu, hero metric + stats
   supplémentaires, cartes glassmorphisme, badges « ✨ Powered by AI »,
   copies marketing onctueuses, célébration de l'automatisation.
3. **Outil amateur, type Paint.** Aspect prototype, alignements
   approximatifs, palettes naïves, typographie système par défaut. La
   précision visuelle doit refléter la précision technique du diagnostic.

## Design Principles

1. **Densité confiante.** L'écran d'un expert affiche beaucoup
   d'information sans paraître chargé. Hiérarchie par poids, contraste, et
   alternance mono / sans-serif, pas par boîtes empilées ni cartes vides.
2. **L'orange est un signal, pas une décoration.** L'accent `#ff6b35`
   marque l'action, l'état IA, la confirmation. Quand tout devient orange,
   plus rien ne l'est : neutres tintés + un seul accent, jamais saupoudré.
3. **L'IA propose, l'humain valide.** Chaque sortie IA est visiblement
   modifiable et traçable (score de confiance, édition désordre par
   désordre). L'outil ne dilue pas la responsabilité de l'ingénieur, il la
   rend plus rapide.
4. **Texte technique en monospace.** Codes désordres, identifiants,
   gravités numériques, debug JSON : JetBrains Mono. UI et prose :
   sans-serif. L'œil distingue immédiatement la machine de l'humain.
5. **Thème par scène, pas par dogme.** Sombre par défaut pour la scène
   principale (laptop, intérieur, sessions longues, ambiance bureau).
   Thème clair prévu en option pour les utilisateurs qui le demandent ou
   les conditions qui l'exigent (lumière forte, préférence personnelle).
   Les composants sont conçus pour basculer proprement entre les deux.

## Accessibility & Inclusion

Pas de cahier des charges WCAG officiel ; viser AA comme baseline
raisonnable : contraste texte suffisant, taille de cible cliquable correcte,
navigation clavier complète dans les formulaires de validation. Respecter
`prefers-reduced-motion` sur les états de chargement (spin, pulse).
L'échelle de gravité reste lisible sans la couleur (numéro + label, pas
seulement un cercle coloré). Français uniquement, public francophone.
