# 🚀 Stratégie SEO - Clé du Mémoire

Ce document détaille la mise en œuvre de la stratégie d'optimisation pour les moteurs de recherche (SEO) au sein de la plateforme **Clé du Mémoire**.

## 📊 Vue d'Ensemble
La plateforme utilise une approche "Next.js native" pour maximiser la visibilité sur Google, particulièrement sur le marché de l'enseignement supérieur au Sénégal.

---

## 1. Architecture des Métadonnées (`Metadata API`)
La gestion des balises `<head>` est centralisée dans le **Root Layout** pour assurer une cohérence sur tout le site.

### Spécifications Techniques (`src/app/layout.tsx`) :
- **Titrage Dynamique** : Utilisation de `template: "%s | Clé du Mémoire"`. Chaque page définit son propre titre qui vient s'insérer avant le nom du site.
- **Ciblage Sémantique** : Sélection rigoureuse de mots-clés stratégiques :
  - *Sénégal, UCAD, Mémoires, Coaching académique, Dakar, Aide rédaction*.
- **Canonisation** : Déclaration systématique de l'URL canonique pour éviter le "duplicate content".
- **Détection de Format** : Désactivation de la détection automatique des numéros de téléphone/emails par les navigateurs pour un meilleur contrôle du rendu.

---

## 2. Optimisation des Réseaux Sociaux (`Open Graph`)
Pour garantir des partages attractifs sur WhatsApp, LinkedIn, Facebook et X :

- **Images de Partage** : Configuration d'images (`og:image`) de haute qualité (Logo HD).
- **Cartes Twitter** : Utilisation du format `summary_large_image` pour une visibilité accrue.
- **Localisation** : Balise `locale: "fr_FR"` pour confirmer la langue cible.

---

## 3. Données Structurées (`JSON-LD`)
Nous utilisons le format JSON-LD pour aider Google à afficher des "Rich Snippets" (extraits enrichis).

### Implémentation (`src/app/page.tsx`) :
- **EducationalOrganization** : Identifie officiellement Clé du Mémoire comme une organisation éducative basée à Dakar.
- **ProfessionalService** : Détaille les services d'accompagnement proposés.
- **FAQPage** : Intégration directe des questions fréquentes dans le code source.
  - *Avantage* : Permet d'apparaître directement avec des accordéons de questions/réponses dans les résultats de recherche Google.

---

## 4. Indexation Dynamique
Le site communique de façon proactive avec les robots d'indexation.

### Sitemap Dynamique (`src/app/sitemap.ts`) :
- Génère automatiquement un fichier `sitemap.xml`.
- Attribue une priorité de 1.0 à la page d'accueil et 0.8 aux pages secondaires.
- Met à jour la date de dernière modification à chaque consultation par un robot.

### Robots.txt (`src/app/robots.ts`) :
- **Inclusion** : Autorise l'accès complet à la vitrine publique.
- **Exclusion** : Bloque l'indexation de `/dashboard/`, `/login/`, `/register/`. 
  - *Objectif* : Se concentrer sur le contenu public et protéger les données utilisateurs.

---

## 5. Performance & Accessibilité
Le SEO moderne dépend aussi de l'expérience utilisateur (Core Web Vitals).

- **Typographie Optimisée** : Chargement de `Poppins` et `Sora` via `next/font/google` avec `display: swap` pour éviter le texte invisible pendant le chargement.
- **Images Légères** : Utilisation du composant `next/image` et configuration de Cloudinary pour le service d'images.
- **Sémantique HTML5** : Utilisation stricte des balises `<header>`, `<main>`, `<footer>` et de la hiérarchie des titres (H1-H6).

---

## 🛠 Comment mettre à jour le SEO ?

1. **Global** : Modifiez `src/app/layout.tsx` pour les mots-clés ou le nom du site.
2. **Page spécifique** : Exportez une constante `metadata` dans n'importe quel fichier `page.tsx` :
   ```tsx
   export const metadata = {
     title: "Nom de ma page",
     description: "Description attirante pour Google"
   };
   ```
3. **FAQ/Schémas** : Mettez à jour la constante `structuredData` dans `src/app/page.tsx`.

---

> [!TIP]
> Pour tester le rendu SEO, utilisez l'outil gratuit [Rich Results Test](https://search.google.com/test/rich-results) de Google.
