import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json();

    const {
      name,
      email,
      company,
      platform,
      monthlyRevenue,
      cartValue,
      challenge,
    } = leadData;

    // Validate required fields
    if (!name || !email || !company || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_MAIL_ADDRESS,
        pass: process.env.CONTACT_MAIL_PASSWORD,
      },
    });

    // Determine if lead is qualified (Shopify)
    const isQualified = platform.toLowerCase().includes('shopify');
    const badge = isQualified ? '✅ LEAD QUALIFIÉ' : '⚠️ LEAD NON-COMPATIBLE';
    const emoji = isQualified ? '🎯' : '❌';

    // Email to admin
    const adminMailOptions = {
      from: process.env.CONTACT_MAIL_ADDRESS,
      to: process.env.CONTACT_MAIL_ADDRESS,
      subject: `${badge} - Nouveau lead Chat Widget: ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1a1a1a;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: ${isQualified ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'};
                color: white;
                padding: 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
              }
              .badge {
                display: inline-block;
                margin-top: 12px;
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                backdrop-filter: blur(10px);
              }
              .content {
                padding: 40px 30px;
              }
              .lead-info {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 24px;
              }
              .info-row {
                display: flex;
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid #e5e7eb;
              }
              .info-row:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
              }
              .label {
                font-weight: 600;
                color: #6b7280;
                min-width: 140px;
                font-size: 14px;
              }
              .value {
                color: #1a1a1a;
                font-size: 14px;
                flex: 1;
              }
              .highlight {
                background: ${isQualified ? '#d1fae5' : '#fef3c7'};
                padding: 20px;
                border-radius: 12px;
                margin-top: 24px;
                border-left: 4px solid ${isQualified ? '#10b981' : '#f59e0b'};
              }
              .highlight p {
                margin: 0;
                font-size: 14px;
                color: #374151;
              }
              .footer {
                background: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${emoji} Nouveau Lead - Chat Widget</h1>
                <div class="badge">${badge}</div>
              </div>
              
              <div class="content">
                <div class="lead-info">
                  <div class="info-row">
                    <span class="label">👤 Nom :</span>
                    <span class="value"><strong>${name}</strong></span>
                  </div>
                  <div class="info-row">
                    <span class="label">📧 Email :</span>
                    <span class="value"><a href="mailto:${email}" style="color: #E88B7A; text-decoration: none;">${email}</a></span>
                  </div>
                  <div class="info-row">
                    <span class="label">🏢 Entreprise :</span>
                    <span class="value">${company}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">🛒 Plateforme :</span>
                    <span class="value"><strong>${platform}</strong></span>
                  </div>
                  <div class="info-row">
                    <span class="label">💰 CA mensuel :</span>
                    <span class="value">${monthlyRevenue || 'Non renseigné'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">🛍️ Panier moyen :</span>
                    <span class="value">${cartValue || 'Non renseigné'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">🎯 Défi principal :</span>
                    <span class="value">${challenge || 'Non renseigné'}</span>
                  </div>
                </div>

                <div class="highlight">
                  ${isQualified 
                    ? `<p><strong>✅ Action requise :</strong> Ce lead est sur Shopify et compatible avec ZedCheckout. Contactez-le rapidement pour booker un call de découverte !</p>`
                    : `<p><strong>⚠️ Attention :</strong> Ce lead n'est pas sur Shopify et n'est donc pas compatible actuellement. Un email automatique lui a été envoyé.</p>`
                  }
                </div>
              </div>

              <div class="footer">
                <p>Lead capturé via Chat Widget • ${new Date().toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Send admin email
    await transporter.sendMail(adminMailOptions);

    // Send auto-response to non-qualified leads
    if (!isQualified) {
      const userMailOptions = {
        from: process.env.CONTACT_MAIL_ADDRESS,
        to: email,
        subject: 'Votre candidature ZedCheckout',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #1a1a1a;
                  background-color: #f5f5f5;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 40px auto;
                  background: white;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                  background: linear-gradient(135deg, #1E2A47 0%, #2D3E5F 100%);
                  color: white;
                  padding: 40px 30px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0 0 10px 0;
                  font-size: 28px;
                  font-weight: 700;
                }
                .content {
                  padding: 40px 30px;
                }
                .content p {
                  margin-bottom: 16px;
                  font-size: 15px;
                }
                .highlight {
                  background: #fef3c7;
                  padding: 20px;
                  border-radius: 12px;
                  margin: 24px 0;
                  border-left: 4px solid #f59e0b;
                }
                .footer {
                  background: #f8f9fa;
                  padding: 30px;
                  text-align: center;
                  font-size: 14px;
                  color: #6b7280;
                }
                .signature {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #e5e7eb;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Merci ${name} 👋</h1>
                </div>
                
                <div class="content">
                  <p>Merci d'avoir pris le temps d'échanger avec notre assistant et de partager les détails de votre projet.</p>

                  <div class="highlight">
                    <p><strong>⚠️ Compatibilité plateforme</strong></p>
                    <p style="margin-bottom: 0;">Après analyse de votre configuration technique, nous devons vous informer que <strong>${platform}</strong> n'est pas encore compatible avec ZedCheckout dans sa version actuelle.</p>
                  </div>

                  <p>Nous travaillons activement à étendre notre support à d'autres plateformes e-commerce. Votre profil a été enregistré et nous vous tiendrons informé dès que votre plateforme sera supportée.</p>

                  <p>En attendant, si vous avez des questions ou souhaitez en savoir plus sur notre solution, n'hésitez pas à répondre directement à cet email.</p>

                  <div class="signature">
                    <p style="margin-bottom: 8px;"><strong>Romain Piveteau</strong></p>
                    <p style="margin: 0; color: #6b7280;">Fondateur, ZedCheckout</p>
                    <p style="margin: 4px 0 0 0; color: #6b7280;">romain@zedcheckout.com</p>
                  </div>
                </div>

                <div class="footer">
                  <p>© ${new Date().getFullYear()} ZedCheckout - Checkout conversationnel nouvelle génération</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await transporter.sendMail(userMailOptions);
    }

    return NextResponse.json({ 
      success: true,
      qualified: isQualified,
      message: isQualified 
        ? 'Lead qualifié enregistré avec succès' 
        : 'Lead enregistré. Email automatique envoyé.'
    });

  } catch (error) {
    console.error('Error processing chat lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
