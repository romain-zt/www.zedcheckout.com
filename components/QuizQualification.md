# Quiz Qualification Component

Beautiful, educational quiz for checkout optimization qualification.

## Features

- **3-Block Structure**: Diagnostic → Frustrations → Business Qualification
- **Smart Segmentation**: Automatically scores users (Débutant/Intermédiaire/Avancé)
- **Personalized End Screens**: 3 different outcomes based on expertise & frustration
- **Smooth UX**: Framer Motion animations, progress bar, easy navigation
- **Educational Approach**: Users learn while qualifying themselves

## Usage

```tsx
import QuizQualification from '@/components/QuizQualification';

export default function Page() {
  return <QuizQualification />;
}
```

## Scoring Logic

- **Expertise Level**: Based on tools used (Q1), tracking setup (Q4), A/B testing (Q2)
- **Frustration Score**: Platform satisfaction (Q5), identified frictions (Q6)
- **Fit Score**: Complexity (Q7), revenue (Q9), platform (Q10)

## End Screens

1. **Débutant** (< €50K): Analytics guide + setup call
2. **Intermédiaire**: A/B testing framework + audit
3. **Avancé Frustré**: Personalized audit + demo (HOT LEADS 🔥)

## Demo

Visit `/quiz` to see it in action.

