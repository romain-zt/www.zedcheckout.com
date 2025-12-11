'use server';

import nodemailer from 'nodemailer';

export type LeadCaptureData = {
  firstName: string;
  email: string;
  website: string;
  platform: string;
  sector: string;
  revenue: string;
  challenge: string;
  consent: boolean;
};

export type ServerActionResponse<T> = {
  isSuccess: boolean;
  data: T | null;
  message: string;
};

// Platform display names
const platformNames: Record<string, string> = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  prestashop: 'PrestaShop',
  custom: 'Custom / Autre'
};

// Sector display names
const sectorNames: Record<string, string> = {
  coaching: 'Coaching',
  wellness: 'Bien-être',
  training: 'Formations',
  premium: 'E-commerce premium',
  other: 'Autre'
};

// Revenue display names
const revenueNames: Record<string, string> = {
  under50k: '<50K',
  '50to150k': '50-150K',
  '150to500k': '150-500K',
  over500k: '500K+',
  prefer_not_say: 'Préfère ne pas dire'
};

export async function submitLeadCapture(
  values: LeadCaptureData
): Promise<ServerActionResponse<boolean>> {
  const { firstName, email, website, platform, sector, revenue, challenge, consent } = values;

  // Check if platform is compatible (you can add filtering logic here)
  const isCompatible = platform === 'shopify'; // For now, only Shopify is compatible

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_MAIL_ADDRESS,
        pass: process.env.CONTACT_MAIL_PASSWORD,
      },
    });

    // Email to admin
    const mailOptions = {
      from: process.env.CONTACT_MAIL_ADDRESS,
      to: process.env.CONTACT_MAIL_ADDRESS,
      replyTo: email,
      subject: `[ZEDCHECKOUT LEAD] ${firstName} - ${platformNames[platform]} ${isCompatible ? '✅' : '⚠️'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${isCompatible ? '#1E2A47' : '#D97706'}; padding: 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">
              ${isCompatible ? '✅ LEAD COMPATIBLE' : '⚠️ LEAD NON-COMPATIBLE'}
            </h1>
            <p style="color: #FFFFFF; margin: 8px 0 0 0; opacity: 0.9;">
              ZedCheckout Lead Capture
            </p>
          </div>

          <div style="background: #FFFFFF; padding: 32px; border: 1px solid #E5E7EB;">
            ${!isCompatible ? `
              <div style="background: #FEF3C7; border-left: 4px solid #D97706; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                <p style="color: #92400E; font-weight: 600; margin: 0; font-size: 14px;">
                  ⚠️ Cette plateforme (${platformNames[platform]}) n'est pas actuellement compatible avec ZedCheckout.
                  <br/>
                  <strong>Action:</strong> Envoyer email "pas compatible pour l'instant, on vous tiendra au courant"
                </p>
              </div>
            ` : ''}

            <h2 style="color: #1E2A47; margin: 0 0 24px 0; font-size: 20px;">
              📋 Informations du Lead
            </h2>

            <div style="background: #F5EDE4; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px 0; color: #E88B7A; font-size: 16px;">
                👤 Contact
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600; width: 40%;">Nom:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${firstName}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${email}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Site web:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><a href="${website.startsWith('http') ? website : `https://${website}`}" target="_blank" style="color: #E88B7A;">${website}</a></td>
                </tr>
              </table>
            </div>

            <div style="background: #F5EDE4; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px 0; color: #E88B7A; font-size: 16px;">
                🛒 Setup Technique
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600; width: 40%;">Plateforme:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${platformNames[platform]}</strong> ${isCompatible ? '✅' : '❌'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Secteur:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${sectorNames[sector]}</strong></td>
                </tr>
                ${revenue ? `
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">CA annuel:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${revenueNames[revenue]}</strong></td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background: #F5EDE4; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px 0; color: #E88B7A; font-size: 16px;">
                💬 Défi Principal
              </h3>
              <p style="color: #1E2A47; margin: 0; white-space: pre-wrap; line-height: 1.6;">
                ${challenge}
              </p>
            </div>

            <div style="margin: 32px 0;">
              <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(to right, #E88B7A, #FFC9B9); color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Répondre au lead →
              </a>
            </div>

            <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;" />

            <div style="font-size: 12px; color: #6B7280;">
              <p style="margin: 0 0 8px 0;"><strong>Consentement:</strong> ${consent ? '✅ Accepté' : '❌ Non accepté'}</p>
              <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}</p>
            </div>
          </div>

          <div style="background: #F9FAFB; padding: 16px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              ZedCheckout Lead Capture System
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // If not compatible, send rejection email to user
    if (!isCompatible) {
      const userMailOptions = {
        from: process.env.CONTACT_MAIL_ADDRESS,
        to: email,
        subject: 'ZedCheckout - Incompatibilité plateforme',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1E2A47; padding: 24px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">
                ZedCheckout
              </h1>
            </div>

            <div style="background: #FFFFFF; padding: 32px; border: 1px solid #E5E7EB;">
              <h2 style="color: #1E2A47; margin: 0 0 16px 0; font-size: 20px;">
                Bonjour ${firstName},
              </h2>

              <p style="color: #1E2A47; line-height: 1.6; margin: 0 0 16px 0;">
                Merci d'avoir soumis votre candidature pour ZedCheckout.
              </p>

              <p style="color: #1E2A47; line-height: 1.6; margin: 0 0 16px 0;">
                Après analyse de votre setup technique, nous devons vous informer que <strong>${platformNames[platform]}</strong> n'est pas encore compatible avec ZedCheckout.
              </p>

              <p style="color: #1E2A47; line-height: 1.6; margin: 0 0 16px 0;">
                Nous travaillons activement à étendre notre support à d'autres plateformes. Nous vous tiendrons au courant dès que votre plateforme sera supportée.
              </p>

              <p style="color: #1E2A47; line-height: 1.6; margin: 0;">
                Bien cordialement,<br/>
                <strong>Romain Piveteau</strong><br/>
                <span style="color: #6B7280; font-size: 14px;">Fondateur, ZedCheckout</span>
              </p>
            </div>

            <div style="background: #F9FAFB; padding: 16px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                © 2025 ZedCheckout
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(userMailOptions);
    }

    return {
      isSuccess: true,
      data: true,
      message: 'Lead captured successfully',
    };
  } catch (error) {
    console.error('Lead capture error:', error);

    return {
      isSuccess: false,
      data: null,
      message: 'Error occurred',
    };
  }
}
