'use server';

import nodemailer from 'nodemailer';

export type ContactFormData = {
  firstName: string;
  website: string;
  email: string;
  phone: string;
};

export type ServerActionResponse<T> = {
  isSuccess: boolean;
  data: T | null;
  message: string;
};

export async function submitContactForm(
  values: ContactFormData
): Promise<ServerActionResponse<boolean>> {
  const { firstName, website, email, phone } = values;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_MAIL_ADDRESS,
        pass: process.env.CONTACT_MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.CONTACT_MAIL_ADDRESS,
      to: process.env.CONTACT_MAIL_ADDRESS,
      replyTo: email,
      subject: `[CONTACT] ${firstName} - ${website}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1E2A47; padding: 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">
              ZED TECH
            </h1>
          </div>

          <div style="background: #FFFFFF; padding: 32px; border: 1px solid #E5E7EB;">
            <h2 style="color: #1E2A47; margin: 0 0 24px 0; font-size: 20px;">
              🎯 Nouveau Contact
            </h2>

            <div style="background: #F5EDE4; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px 0; color: #E88B7A; font-size: 16px;">
                👤 Informations du Contact
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Prénom:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${firstName}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Site web:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><a href="${website.startsWith('http') ? website : `https://${website}`}" target="_blank" style="color: #E88B7A;">${website}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${email}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Téléphone:</td>
                  <td style="padding: 8px 0; color: #1E2A47;"><strong>${phone}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Date:</td>
                  <td style="padding: 8px 0; color: #1E2A47;">${new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 32px 0;">
              <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(to right, #E88B7A, #FFC9B9); color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Répondre au contact →
              </a>
            </div>

            <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;" />

            <p style="color: #6B7280; font-size: 14px; margin: 0;">
              Ce contact a été soumis depuis le formulaire de contact simple de ZED TECH.
            </p>
          </div>

          <div style="background: #F9FAFB; padding: 16px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              ZED TECH - Contact Form System
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      isSuccess: true,
      data: true,
      message: 'Success',
    };
  } catch (error) {
    console.error('Contact form error:', error);

    return {
      isSuccess: false,
      data: null,
      message: 'Error occurred',
    };
  }
}
