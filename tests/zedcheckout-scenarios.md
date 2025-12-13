# ZedCheckout - Scénarios de Test Complets

## 🧪 Guide de Test Manuel

Ce document contient 10 scénarios de test pour valider le fonctionnement du système ZedCheckout.

---

## ✅ Scénario 1: Lead Qualifié HOT (50K-800K€ CA)

**Objectif**: Valider qu'un prospect idéal atteint l'étape de booking

**Conversation**:
```
User: "Bonjour, je cherche à améliorer mes conversions"
→ AI doit qualifier la plateforme

User: "Shopify Standard"
→ AI demande le trafic

User: "5000 visiteurs/mois"
→ AI demande le CA

User: "150K€/an"
→ AI demande la frustration

User: "Taux d'abandon 75%"
→ AI demande l'urgence

User: "Ce mois-ci"
→ AI propose un booking
```

**Résultat Attendu**:
- `funnelStage` final: `booking_proposal`
- `qualified`: `true`
- `disqualifiedReason`: `null`
- Nombre de messages total: ~15-20 (incluant les splits)
- Mention du cas client LittleBiceps
- Proposition d'audit gratuit 15min

**KPIs**:
- ✅ Progression linéaire du funnel
- ✅ Aucune question répétée
- ✅ Données correctement collectées
- ✅ Ton direct et transparent

---

## ❌ Scénario 2: Disqualification Rapide (CA trop bas)

**Objectif**: Valider la disqualification rapide si CA <50K€

**Conversation**:
```
User: "Salut, je débute en e-commerce"
→ AI: "Quelle plateforme ?"

User: "Shopify"
→ AI: "CA ?"

User: "20K€/an"
→ AI doit disqualifier poliment + proposer ressources gratuites
```

**Résultat Attendu**:
- `funnelStage` final: `disqualified`
- `qualified`: `false`
- `disqualifiedReason`: `revenue_too_low`
- Nombre de messages: **<6 messages** (disqualification rapide)
- Proposition de guide gratuit A/B Testing
- Invitation à revenir à 50K€

**KPIs**:
- ✅ Disqualification en <3 échanges
- ✅ Ton bienveillant mais ferme
- ✅ Pas de perte de temps

---

## ❌ Scénario 3: Hors-cible Plateforme

**Objectif**: Valider la disqualification immédiate si pas Shopify

**Conversation**:
```
User: "Bonjour, je suis sur WooCommerce"
→ AI doit disqualifier immédiatement
```

**Résultat Attendu**:
- `funnelStage` final: `disqualified`
- `disqualifiedReason`: `wrong_platform`
- Nombre de messages: **≤3 messages**
- Message: "On fait que Shopify actuellement"
- Proposition de garder contact si migration

**KPIs**:
- ✅ Disqualification en 1 échange
- ✅ Pas de questions supplémentaires
- ✅ Reste poli et ouvert

---

## ⚠️ Scénario 4: Objection Prix

**Objectif**: Valider la gestion de l'objection prix

**Conversation**:
```
User: "Bonjour"
→ ...progression normale jusqu'à qualification...

User: "C'est trop cher pour moi"
→ AI doit expliquer transparence pricing
```

**Réponse Attendue**:
```
Je comprends.[SPLIT]Deux options :[SPLIT]1. Shopify Standard (gratuit, limité)[SPLIT]2. Shopify Plus (€27K/an)[SPLIT]Nous = entre les deux.[SPLIT]Si votre CA est <100K€, effectivement c'est trop tôt.[SPLIT]C'est le cas ?
```

**KPIs**:
- ✅ Transparence brutale sur le pricing
- ✅ Comparaison avec alternatives
- ✅ Pas de discours commercial
- ✅ Requalification CA si nécessaire

---

## 🔄 Scénario 5: Contexte Conversationnel

**Objectif**: Valider que l'IA se souvient des infos données

**Conversation**:
```
User: "Bonjour"
→ AI: "Quelle plateforme ?"

User: "Shopify, 5000 visiteurs/mois"
→ AI doit noter trafic ET plateforme

User: "Quel était mon trafic déjà ?"
→ AI doit rappeler: "Vous m'aviez dit 5000 visiteurs/mois"
```

**Résultat Attendu**:
- L'IA cite correctement le trafic précédent
- Ne redemande PAS la plateforme
- Progresse au stage suivant (CA)

**KPIs**:
- ✅ Mémoire des 10 derniers messages
- ✅ Aucune question répétée
- ✅ Références aux infos précédentes

---

## 🚫 Scénario 6: Spam Detection

**Objectif**: Valider le scoring de spam et la réaction

**Conversation**:
```
User: "test"
User: "test"
User: "test"
User: "lol lol lol"
User: "azerty azerty"
```

**Résultat Attendu**:
- `spamScore` augmente progressivement
- `spamHistory` contient: `['test_phrase', 'message_repetition', ...]`
- Si score >70: Réponse `429` avec message "Comportement suspect"

**KPIs**:
- ✅ Détection après 3-5 messages suspects
- ✅ Pas de blocage sur faux positifs
- ✅ Message d'erreur clair

---

## 📊 Scénario 7: Données Produit Contextuelles

**Objectif**: Valider que l'IA place les données produit au bon moment

**Conversation**:
```
User: "Ça marche vraiment votre solution ?"
→ AI doit mentionner le cas client LittleBiceps

User: "Combien ça coûte ?"
→ AI doit citer: €2,490 + €49/mois + économie 1.5% transactions
```

**Résultat Attendu**:
- Cas client mentionné avec chiffres précis (6.49% → 8.01%)
- Pricing transparent avec ROI 8-15 mois
- Comparaison Shopify Plus (€27K/an)

**KPIs**:
- ✅ Données produit placées contextuellement
- ✅ Chiffres exacts
- ✅ Ton transparent (pas survente)

---

## ⏱️ Scénario 8: Urgence Assessment

**Objectif**: Valider la priorisation selon l'urgence

**Conversation**:
```
User: "Je veux optimiser ça cette semaine"
→ AI doit noter urgency = "week" et proposer booking immédiat

vs.

User: "Je regarde juste pour plus tard"
→ AI doit noter urgency = "exploring" et être moins pressant
```

**Résultat Attendu**:
- Urgence correctement détectée et stockée
- Ton adapté à l'urgence
- Booking proposé plus agressivement si urgency = "week"

**KPIs**:
- ✅ Urgence correctement catégorisée
- ✅ Adaptation du discours
- ✅ Pas de pression excessive si "exploring"

---

## 💬 Scénario 9: Message Split & Typing Delays

**Objectif**: Valider le comportement naturel du chat

**Conversation**:
```
User: "Bonjour"
```

**Résultat Attendu (Streaming)**:
```
1. event: typing_start
   → Frontend affiche "..."

2. event: message_chunk
   data: "Salut ! 👋"
   
3. event: split_signal
   data: { "typing_delay_ms": 800 }
   → Frontend affiche "..." pendant 800ms

4. event: message_chunk
   data: "Je suis l'assistant ZedCheckout."
   
5. event: split_signal
   data: { "typing_delay_ms": 1200 }

6. event: message_chunk
   data: "Vous êtes sur quelle plateforme ?"

7. event: message_complete
   → Frontend masque "..."
```

**KPIs**:
- ✅ Messages séparés en chunks <25 mots
- ✅ Délais réalistes (600-2500ms)
- ✅ Événements SSE correctement ordonnés
- ✅ Pas de buffering côté serveur

---

## 🔄 Scénario 10: Session Context Persistence

**Objectif**: Valider que le contexte persiste entre requêtes

**Requête 1**:
```json
{
  "sessionId": "test_123",
  "message": "Shopify",
  "context": null
}
```

**Réponse 1**:
```json
{
  "context": {
    "sessionId": "test_123",
    "funnelStage": "traffic_volume",
    "qualificationData": {
      "platform": "shopify"
    }
  }
}
```

**Requête 2** (même session):
```json
{
  "sessionId": "test_123",
  "message": "5000 visiteurs",
  "context": { ...contexte de la réponse 1... }
}
```

**Résultat Attendu**:
- L'IA progresse au stage `revenue_check`
- Ne redemande PAS la plateforme
- `qualificationData.trafficMonthly` = 5000

**KPIs**:
- ✅ Context correctement transmis entre requêtes
- ✅ Pas de perte de données
- ✅ Progression fluide du funnel

---

## 📈 Checklist de Validation Globale

Après avoir testé tous les scénarios, vérifier que:

### ✅ Fonctionnel
- [ ] API répond en <2s (première réponse)
- [ ] Streaming SSE fonctionne sans buffering
- [ ] Messages splittés en 2-4 chunks par réponse
- [ ] Typing delays réalistes (600-2500ms)
- [ ] Context persiste entre requêtes
- [ ] Spam detection active après 3-5 messages suspects

### ✅ Qualification
- [ ] Funnel progresse linéairement (7 étapes)
- [ ] Disqualification rapide (<3 messages) si hors-cible
- [ ] Données correctement collectées et stockées
- [ ] Lead qualifié atteint booking_proposal

### ✅ UX
- [ ] Ton direct et transparent (pas corporate)
- [ ] Aucune question répétée
- [ ] Références aux infos précédentes
- [ ] Données produit placées contextuellement
- [ ] Pas de bullshit marketing

### ✅ Technique
- [ ] Aucune erreur 500 sur requêtes valides
- [ ] Gestion propre des erreurs (API key, rate limit)
- [ ] Health check endpoint fonctionnel
- [ ] Variables d'environnement correctement lues

---

## 🚀 Test de Charge (Optionnel)

Utiliser Apache Bench pour tester la scalabilité:

```bash
# Test basique (10 requêtes, 2 concurrentes)
ab -n 10 -c 2 -p payload.json -T application/json \
   http://localhost:3000/api/zedcheckout-chat

# payload.json
{
  "sessionId": "load_test",
  "message": "Bonjour",
  "conversationHistory": [],
  "context": null
}
```

**KPIs Cibles**:
- Throughput: >5 req/sec
- P95 latency: <3s
- Error rate: <1%

---

## 📝 Rapport de Test

Après exécution, remplir ce tableau:

| Scénario | Statut | Notes | Issues |
|----------|--------|-------|--------|
| 1. Lead Qualifié HOT | ✅ / ❌ | ... | ... |
| 2. Disqualification CA | ✅ / ❌ | ... | ... |
| 3. Hors-cible Plateforme | ✅ / ❌ | ... | ... |
| 4. Objection Prix | ✅ / ❌ | ... | ... |
| 5. Contexte Conversationnel | ✅ / ❌ | ... | ... |
| 6. Spam Detection | ✅ / ❌ | ... | ... |
| 7. Données Produit | ✅ / ❌ | ... | ... |
| 8. Urgence Assessment | ✅ / ❌ | ... | ... |
| 9. Message Split | ✅ / ❌ | ... | ... |
| 10. Session Persistence | ✅ / ❌ | ... | ... |

---

**Date de validation**: ___________  
**Testeur**: ___________  
**Environnement**: Dev / Staging / Prod  
**Version**: ___________
