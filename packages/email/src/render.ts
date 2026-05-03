import { render } from '@react-email/render';
import type React from 'react';

export interface RenderedEmail {
  subject: string;
  html: string;
}

export async function renderEmail(
  component: React.ReactElement,
  subject: string,
): Promise<RenderedEmail> {
  const html = await render(component);
  return { subject, html };
}
