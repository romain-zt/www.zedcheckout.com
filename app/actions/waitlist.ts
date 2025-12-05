'use server';

import nodemailer from 'nodemailer';

export type WaitlistFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredOption: string;
  pageSource: 'main' | 'developers';
};

export type ServerActionResponse<T> = {
  isSuccess: boolean;
  data: T | null;
  message: string;
};

export async function submitWaitlistForm(
  values: WaitlistFormData
): Promise<ServerActionResponse<boolean>> {
  const { firstName, lastName, email, phone, preferredOption, pageSource } = values;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_MAIL_ADDRESS,
        pass: process.env.CONTACT_MAIL_PASSWORD,
      },
    });

    const fullName = `${firstName} ${lastName}`;
    
    const mailOptions = {
      from: email,
      to: process.env.CONTACT_MAIL_ADDRESS,
      subject: `[Waitlist] Nouveau contact - ${fullName}`,
      html: `
        <h2 style="color: #1E2A47; margin-bottom: 20px;">Nouvelle inscription à la waitlist</h2>

        <h3 style="margin-bottom:8px; color: #E88B7A;">👤 Informations de contact</h3>
        <div style="background: #F5EDE4; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin:0; margin-bottom: 12px;">
            <strong>Prénom:</strong> ${firstName}
          </p>
          <p style="margin:0; margin-bottom: 12px;">
            <strong>Nom:</strong> ${lastName}
          </p>
          <p style="margin:0; margin-bottom: 12px;">
            <strong>Email:</strong> ${email}
          </p>
          <p style="margin:0; margin-bottom: 12px;">
            <strong>Téléphone:</strong> ${phone}
          </p>
          <p style="margin:0; margin-bottom: 12px;">
            <strong>Formule préférée:</strong> ${preferredOption}
          </p>
          <p style="margin:0;">
            <strong>Source de la page:</strong> ${pageSource}
          </p>
        </div>

        <hr style="margin: 24px 0; border: none; border-top: 2px solid #F5EDE4;" />
        
        <p style="color: #5A5A5A; font-size: 14px;">
          Envoyé depuis le formulaire de waitlist ZED TECH
        </p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      isSuccess: true,
      data: true,
      message: 'Merci pour votre intérêt. Votre message a bien été reçu.',
    };
  } catch (error) {
    console.error('Waitlist form error:', error);

    return {
      isSuccess: false,
      data: null,
      message: 'Oups, une erreur est survenue',
    };
  }
}
