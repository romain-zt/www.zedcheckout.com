'use server';

import nodemailer from 'nodemailer';

export type QuizData = {
  [key: string]: any;
};

export type QuizAnalysis = {
  expertiseLevel: 'debutant' | 'intermediaire' | 'avance';
  frustrationLevel: 'hot_hot_hot' | 'hot' | 'warm';
  fitScore: 'golden_lead' | 'perfect_fit' | 'good_fit' | 'low_fit';
  score: number;
  satisfactionScore: number;
  frustrationText: string;
};

export type ServerActionResponse<T> = {
  isSuccess: boolean;
  data: T | null;
  message: string;
};

function generateUserEmailHTML(
  firstName: string,
  quizData: QuizData,
  analysis: QuizAnalysis
): string {
  // Determine content based on analysis
  let resultTitle = '';
  let resultEmoji = '';
  let resultMessage = '';
  let recommendations = '';
  let ctaButton = '';
  let ctaMessage = '';

  const isHotLead = analysis.frustrationLevel === 'hot_hot_hot' || analysis.frustrationLevel === 'hot';
  const isFit = analysis.fitScore === 'golden_lead' || analysis.fitScore === 'perfect_fit' || analysis.fitScore === 'good_fit';
  const showAuditCTA = isHotLead && isFit;

  // Determine result based on expertise and frustration
  if (quizData.q10?.includes('Moins de €50K')) {
    resultEmoji = '🎯';
    resultTitle = 'Débutant - Score: 20/100';
    resultMessage = 'Bonne nouvelle: Vous avez 80 points de progression possible !';
    recommendations = `
      <li style="margin-bottom: 12px; color: #374151;">❌ Analytics checkout non configuré</li>
      <li style="margin-bottom: 12px; color: #374151;">❌ Pas de tracking événements</li>
      <li style="margin-bottom: 12px; color: #374151;">❌ Pas d'A/B testing</li>
    `;
    ctaMessage = 'Commencez par installer les analytics essentiels pour comprendre vos pertes.';
  } else if (analysis.expertiseLevel === 'avance' && analysis.frustrationLevel === 'hot_hot_hot') {
    resultEmoji = '🔥';
    resultTitle = `Avancé frustré - Score: ${analysis.score}/100`;
    resultMessage = 'Vous êtes bon... mais votre plateforme vous limite.';
    recommendations = `
      <li style="margin-bottom: 12px; color: #374151;">✅ Analytics + tracking OK</li>
      <li style="margin-bottom: 12px; color: #374151;">✅ Process optimisation en place</li>
      <li style="margin-bottom: 12px; color: #374151;">❌ Plateforme trop restrictive (score ${analysis.satisfactionScore}/5)</li>
      <li style="margin-bottom: 12px; color: #374151;">❌ Impossible de tester vos idées</li>
    `;
    ctaMessage = 'Vous avez le potentiel pour débloquer +20-40% de conversions. Parlons-en.';
  } else {
    resultEmoji = '💡';
    resultTitle = `Intermédiaire - Score: ${analysis.score}/100`;
    resultMessage = 'Vous avez les bases, mais vous n\'itérez pas assez.';
    recommendations = `
      <li style="margin-bottom: 12px; color: #374151;">✅ Analytics installé</li>
      <li style="margin-bottom: 12px; color: #374151;">❌ Pas de framework A/B testing</li>
      <li style="margin-bottom: 12px; color: #374151;">❌ Optimisations ad-hoc (pas systématique)</li>
    `;
    ctaMessage = 'Mettez en place un framework systématique pour améliorer vos conversions.';
  }

  // CTA Button
  if (showAuditCTA) {
    ctaButton = `
      <div style="margin: 32px 0; text-align: center;">
        <a href="https://calendly.com/zedtech/audit-checkout" style="display: inline-block; background: #E88B7A; color: #FFFFFF; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 6px rgba(232, 139, 122, 0.3);">
          🔥 Réserver mon audit gratuit (15min) →
        </a>
        <p style="color: #6B7280; font-size: 14px; margin-top: 16px;">
          Disponible cette semaine • Places limitées
        </p>
      </div>
    `;
  } else {
    ctaButton = `
      <div style="margin: 32px 0; text-align: center;">
        <a href="mailto:${process.env.CONTACT_MAIL_ADDRESS}?subject=Demande%20d'information%20-%20Quiz%20Checkout" style="display: inline-block; background: #1E2A47; color: #FFFFFF; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px;">
          📧 Nous contacter →
        </a>
      </div>
    `;
  }

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF;">
      <div style="background: linear-gradient(135deg, #1E2A47 0%, #2D3E5F 100%); padding: 32px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 700;">
          ${resultEmoji} Votre Diagnostic Checkout
        </h1>
      </div>

      <div style="padding: 32px; background: #FFFFFF;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
          Bonjour ${firstName},
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
          Merci d'avoir pris le temps de compléter notre audit checkout. Voici votre diagnostic personnalisé :
        </p>

        <!-- Score Section -->
        <div style="background: linear-gradient(135deg, #F5EDE4 0%, #FFC9B9 100%); padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
          <h2 style="margin: 0 0 8px 0; color: #1E2A47; font-size: 24px; font-weight: 700;">
            ${resultTitle}
          </h2>
          <p style="color: #2D3E5F; font-size: 16px; margin: 0; font-weight: 500;">
            ${resultMessage}
          </p>
        </div>

        <!-- Analysis Section -->
        <div style="background: #F9FAFB; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #1E2A47; font-size: 18px; font-weight: 700;">
            📊 Votre situation actuelle
          </h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${recommendations}
          </ul>
        </div>

        ${analysis.frustrationText ? `
        <div style="background: #FFF5F0; border-left: 4px solid #E88B7A; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin: 0; color: #374151; font-size: 14px;">
            <strong>Votre principale frustration :</strong><br/>
            "${analysis.frustrationText}"
          </p>
        </div>
        ` : ''}

        <!-- Recommendation Section -->
        <div style="background: #DBEAFE; padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 2px solid #3B82F6;">
          <h3 style="margin: 0 0 12px 0; color: #1E3A8A; font-size: 18px; font-weight: 700;">
            💡 Notre recommandation
          </h3>
          <p style="color: #1E3A8A; font-size: 16px; margin: 0; line-height: 1.6;">
            ${ctaMessage}
          </p>
        </div>

        ${ctaButton}

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #E5E7EB;" />

        <div style="background: #F5EDE4; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #1E2A47; font-size: 16px; font-weight: 700;">
            📧 Besoin d'aide ?
          </h3>
          <p style="color: #374151; font-size: 14px; margin: 0 0 12px 0; line-height: 1.6;">
            Vous avez des questions sur votre diagnostic ? Notre équipe est là pour vous aider.
          </p>
          <p style="color: #374151; font-size: 14px; margin: 0;">
            <strong>Email :</strong> <a href="mailto:${process.env.CONTACT_MAIL_ADDRESS}" style="color: #E88B7A; text-decoration: none;">${process.env.CONTACT_MAIL_ADDRESS}</a>
          </p>
        </div>

        <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0;">
          À très bientôt,<br/>
          <strong style="color: #1E2A47;">L'équipe ZED TECH</strong>
        </p>
      </div>

      <div style="background: #F9FAFB; padding: 24px; text-align: center; border-top: 1px solid #E5E7EB;">
        <p style="color: #9CA3AF; font-size: 12px; margin: 0 0 8px 0;">
          © 2025 ZED TECH - Solutions de checkout optimisées
        </p>
        <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
          Vous recevez cet email car vous avez complété notre audit checkout.
        </p>
      </div>
    </div>
  `;
}

export async function submitQuizForm(
  quizData: QuizData,
  analysis: QuizAnalysis
): Promise<ServerActionResponse<boolean>> {
  const { firstName, lastName, email, phone } = quizData;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_MAIL_ADDRESS,
        pass: process.env.CONTACT_MAIL_PASSWORD,
      },
    });

    // Generate answers HTML
    let answersHtml = '';
    for (const [key, value] of Object.entries(quizData)) {
      if (key.startsWith('q') && !key.includes('followup')) {
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        answersHtml += `
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">${key}:</td>
            <td style="padding: 8px 0; color: #1E2A47;">${displayValue}</td>
          </tr>
        `;
      }
    }

    const mailOptions = {
      from: process.env.CONTACT_MAIL_ADDRESS,
      to: process.env.CONTACT_MAIL_ADDRESS,
      replyTo: email,
      subject: `[QUIZ CHECKOUT] ${firstName} ${lastName} - ${analysis.fitScore.toUpperCase()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: #1E2A47; padding: 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">
              ZED CHECKOUT - Audit Quiz
            </h1>
          </div>

          <div style="background: #FFFFFF; padding: 32px; border: 1px solid #E5E7EB;">
            <h2 style="color: #1E2A47; margin: 0 0 24px 0; font-size: 20px;">
              🎯 Nouveau Lead Qualifié
            </h2>

            <!-- Contact Information -->
            <div style="background: #F5EDE4; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px 0; color: #E88B7A; font-size: 16px;">
                👤 Informations du Contact
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Nom complet:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${firstName} ${lastName}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${email}</strong></td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Téléphone:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${phone}</strong></td>
                </tr>
                ` : ''}
              </table>
            </div>

            <!-- Analysis Results -->
            <div style="background: ${analysis.fitScore === 'golden_lead' ? '#FEF3C7' : analysis.fitScore === 'perfect_fit' ? '#DBEAFE' : '#F3F4F6'}; padding: 20px; border-radius: 8px; margin-bottom: 24px; border: 2px solid ${analysis.fitScore === 'golden_lead' ? '#F59E0B' : analysis.fitScore === 'perfect_fit' ? '#3B82F6' : '#9CA3AF'};">
              <h3 style="margin: 0 0 16px 0; color: ${analysis.fitScore === 'golden_lead' ? '#92400E' : analysis.fitScore === 'perfect_fit' ? '#1E3A8A' : '#374151'}; font-size: 18px;">
                📊 Analyse du Lead
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Score:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${analysis.score}/100</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Fit Score:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${analysis.fitScore.toUpperCase().replace(/_/g, ' ')}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Niveau d'expertise:</td>
                  <td style="padding: 8px 0; color: #1E2A47;">${analysis.expertiseLevel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Niveau de frustration:</td>
                  <td style="padding: 8px 0; color: #1E2A47;">${analysis.frustrationLevel === 'hot_hot_hot' ? '🔥🔥🔥 TRÈS CHAUD' : analysis.frustrationLevel === 'hot' ? '🔥 Chaud' : '😐 Tiède'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Satisfaction:</td>
                  <td style="padding: 8px 0; color: #1E2A47;">${analysis.satisfactionScore}/5</td>
                </tr>
                ${analysis.frustrationText ? `
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600; vertical-align: top;">Limitation principale:</td>
                  <td style="padding: 8px 0; color: #1E2A47;">${analysis.frustrationText}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <!-- Quiz Answers -->
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">
                📝 Réponses au Quiz
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${answersHtml}
              </table>
            </div>

            <div style="margin: 32px 0; text-align: center;">
              <a href="mailto:${email}" style="display: inline-block; background: #E88B7A; color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 12px;">
                Répondre au lead →
              </a>
              ${phone ? `
              <a href="tel:${phone}" style="display: inline-block; background: #1E2A47; color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Appeler →
              </a>
              ` : ''}
            </div>

            <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;" />

            <p style="color: #6B7280; font-size: 14px; margin: 0;">
              Ce lead a complété l'audit checkout en 2 minutes. Timestamp: ${new Date().toISOString()}
            </p>
          </div>

          <div style="background: #F9FAFB; padding: 16px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              ZED TECH - Quiz Qualification System
            </p>
          </div>
        </div>
      `,
    };

    // Send notification email to admin
    await transporter.sendMail(mailOptions);

    // Send results email to user
    try {
      const userMailOptions = {
        from: process.env.CONTACT_MAIL_ADDRESS,
        to: email,
        subject: `🎯 Votre diagnostic checkout personnalisé - Score: ${analysis.score}/100`,
        html: generateUserEmailHTML(firstName, quizData, analysis),
      };

      await transporter.sendMail(userMailOptions);
    } catch (userEmailError) {
      console.error('Error sending user email:', userEmailError);
      // Continue even if user email fails - admin notification was sent
    }

    return {
      isSuccess: true,
      data: true,
      message: 'Quiz soumis avec succès',
    };
  } catch (error) {
    console.error('Quiz submission error:', error);

    return {
      isSuccess: false,
      data: null,
      message: 'Erreur lors de la soumission du quiz',
    };
  }
}
