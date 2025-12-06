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

    await transporter.sendMail(mailOptions);

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
