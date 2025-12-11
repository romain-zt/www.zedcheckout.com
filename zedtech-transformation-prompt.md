# CURSOR PROMPT: zedcheckout.com Multi-Stakeholder Vitrine Transformation

## CONTEXT & MISSION

You are helping transform **zedcheckout.com** from a single-narrative homepage into a multi-stakeholder vitrine website that serves 5 distinct audiences:
1. **Potential Partners** (companies seeking collaboration)
2. **Potential Associates/Hires** (developers, researchers who want to join)
3. **Media/Press** (journalists, podcasters looking for story angles)
4. **Investors/Funders** (evaluating market opportunity)
5. **Curious E-commerce Community** (learning from research)

**Current State:** Single linear narrative flow  
**Target State:** Multi-pathway architecture where visitors can self-identify and navigate to relevant content

---

## CORE PRINCIPLES (NON-NEGOTIABLE)

### ✅ ALWAYS Do This:

1. **Maintain Authentic Voice**
   - Keep Romain's first-person "je" voice in personal/story sections
   - Preserve philosophical depth and research narrative
   - The "8 mois" story, elevator analogy, and "L'IA peut réhumaniser" are ASSETS, not liabilities

2. **Use ONLY Real Data**
   - 10,950 heures de R&D ✅ (verified)
   - ZedCheckout exists ✅ (real product)
   - Romain is a real founder with real LinkedIn presence ✅
   - Any other number/stat must be verified with user BEFORE adding

3. **Research Lab Positioning**
   - ZED TECH is an independent research lab
   - ZedCheckout is the FIRST commercial output, not the only focus
   - Emphasize ongoing research, not just product sales

4. **French Market Calibration**
   - Use "vous" exclusively (formal)
   - Softer CTAs: "Découvrir", "Explorer", "Échanger" (not "Achetez", "Inscrivez-vous")
   - Intellectual rigor > hyperbole
   - Understatement > aggressive claims

### ❌ NEVER Do This:

1. **No Fake Case Studies**
   - ❌ Never mention "LittleBiceps" or any anonymous client names
   - ❌ Never invent conversion stats like "Client X increased sales by 43%"
   - ✅ If referencing results, use generic format: "Un coaching fitness" (verified real case)

2. **No Generic Stock Content**
   - ❌ No buzzwords like "cutting-edge innovative solutions"
   - ❌ No generic stock photos (wait for real team photos)
   - ❌ No invented testimonials

3. **No Over-Promising**
   - ❌ Don't claim "leader français" or "meilleure solution"
   - ❌ Don't guarantee specific results ("augmentez vos conversions de 50%!")
   - ✅ Frame everything as research-backed hypotheses being tested

4. **No Confusion Between Lab vs Product**
   - ZED TECH ≠ ZedCheckout
   - ZED TECH = Lab that created ZedCheckout (and will create more)

---

## IMPLEMENTATION ROADMAP

### PHASE 1: Homepage Restructuring (Priority)

#### Section 1: Hero (Keep, Minor Tweaks)
**Current:** Strong philosophical positioning  
**Action:** Add lab clarification

```html
<!-- Example structure -->
<section class="hero">
  <p class="overline">Lab de recherche e-commerce indépendant</p>
  <h1>L'IA peut réhumaniser l'expérience d'achat en ligne</h1>
  <p class="subheadline">
    10,950 heures de R&D pour transformer le checkout 
    d'une formalité administrative en conversation naturelle
  </p>
  <div class="cta-group">
    <button>Découvrir nos recherches</button>
    <a href="#stakeholders">Qui êtes-vous ?</a>
  </div>
</section>
```

**Key Points:**
- Add "Lab de recherche e-commerce indépendant" as positioning anchor
- Keep existing headline (it's strong thought leadership)
- Add dual CTA: one for deep-dive, one for stakeholder segmentation

---

#### Section 2: Stakeholder Segmentation (NEW - High Priority)

**Placement:** Immediately after hero, before problem statement

```html
<section id="stakeholders" class="stakeholder-segmentation">
  <h2>Vous êtes…</h2>
  <p class="intro">
    ZED TECH sert différents profils. 
    Choisissez votre parcours :
  </p>
  
  <div class="stakeholder-grid">
    <!-- Partner Card -->
    <div class="stakeholder-card">
      <span class="icon">🤝</span>
      <h3>Partenaire industriel</h3>
      <p>
        Vous cherchez à collaborer sur des solutions 
        e-commerce innovantes basées sur la recherche
      </p>
      <a href="#collaborations">Découvrir nos axes de collaboration →</a>
    </div>
    
    <!-- Researcher/Academic Card -->
    <div class="stakeholder-card">
      <span class="icon">🔬</span>
      <h3>Chercheur / Académique</h3>
      <p>
        Vous travaillez sur l'IA conversationnelle, 
        l'UX e-commerce ou la psychologie du consommateur
      </p>
      <a href="#recherches">Explorer nos publications →</a>
    </div>
    
    <!-- Media/Press Card -->
    <div class="stakeholder-card">
      <span class="icon">📢</span>
      <h3>Presse / Média</h3>
      <p>
        Vous cherchez des angles innovants sur 
        l'e-commerce et l'IA au service de l'humain
      </p>
      <a href="/presse">Accéder au dossier de presse →</a>
    </div>
    
    <!-- Entrepreneur Card -->
    <div class="stakeholder-card">
      <span class="icon">💡</span>
      <h3>Entrepreneur e-commerce</h3>
      <p>
        Vous voulez suivre nos recherches et 
        comprendre les évolutions du secteur
      </p>
      <a href="#recherches">Suivre nos insights →</a>
    </div>
  </div>
  
  <p class="continue-hint">
    Ou continuez à défiler pour découvrir notre approche complète ↓
  </p>
</section>
```

**Design Notes:**
- Cards should be clean, minimal, with subtle hover effects
- Icons can be emojis or simple SVG icons (no complex illustrations needed)
- Mobile: Stack vertically, full-width cards
- Each card links to relevant anchor or page

---

#### Section 3: Problem Statement (Keep, No Changes)

**Current:** "L'e-commerce est devenu une expérience froide"  
**Action:** ✅ Keep as-is — this is strong thought leadership framing

---

#### Section 4: Founder Bio (MOVE UP + ENHANCE)

**Current:** Buried at bottom  
**Action:** Move BEFORE the "8 mois" story to contextualize who's behind the research

```html
<section id="fondateur" class="founder-intro">
  <div class="founder-content">
    <div class="founder-text">
      <h2>Romain Piveteau — Fondateur</h2>
      
      <p class="origin-story">
        Ancien charpentier traditionnel reconverti en développeur full-stack. 
        Cette double formation m'a appris une chose : 
        <strong>les meilleures solutions ne sont pas toujours les plus complexes.</strong>
      </p>
      
      <p>
        Après 10 ans à développer des sites e-commerce en freelance 
        (coaching, fitness, artisanat), j'ai identifié un pattern récurrent : 
        <strong>l'abandon massif au moment du paiement.</strong>
      </p>
      
      <p>
        Plutôt que de proposer un énième redesign esthétique, 
        j'ai créé ZED TECH pour résoudre le problème à la racine : 
        <strong>rendre le checkout conversationnel.</strong>
      </p>
      
      <p class="current-state">
        10,950 heures plus tard, nous avons développé ZedCheckout — 
        et nous continuons d'explorer comment l'IA peut réhumaniser l'e-commerce.
      </p>
      
      <div class="founder-links">
        <a href="https://linkedin.com/in/romain-piveteau" target="_blank">
          LinkedIn
        </a>
        <!-- Add GitHub, Speaking page, etc. when available -->
      </div>
    </div>
    
    <div class="founder-photo">
      <!-- PLACEHOLDER: Wait for real professional photo -->
      <!-- For now, can use a subtle gradient or abstract shape -->
      <div class="photo-placeholder">
        <p>Photo professionnelle à venir</p>
      </div>
    </div>
  </div>
</section>
```

**Key Enhancements:**
- ✅ Moves bio up to establish credibility early
- ✅ Adds specific context: charpentier → dev (explains "système D" approach)
- ✅ Clarifies domain expertise: 10 years freelance in specific verticals
- ✅ Explains the "why" behind ZED TECH
- ✅ Positions ZedCheckout as first output, not only focus
- ⏸️ Photo placeholder (wait for real photo, don't use stock)

**What to Ask User:**
- "Peux-tu partager plus de détails sur ton parcours freelance ? Secteurs spécifiques, taille projets, technologies maîtrisées ?"
- "Préfères-tu mentionner des entreprises/clients passés (sans nom) comme 'Ancien dev chez [type entreprise]' ?"

---

#### Section 5: The "8 Mois" Story (Keep, Add Progressive Disclosure)

**Current:** Long-form narrative  
**Action:** Keep full depth, but add expandable sections for mobile

```html
<section id="histoire" class="origin-story">
  <h2>Le déclic : 8 mois d'échec</h2>
  
  <div class="story-intro">
    <p>
      Entre octobre 2022 et juin 2023, j'ai travaillé sur un projet 
      qui devait révolutionner ma vie freelance. 
      Résultat : <strong>8 mois d'échec qui ont changé ma vision de l'e-commerce.</strong>
    </p>
  </div>
  
  <!-- Chapter 1: Expandable on mobile -->
  <details class="story-chapter" open>
    <summary>
      <h3>Chapitre 1 : L'hypothèse (6.49% → 8.01%)</h3>
      <span class="expand-icon">▼</span>
    </summary>
    <div class="chapter-content">
      <!-- Full existing content here -->
      <p>Un client coaching fitness, taux de conversion initial 6.49%...</p>
      <!-- Keep all existing narrative -->
    </div>
  </details>
  
  <!-- Repeat for other chapters -->
  
  <div class="story-lesson">
    <blockquote class="pull-quote">
      "Le problème n'était pas la vitesse des ascenseurs. 
      C'était la perception du temps."
    </blockquote>
    <p>
      Cette analogie est devenue le fondement de ZED TECH : 
      transformer le checkout d'une attente froide en conversation engageante.
    </p>
  </div>
</section>
```

**Implementation Notes:**
- Use `<details>` + `<summary>` for native expandable sections
- Desktop: All chapters open by default
- Mobile: First chapter open, others collapsed (user can expand)
- Add pull quotes between chapters to create "breathing room"

---

#### Section 6: Philosophy / Vision (Keep, Add Visual Breaks)

**Current:** Dense text about "L'IA peut réhumaniser"  
**Action:** Keep content, add visual rhythm

```html
<section id="philosophie" class="philosophy">
  <h2>Notre approche : L'IA au service de l'humain</h2>
  
  <div class="philosophy-intro">
    <p>
      Paradoxe moderne : nous avons plus d'outils technologiques que jamais, 
      et pourtant l'e-commerce n'a jamais semblé aussi <strong>déshumanisé</strong>.
    </p>
  </div>
  
  <blockquote class="manifesto-quote">
    "Vos clients ne sont pas des taux de conversion. 
    Ce sont des humains avec des questions, des doutes, des contextes."
  </blockquote>
  
  <!-- Keep existing philosophy content -->
  
  <div class="visual-break">
    <!-- Subtle divider or whitespace -->
  </div>
  
  <!-- Continue with more philosophy -->
</section>
```

**Design Notes:**
- Add large pull quotes between paragraphs for visual rhythm
- Use ample whitespace (60-30-10 rule: 60% white, 30% visuals, 10% text)
- Consider subtle scroll-triggered fade-ins for quotes (but keep it subtle)

---

#### Section 7: Research Outputs (NEW SECTION)

**Placement:** After philosophy, before contact

```html
<section id="solutions" class="research-outputs">
  <h2>De la recherche à la pratique</h2>
  
  <p class="section-intro">
    ZED TECH est un lab de recherche qui développe des solutions 
    concrètes basées sur nos 10,950 heures de R&D.
  </p>
  
  <!-- ZedCheckout Card -->
  <div class="output-card featured">
    <div class="output-header">
      <span class="output-status">En développement · Launch Janvier 2026</span>
      <h3>ZedCheckout</h3>
    </div>
    
    <p class="output-description">
      Un checkout conversationnel qui remplace les formulaires rigides 
      par un dialogue naturel. Inspiré de 10,950 heures d'analyse 
      des comportements d'achat.
    </p>
    
    <div class="output-features">
      <ul>
        <li>✅ Dialogue conversationnel (pas de formulaires)</li>
        <li>✅ Détection intelligente des hésitations</li>
        <li>✅ Adaptation au contexte client</li>
        <li>✅ Intégration Shopify, WooCommerce, PrestaShop</li>
      </ul>
    </div>
    
    <div class="output-cta">
      <a href="https://www.zedcheckout.com" class="primary-btn" target="_blank">
        Découvrir ZedCheckout →
      </a>
      <p class="cta-note">
        Accès anticipé ouvert · Intégration en 15 minutes
      </p>
    </div>
  </div>
  
  <!-- Future Directions Card -->
  <div class="output-card exploratory">
    <div class="output-header">
      <span class="output-status">En exploration</span>
      <h3>Prochains axes de recherche</h3>
    </div>
    
    <p class="output-description">
      Le lab continue d'explorer de nouvelles applications 
      de l'IA conversationnelle en e-commerce :
    </p>
    
    <ul class="research-directions">
      <li>
        <strong>Post-purchase conversationnel</strong>  
        Suivi de commande humanisé et proactif
      </li>
      <li>
        <strong>Recommandations contextuelles</strong>  
        Au-delà des "clients ayant acheté..."
      </li>
      <li>
        <strong>SAV préventif</strong>  
        Détection et résolution avant frustration
      </li>
    </ul>
    
    <p class="exploratory-note">
      Ces recherches alimenteront de futures solutions commerciales 
      ou publications académiques.
    </p>
  </div>
  
  <div class="timeline-clarification">
    <p class="meta-info">
      <strong>ZED TECH</strong> : Lab opérationnel depuis 2015 · 10,950h de R&D cumulées<br>
      <strong>ZedCheckout</strong> : Accès anticipé ouvert · Launch officiel Janvier 2026
    </p>
  </div>
</section>
```

**Key Points:**
- ✅ Clarifies lab vs product relationship
- ✅ Positions ZedCheckout as FIRST output, not only focus
- ✅ Shows ongoing research (credibility for thought leadership)
- ⚠️ Only mention features that are real/planned for ZedCheckout
- ❌ Don't invent future products — keep it as "axes de recherche"

**What to Ask User:**
- "Les axes de recherche mentionnés (post-purchase, recommandations, SAV) sont-ils alignés avec ta vision long-terme ?"
- "Y a-t-il d'autres directions de recherche en cours que je devrais mentionner ?"

---

#### Section 8: Contact (ENHANCE with Segmentation)

**Current:** Generic contact form  
**Action:** Add stakeholder-specific routing

```html
<section id="contact" class="contact-section">
  <h2>Discutons de votre projet</h2>
  
  <p class="contact-intro">
    Que vous soyez partenaire industriel, chercheur, journaliste, 
    ou simplement curieux de nos travaux — nous sommes ouverts à l'échange.
  </p>
  
  <form class="contact-form" method="POST" action="/contact">
    
    <!-- Stakeholder Type Selector -->
    <div class="form-group">
      <label for="stakeholder-type">Vous êtes… *</label>
      <select id="stakeholder-type" name="type" required>
        <option value="">Sélectionnez votre profil</option>
        <option value="partner">Partenaire industriel</option>
        <option value="researcher">Chercheur / Académique</option>
        <option value="media">Presse / Média</option>
        <option value="investor">Investisseur / Fonds</option>
        <option value="entrepreneur">Entrepreneur e-commerce</option>
        <option value="other">Autre</option>
      </select>
    </div>
    
    <!-- Name -->
    <div class="form-group">
      <label for="name">Nom complet *</label>
      <input type="text" id="name" name="name" required>
    </div>
    
    <!-- Email -->
    <div class="form-group">
      <label for="email">Email *</label>
      <input type="email" id="email" name="email" required>
    </div>
    
    <!-- Company (Optional) -->
    <div class="form-group">
      <label for="company">Entreprise / Organisation</label>
      <input type="text" id="company" name="company">
    </div>
    
    <!-- Message -->
    <div class="form-group">
      <label for="message">Votre message *</label>
      <textarea id="message" name="message" rows="6" required 
        placeholder="Décrivez brièvement votre projet ou question..."></textarea>
    </div>
    
    <!-- Privacy Note -->
    <p class="privacy-note">
      🔒 Vos données ne seront jamais partagées. 
      Nous répondons sous 24-48h ouvrées.
    </p>
    
    <!-- Submit -->
    <button type="submit" class="submit-btn">
      Envoyer le message
    </button>
  </form>
  
  <!-- Alternative Contact Methods -->
  <div class="contact-alternatives">
    <p class="alt-intro">Ou contactez-nous directement :</p>
    <ul class="contact-list">
      <li>
        <strong>Email</strong>: contact@zedcheckout.com
      </li>
      <li>
        <strong>LinkedIn</strong>: 
        <a href="https://linkedin.com/in/romain-piveteau" target="_blank">
          Romain Piveteau
        </a>
      </li>
      <!-- If applicable -->
      <li>
        <strong>Presse</strong>: presse@zedcheckout.com
      </li>
    </ul>
  </div>
</section>
```

**Form Behavior:**
- Stakeholder type selector helps route inquiries internally
- Can trigger different email templates or CRM tags
- Privacy note reduces form anxiety
- Mobile: Single-column, 48px minimum field height

---

### PHASE 2: New Pages/Sections

#### Page 1: /collaborations (Partnership Models)

**File:** `collaborations.html` or equivalent routing

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <title>Collaborations — ZED TECH</title>
  <!-- Meta, styles, etc. -->
</head>
<body>
  
  <main class="collaborations-page">
    <header class="page-header">
      <h1>Comment travailler avec ZED TECH</h1>
      <p class="page-intro">
        En tant que lab de recherche indépendant, nous explorons 
        plusieurs modèles de collaboration pour transformer 
        nos découvertes en solutions concrètes.
      </p>
    </header>
    
    <!-- Model 1: Collaborative Research -->
    <section class="collab-model">
      <div class="model-icon">🔬</div>
      <h2>Recherche collaborative</h2>
      
      <p class="model-description">
        Vous avez un défi e-commerce complexe lié à l'expérience client, 
        l'IA conversationnelle, ou l'optimisation du parcours d'achat ? 
        Nous pouvons co-développer une solution sur mesure basée sur nos 10,950h de R&D.
      </p>
      
      <div class="model-details">
        <h3>Comment ça fonctionne</h3>
        <ol>
          <li>
            <strong>Phase découverte (2 semaines)</strong>  
            Audit de votre tunnel actuel, identification des points de friction
          </li>
          <li>
            <strong>Co-conception (4-6 semaines)</strong>  
            Développement d'un prototype fonctionnel avec vos équipes
          </li>
          <li>
            <strong>Tests & itération (4 semaines)</strong>  
            A/B testing, ajustements basés sur données réelles
          </li>
          <li>
            <strong>Déploiement & suivi</strong>  
            Intégration finale, formation équipe, monitoring
          </li>
        </ol>
      </div>
      
      <div class="model-example">
        <h3>Exemple de projet type</h3>
        <p>
          Un site e-commerce dans le coaching fitness souhaitait 
          réduire l'abandon au paiement. Après analyse, nous avons 
          identifié que les clients hésitaient sur le choix de formule.
        </p>
        <p>
          <strong>Solution développée</strong> : Interface conversationnelle 
          qui pose 3 questions ciblées pour recommander la formule adaptée 
          avant le paiement.
        </p>
        <p>
          <strong>Durée</strong> : 12 semaines · 
          <strong>Résultat</strong> : Réduction mesurable de l'abandon 
          (détails sous NDA)
        </p>
      </div>
      
      <a href="#contact" class="cta-btn">Discuter d'un projet de recherche →</a>
    </section>
    
    <!-- Model 2: Strategic Consulting -->
    <section class="collab-model">
      <div class="model-icon">💡</div>
      <h2>Conseil stratégique</h2>
      
      <p class="model-description">
        Vous voulez un regard expert sur votre tunnel d'achat actuel, 
        sans nécessairement engager un projet de développement complet.
      </p>
      
      <div class="model-details">
        <h3>Format type</h3>
        <ul>
          <li>
            <strong>Audit UX/UI du checkout</strong>  
            Analyse heuristique + comparaison avec best practices
          </li>
          <li>
            <strong>Recommandations priorisées</strong>  
            Quick wins (implémentables en 48h) vs. optimisations long-terme
          </li>
          <li>
            <strong>Session stratégique (2-3h)</strong>  
            Présentation des findings + Q&A avec vos équipes
          </li>
        </ul>
      </div>
      
      <p class="model-pricing">
        <strong>Tarif indicatif</strong> : Mission ponctuelle, 
        devis sur mesure selon périmètre.
      </p>
      
      <a href="#contact" class="cta-btn">Demander un audit →</a>
    </section>
    
    <!-- Model 3: Technology Partnership -->
    <section class="collab-model">
      <div class="model-icon">🤝</div>
      <h2>Partenariat technologique</h2>
      
      <p class="model-description">
        Vous développez une plateforme e-commerce, un CMS, 
        ou un outil marketing et souhaitez intégrer nos solutions 
        (API, white-label, co-branding).
      </p>
      
      <div class="model-details">
        <h3>Opportunités de partenariat</h3>
        <ul>
          <li>
            <strong>Intégration ZedCheckout</strong>  
            API ou plugin natif pour votre plateforme
          </li>
          <li>
            <strong>White-label</strong>  
            Proposez notre technologie sous votre marque
          </li>
          <li>
            <strong>Co-développement</strong>  
            Créons ensemble la prochaine génération d'outils e-commerce
          </li>
        </ul>
      </div>
      
      <p class="model-note">
        <strong>Profils recherchés</strong> : Agences digitales, 
        plateformes e-commerce (Shopify, PrestaShop partenaires), 
        éditeurs SaaS marketing.
      </p>
      
      <a href="#contact" class="cta-btn">Explorer un partenariat →</a>
    </section>
    
    <!-- Model 4: Speaking & Workshops -->
    <section class="collab-model">
      <div class="model-icon">📢</div>
      <h2>Interventions & conférences</h2>
      
      <p class="model-description">
        Romain est disponible pour keynotes, workshops, podcasts 
        sur les thèmes :
      </p>
      
      <ul class="speaking-topics">
        <li>L'IA conversationnelle appliquée à l'e-commerce</li>
        <li>Psychologie du consommateur en ligne</li>
        <li>Optimisation du tunnel d'achat (au-delà de l'A/B testing)</li>
        <li>Le parcours freelance → entrepreneur tech</li>
        <li>Bootstrapping vs levée de fonds dans la tech</li>
      </ul>
      
      <p class="speaking-format">
        <strong>Formats</strong> : Conférences (30-45min), 
        workshops (2-3h), podcasts, interviews presse.
      </p>
      
      <a href="#contact" class="cta-btn">Inviter Romain à intervenir →</a>
    </section>
    
    <!-- Contact CTA -->
    <section class="page-cta">
      <h2>Votre projet ne rentre dans aucune case ?</h2>
      <p>
        Nous restons ouverts à d'autres formes de collaboration. 
        L'essentiel est l'alignement sur la vision : 
        <strong>réhumaniser l'e-commerce grâce à l'IA.</strong>
      </p>
      <a href="#contact" class="cta-btn-large">Discutons-en →</a>
    </section>
    
  </main>
  
</body>
</html>
```

**Key Points:**
- ✅ Each model describes "what", "how", and "for whom"
- ✅ Includes one real example (fitness coaching) without fake names
- ⚠️ Pricing kept vague ("devis sur mesure") — avoid inventing numbers
- ✅ Frames everything as collaborative, not transactional

**What to Ask User:**
- "Ces modèles de collaboration correspondent-ils à ta vision ?"
- "Y a-t-il des formats que tu refuses ou des profils que tu ne veux pas attirer ?"
- "Veux-tu mentionner des partenaires existants (s'il y en a) ?"

---

#### Page 2: /presse (Media Kit)

**File:** `presse.html` or `/media-kit`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <title>Presse & Média — ZED TECH</title>
</head>
<body>
  
  <main class="media-kit">
    <header class="page-header">
      <h1>Dossier de presse</h1>
      <p class="page-intro">
        Ressources pour journalistes, podcasters, et médias 
        souhaitant couvrir ZED TECH ou interviewer Romain Piveteau.
      </p>
    </header>
    
    <!-- Quick Facts -->
    <section class="quick-facts">
      <h2>En bref</h2>
      <ul class="facts-list">
        <li>
          <strong>ZED TECH</strong> : Lab de recherche e-commerce indépendant 
          basé en France
        </li>
        <li>
          <strong>Fondé</strong> : 2015 (lancement officiel produits : 2025-2026)
        </li>
        <li>
          <strong>R&D cumulée</strong> : 10,950 heures d'analyse 
          comportements d'achat
        </li>
        <li>
          <strong>Positionnement</strong> : L'IA conversationnelle 
          au service de l'expérience client e-commerce
        </li>
        <li>
          <strong>Première solution commerciale</strong> : ZedCheckout 
          (checkout conversationnel, launch janvier 2026)
        </li>
        <li>
          <strong>Communauté</strong> : 12K+ followers LinkedIn 
          (thought leadership e-commerce)
        </li>
      </ul>
    </section>
    
    <!-- Founder Bio (3rd person) -->
    <section class="founder-bio-media">
      <h2>Biographie — Romain Piveteau</h2>
      
      <div class="bio-short">
        <h3>Version courte (1 paragraphe)</h3>
        <p class="copyable-text">
          Romain Piveteau est le fondateur de ZED TECH, un lab de recherche 
          indépendant dédié à l'amélioration de l'expérience e-commerce 
          via l'IA conversationnelle. Ancien charpentier reconverti 
          en développeur full-stack, il a passé 10 ans en freelance 
          avant de consacrer 10,950 heures à analyser les comportements 
          d'achat en ligne. Sa conviction : l'IA peut réhumaniser 
          l'e-commerce plutôt que de le robotiser. ZED TECH lance 
          sa première solution commerciale, ZedCheckout, en janvier 2026.
        </p>
        <button class="copy-btn" data-copy="bio-short">Copier le texte</button>
      </div>
      
      <div class="bio-long">
        <h3>Version longue (3 paragraphes)</h3>
        <p class="copyable-text">
          Romain Piveteau a un parcours atypique : formé comme charpentier 
          traditionnel, il se reconvertit dans le développement web 
          après avoir découvert que les deux métiers partagent une 
          philosophie commune : résoudre des problèmes complexes avec 
          des solutions élégantes et durables.
        </p>
        <p class="copyable-text">
          Pendant 10 ans, il travaille en freelance sur des projets 
          e-commerce (coaching, fitness, artisanat) et observe un 
          pattern récurrent : 60-70% d'abandons au moment du paiement. 
          Plutôt que de multiplier les A/B tests cosmétiques, il décide 
          d'étudier le problème en profondeur. En 2015, il fonde ZED TECH 
          comme lab de recherche indépendant.
        </p>
        <p class="copyable-text">
          Après 10,950 heures de R&D, ZED TECH lance ZedCheckout en 2026 : 
          un checkout conversationnel qui remplace les formulaires rigides 
          par un dialogue naturel. L'objectif ? Réhumaniser l'e-commerce 
          en utilisant l'IA comme amplificateur d'empathie, pas comme 
          automate. Romain partage régulièrement ses recherches sur LinkedIn 
          (12K+ followers) et explore de nouveaux axes de recherche en 
          parallèle.
        </p>
        <button class="copy-btn" data-copy="bio-long">Copier le texte</button>
      </div>
    </section>
    
    <!-- Key Messages / Soundbites -->
    <section class="soundbites">
      <h2>Citations clés</h2>
      <p class="section-note">
        Extraits utilisables pour articles, tweets, ou mentions médias :
      </p>
      
      <blockquote class="soundbite">
        "Vos clients ne sont pas des taux de conversion. 
        Ce sont des humains avec des questions, des doutes, des contextes."
        <cite>— Romain Piveteau, fondateur ZED TECH</cite>
      </blockquote>
      
      <blockquote class="soundbite">
        "Le checkout est devenu le goulot d'étranglement de l'e-commerce moderne. 
        On demande trop d'informations, trop vite, sans contexte. 
        L'abandon n'est pas un bug, c'est une réaction logique."
        <cite>— Romain Piveteau</cite>
      </blockquote>
      
      <blockquote class="soundbite">
        "L'IA peut réhumaniser l'e-commerce si on l'utilise pour poser 
        les bonnes questions, pas pour automatiser les mauvaises réponses."
        <cite>— Romain Piveteau</cite>
      </blockquote>
      
      <blockquote class="soundbite">
        "J'ai passé 8 mois à développer la mauvaise solution. 
        Le déclic : comprendre que le problème n'était pas la vitesse 
        des ascenseurs, mais la perception du temps."
        <cite>— Romain Piveteau (référence à l'analogie des miroirs en ascenseur)</cite>
      </blockquote>
    </section>
    
    <!-- Media Assets -->
    <section class="media-assets">
      <h2>Assets téléchargeables</h2>
      
      <div class="asset-grid">
        
        <!-- Founder Photo -->
        <div class="asset-item">
          <div class="asset-preview">
            <!-- PLACEHOLDER: Wait for real photo -->
            <div class="placeholder">
              <p>Photo haute résolution à venir</p>
            </div>
          </div>
          <div class="asset-details">
            <h3>Photo fondateur (haute résolution)</h3>
            <p>Romain Piveteau, fondateur ZED TECH</p>
            <p class="asset-meta">Format : JPG · Résolution : 300dpi</p>
            <button class="download-btn" disabled>
              Disponible prochainement
            </button>
          </div>
        </div>
        
        <!-- Logo Pack -->
        <div class="asset-item">
          <div class="asset-preview">
            <!-- Show actual logo if available -->
            <div class="placeholder">
              <p>Logo ZED TECH</p>
            </div>
          </div>
          <div class="asset-details">
            <h3>Pack logo</h3>
            <p>Versions PNG, SVG (couleur, noir, blanc)</p>
            <p class="asset-meta">
              Formats : PNG, SVG · Fond transparent
            </p>
            <button class="download-btn">
              Télécharger (ZIP)
            </button>
          </div>
        </div>
        
        <!-- One-pager -->
        <div class="asset-item">
          <div class="asset-preview">
            <div class="placeholder">
              <p>One-pager ZED TECH</p>
            </div>
          </div>
          <div class="asset-details">
            <h3>One-pager (PDF)</h3>
            <p>Présentation synthétique pour médias</p>
            <p class="asset-meta">1 page A4 · Format PDF</p>
            <button class="download-btn">
              Télécharger PDF
            </button>
          </div>
        </div>
        
      </div>
    </section>
    
    <!-- Past Media Appearances -->
    <section class="media-mentions">
      <h2>Couverture médiatique</h2>
      
      <!-- IF there are mentions, list them. OTHERWISE: -->
      <p class="no-mentions">
        Aucune mention média référencée pour le moment. 
        Vous souhaitez être le premier à couvrir ZED TECH ?
      </p>
      
      <!-- EXAMPLE structure when mentions exist:
      <ul class="mentions-list">
        <li>
          <span class="mention-date">Décembre 2025</span>
          <a href="#" target="_blank">
            "L'IA qui réhumanise l'e-commerce" — [Nom Publication]
          </a>
        </li>
      </ul>
      -->
    </section>
    
    <!-- Contact Media -->
    <section class="media-contact">
      <h2>Contact presse</h2>
      
      <div class="contact-details">
        <p>
          <strong>Email</strong>: presse@zedcheckout.com<br>
          <strong>LinkedIn</strong>: 
          <a href="https://linkedin.com/in/romain-piveteau" target="_blank">
            Romain Piveteau
          </a>
        </p>
        
        <p class="response-time">
          Nous répondons aux demandes presse sous 24h ouvrées.
        </p>
      </div>
      
      <div class="interview-topics">
        <h3>Sujets d'interview possibles</h3>
        <ul>
          <li>L'IA conversationnelle appliquée à l'e-commerce</li>
          <li>Psychologie du consommateur en ligne</li>
          <li>Optimisation du tunnel d'achat (au-delà de l'A/B testing)</li>
          <li>Parcours freelance → entrepreneur tech</li>
          <li>Bootstrapping dans la deeptech</li>
          <li>L'analogie des miroirs d'ascenseur appliquée au digital</li>
        </ul>
      </div>
    </section>
    
  </main>
  
</body>
</html>
```

**Key Points:**
- ✅ Provides copy-pasteable bio in 3rd person (journalists love this)
- ✅ Quotable soundbites for easy citation
- ⏸️ Photo/logo assets ready to add when available
- ✅ Dedicated presse@ email for prioritization
- ❌ Don't invent past media mentions — be honest if none yet

**What to Ask User:**
- "Y a-t-il déjà eu des mentions médias (podcasts, articles, interviews) ?"
- "Veux-tu créer presse@zedcheckout.com ou utiliser contact@zedcheckout.com ?"
- "As-tu une photo professionnelle haute résolution ? Sinon, planifies-tu d'en faire une ?"

---

#### Page 3: /recherches or /insights (Research Hub)

**Purpose:** Ongoing content hub for thought leadership

**Structure:**

```html
<main class="research-hub">
  <header class="page-header">
    <h1>Recherches & Insights</h1>
    <p class="page-intro">
      Découvrez nos analyses, études de cas, et réflexions 
      sur l'évolution de l'e-commerce et de l'expérience client.
    </p>
  </header>
  
  <!-- Featured Article -->
  <section class="featured-article">
    <span class="article-tag">Dernière publication</span>
    <h2>
      <a href="/insights/miroirs-ascenseurs-analogie">
        L'analogie des miroirs d'ascenseur : 
        pourquoi le problème n'est jamais celui qu'on croit
      </a>
    </h2>
    <p class="article-excerpt">
      Dans les années 1950, un immeuble new-yorkais fait face 
      à des plaintes récurrentes : les ascenseurs sont trop lents. 
      La solution adoptée ? Ne pas changer les ascenseurs, 
      mais installer des miroirs dans les halls...
    </p>
    <div class="article-meta">
      <span class="author">Par Romain Piveteau</span> · 
      <span class="date">Décembre 2024</span> · 
      <span class="read-time">8 min de lecture</span>
    </div>
    <a href="/insights/miroirs-ascenseurs-analogie" class="read-more">
      Lire l'article complet →
    </a>
  </section>
  
  <!-- Article Grid -->
  <section class="articles-grid">
    
    <!-- Article Card Example -->
    <article class="article-card">
      <span class="article-tag">Étude de cas</span>
      <h3>
        <a href="/insights/coaching-fitness-abandon">
          Comment un site de coaching fitness a réduit 
          l'abandon au paiement
        </a>
      </h3>
      <p class="article-excerpt">
        Analyse d'un cas réel : de 6.49% à 8.01% de conversion 
        en 8 semaines — sans changer le design du site.
      </p>
      <div class="article-meta">
        <span class="date">Novembre 2024</span> · 
        <span class="read-time">12 min</span>
      </div>
    </article>
    
    <!-- More article cards... -->
    
    <article class="article-card coming-soon">
      <span class="article-tag">À venir</span>
      <h3>Pourquoi Shopify limite les customisations checkout</h3>
      <p class="article-excerpt">
        Comprendre les contraintes techniques et commerciales 
        qui ont poussé Shopify à restreindre le checkout.liquid.
      </p>
      <div class="article-meta">
        <span class="date">Publication prévue : Janvier 2025</span>
      </div>
    </article>
    
  </section>
  
  <!-- Newsletter CTA (Optional) -->
  <section class="newsletter-cta">
    <h2>Recevoir nos recherches par email</h2>
    <p>
      Une à deux publications par mois. Pas de spam, 
      désinscription en un clic.
    </p>
    <form class="newsletter-form">
      <input type="email" placeholder="votre@email.com" required>
      <button type="submit">S'abonner</button>
    </form>
  </section>
  
</main>
```

**Implementation Notes:**
- Start with 1-2 real articles (can repurpose the "8 mois" story as first post)
- Add "coming soon" cards for future topics to show momentum
- Consider integrating Medium, LinkedIn articles, or dedicated blog platform
- Each article should be SEO-optimized with proper meta tags

**What to Ask User:**
- "Veux-tu héberger les articles directement sur zedcheckout.com ou utiliser Medium/LinkedIn + rediriger ?"
- "As-tu déjà des articles/posts LinkedIn qui pourraient être reformatés comme premiers contenus ?"
- "Veux-tu un système de newsletter (Substack, ConvertKit, etc.) ?"

---

### PHASE 3: Design System & Style Guide

#### Typography

```css
/* Base Typography */
:root {
  /* Font Families */
  --font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px - MINIMUM for body */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base); /* 16px minimum */
  line-height: var(--leading-relaxed); /* 1.7 for comfortable reading */
  color: var(--color-text);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: var(--leading-tight);
  font-weight: 600;
}

h1 { font-size: var(--text-5xl); } /* 48px */
h2 { font-size: var(--text-3xl); } /* 30px */
h3 { font-size: var(--text-2xl); } /* 24px */

/* Mobile Responsive */
@media (max-width: 768px) {
  h1 { font-size: var(--text-4xl); } /* 36px on mobile */
  h2 { font-size: var(--text-2xl); } /* 24px on mobile */
  h3 { font-size: var(--text-xl); }  /* 20px on mobile */
}
```

#### Color Palette

```css
:root {
  /* Primary Colors (Adjust to match brand) */
  --color-primary: #1a365d;      /* Deep blue - trust, intelligence */
  --color-primary-light: #2d4a7c;
  --color-primary-dark: #0f2744;
  
  /* Accent */
  --color-accent: #0ea5e9;       /* Electric blue - innovation */
  --color-accent-light: #38bdf8;
  
  /* Neutrals */
  --color-white: #ffffff;
  --color-grey-50: #f9fafb;
  --color-grey-100: #f3f4f6;
  --color-grey-200: #e5e7eb;
  --color-grey-300: #d1d5db;
  --color-grey-600: #4b5563;
  --color-grey-900: #111827;
  
  /* Text */
  --color-text: var(--color-grey-900);
  --color-text-light: var(--color-grey-600);
  
  /* Backgrounds */
  --color-bg: var(--color-white);
  --color-bg-subtle: var(--color-grey-50);
  
  /* Borders */
  --color-border: var(--color-grey-200);
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    --color-bg-subtle: #1e293b;
    --color-text: #f1f5f9;
    --color-text-light: #cbd5e1;
    --color-border: #334155;
  }
}
```

#### Spacing & Layout

```css
:root {
  /* Spacing Scale (8px base) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-24: 6rem;    /* 96px */
  --space-32: 8rem;    /* 128px */
  
  /* Container Widths */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
}

.container {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

section {
  padding: var(--space-16) 0; /* 64px vertical spacing */
}

@media (max-width: 768px) {
  section {
    padding: var(--space-12) 0; /* 48px on mobile */
  }
}
```

#### Buttons & CTAs

```css
/* Primary Button */
.btn-primary {
  display: inline-block;
  padding: var(--space-3) var(--space-6); /* 12px 24px */
  background: var(--color-accent);
  color: var(--color-white);
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  
  /* Minimum touch target: 44x44px */
  min-height: 44px;
  min-width: 44px;
}

.btn-primary:hover {
  background: var(--color-accent-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

/* Secondary Button */
.btn-secondary {
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 44px;
  min-width: 44px;
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: var(--color-white);
}

/* Text Link */
.link {
  color: var(--color-accent);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.link:hover {
  border-bottom-color: var(--color-accent);
}
```

#### Forms

```css
/* Form Group */
.form-group {
  margin-bottom: var(--space-6);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text);
}

/* Input Fields */
input[type="text"],
input[type="email"],
select,
textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4); /* 12px 16px */
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: var(--text-base);
  font-family: inherit;
  transition: border-color 0.2s ease;
  
  /* Mobile: 48px minimum height for touch */
  min-height: 48px;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

/* Error State */
.form-group.error input,
.form-group.error select,
.form-group.error textarea {
  border-color: #ef4444;
}

.form-group .error-message {
  display: block;
  margin-top: var(--space-2);
  color: #ef4444;
  font-size: var(--text-sm);
}
```

#### Cards

```css
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-8);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.card h3 {
  margin-top: 0;
  margin-bottom: var(--space-4);
}

.card p {
  color: var(--color-text-light);
  margin-bottom: var(--space-6);
}
```

#### Animations

```css
/* Subtle fade-in on scroll (use Intersection Observer) */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Pulse animation for CTAs (use sparingly) */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(14, 165, 233, 0);
  }
}

.btn-primary.pulse {
  animation: pulse 2s infinite;
}
```

---

### PHASE 4: Technical Implementation Notes

#### Mobile Optimization Checklist

```markdown
✅ Viewport meta tag:
<meta name="viewport" content="width=device-width, initial-scale=1.0">

✅ Responsive images:
<img srcset="image-small.jpg 480w, image-large.jpg 1200w" 
     sizes="(max-width: 768px) 480px, 1200px"
     src="image-large.jpg" alt="Description">

✅ Touch targets:
- Minimum 44x44px for all clickable elements
- 8px spacing between adjacent buttons

✅ Font sizes:
- Body text: 16px minimum (never 14px on mobile)
- Line height: 1.5-1.7 for body text

✅ Form optimization:
- Single column layout on mobile
- Appropriate input types (email, tel, url)
- Large submit buttons (full-width okay on mobile)

✅ Navigation:
- Hamburger menu for mobile (if >5 nav items)
- Sticky nav optional but helpful for long pages
- Clear "close" button in mobile menus

✅ Performance:
- Lazy load images below fold
- Minify CSS/JS
- Use modern image formats (WebP with fallback)
- Target <3s load time on 3G
```

#### SEO Basics

```html
<!-- Essential Meta Tags -->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <title>ZED TECH — Lab de recherche e-commerce | IA conversationnelle</title>
  <meta name="description" content="Lab de recherche indépendant spécialisé dans l'optimisation de l'expérience e-commerce via l'IA conversationnelle. 10,950h de R&D sur le comportement d'achat en ligne.">
  
  <!-- Open Graph (LinkedIn, Facebook) -->
  <meta property="og:title" content="ZED TECH — L'IA qui réhumanise l'e-commerce">
  <meta property="og:description" content="10,950 heures de R&D pour transformer le checkout en conversation naturelle.">
  <meta property="og:image" content="https://www.zedcheckout.com/og-image.jpg">
  <meta property="og:url" content="https://www.zedcheckout.com">
  <meta property="og:type" content="website">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="ZED TECH — L'IA qui réhumanise l'e-commerce">
  <meta name="twitter:description" content="Lab de recherche e-commerce indépendant. Découvrez comment l'IA conversationnelle peut transformer votre tunnel d'achat.">
  <meta name="twitter:image" content="https://www.zedcheckout.com/twitter-image.jpg">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://www.zedcheckout.com">
  
  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ZED TECH",
    "url": "https://www.zedcheckout.com",
    "logo": "https://www.zedcheckout.com/logo.png",
    "description": "Lab de recherche e-commerce indépendant spécialisé dans l'IA conversationnelle",
    "foundingDate": "2015",
    "founder": {
      "@type": "Person",
      "name": "Romain Piveteau",
      "jobTitle": "Fondateur",
      "sameAs": "https://linkedin.com/in/romain-piveteau"
    },
    "sameAs": [
      "https://linkedin.com/company/zedtech",
      "https://linkedin.com/in/romain-piveteau"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "contact@zedcheckout.com"
    }
  }
  </script>
</head>
```

#### Analytics Setup

```html
<!-- Google Analytics 4 (Replace with real tracking ID) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
  
  // Custom event: Stakeholder type selection
  function trackStakeholderSelection(type) {
    gtag('event', 'stakeholder_selection', {
      'stakeholder_type': type
    });
  }
  
  // Custom event: Contact form submission
  function trackContactSubmit(type) {
    gtag('event', 'contact_form_submit', {
      'form_type': type
    });
  }
</script>

<!-- Hotjar (optional, for heatmaps) -->
<!-- Add Hotjar tracking code here when ready -->
```

---

### PHASE 5: Content Migration Checklist

**From Current Site → New Multi-Stakeholder Structure**

```markdown
✅ Homepage:
[ ] Keep hero headline
[ ] Add "Lab de recherche e-commerce indépendant" positioning
[ ] Add stakeholder segmentation section after hero
[ ] Move founder bio UP (before 8 mois story)
[ ] Keep problem statement as-is
[ ] Keep 8 mois story (add progressive disclosure for mobile)
[ ] Keep philosophy section (add pull quotes for rhythm)
[ ] Add new "Research Outputs" section (ZedCheckout + future directions)
[ ] Replace generic contact form with segmented version

✅ New Pages to Create:
[ ] /collaborations — Partnership models
[ ] /presse — Media kit
[ ] /recherches — Research hub (start with 1-2 articles)

✅ SEO & Meta:
[ ] Update all meta descriptions
[ ] Add structured data (JSON-LD)
[ ] Create og:image (1200x630px)
[ ] Submit sitemap to Google Search Console

✅ Assets Needed:
[ ] Professional founder photo (high-res)
[ ] Logo pack (PNG, SVG, various sizes)
[ ] OG image for social sharing
[ ] One-pager PDF for media

✅ Technical:
[ ] Set up contact@ email
[ ] Set up presse@ email (or alias)
[ ] Configure form backend (submission handling)
[ ] Set up analytics tracking
[ ] Test mobile experience on real devices
[ ] Run Lighthouse audit (target 90+ scores)
```

---

## FINAL REMINDERS FOR IMPLEMENTATION

### ✅ DO THIS:

1. **Start with Phase 1** (homepage restructuring) — highest impact
2. **Use real data only** — if uncertain, ask user
3. **Keep authentic voice** — Romain's first-person in personal sections
4. **Test on mobile first** — 60%+ traffic will be mobile
5. **Ask questions when stuck** — better to clarify than invent

### ❌ NEVER DO THIS:

1. **Never mention "LittleBiceps"** or any fake client names
2. **Never invent stats** — "43% increase" requires proof
3. **Never use generic stock photos** — wait for real photos
4. **Never dilute the research positioning** — ZED TECH is a LAB, not an agency
5. **Never create fake testimonials** — authenticity > social proof

---

## QUESTIONS TO ASK USER BEFORE PROCEEDING

Before implementing, confirm:

1. **Collaborations page:**
   - "Les 4 modèles de collaboration proposés (Recherche collaborative, Conseil, Partenariat tech, Speaking) correspondent-ils à ta vision ?"
   - "Y a-t-il des formats que tu refuses ou des profils que tu ne veux pas attirer ?"

2. **Founder bio enhancement:**
   - "Peux-tu partager plus de détails sur ton parcours freelance ? (secteurs, taille projets, technologies)"
   - "Veux-tu mentionner des entreprises/clients passés (de façon générique) ?"

3. **Research directions:**
   - "Les axes de recherche futurs mentionnés (post-purchase, recommandations, SAV) sont-ils alignés avec ta vision ?"

4. **Media kit:**
   - "Y a-t-il déjà eu des mentions médias à référencer ?"
   - "As-tu une photo professionnelle haute résolution ? Sinon, planifies-tu d'en faire une ?"
   - "Veux-tu créer presse@zedcheckout.com ou utiliser contact@zedcheckout.com ?"

5. **Research hub:**
   - "Veux-tu héberger les articles directement sur zedcheckout.com ou utiliser Medium/LinkedIn + rediriger ?"
   - "As-tu déjà des articles/posts LinkedIn qui pourraient être reformatés ?"
   - "Veux-tu un système de newsletter ?"

6. **Numbers verification:**
   - "10,950 heures de R&D : peux-tu me confirmer ce chiffre et idéalement me donner la répartition (dev, tests, analyse) ?"
   - "12K followers LinkedIn : est-ce exact ?"
   - "Y a-t-il d'autres métriques réelles que je peux utiliser ?"

---

## SUCCESS METRICS (Post-Implementation)

Track these to validate the transformation:

**Stakeholder Engagement:**
- % of visitors using stakeholder segmentation
- Most popular stakeholder pathway
- Time spent by stakeholder type

**Contact Quality:**
- % of contacts from "Partner" vs "Other"
- Response time to different stakeholder types
- Conversion from contact → collaboration

**Thought Leadership:**
- LinkedIn shares of research articles
- Media inquiries received
- Speaking/interview requests

**Overall:**
- Bounce rate (target: <60%)
- Avg. session duration (target: 3+ min)
- Mobile vs. desktop engagement parity

---

This prompt is comprehensive and preserves authenticity while providing clear implementation guidance. Let me know if you need any section expanded or clarified!
