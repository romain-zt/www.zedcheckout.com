import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.zedcheckout.com';
  
  return [
    {
      url: `${baseUrl}/fr-FR`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'fr-FR': `${baseUrl}/fr-FR`,
          'en-EN': `${baseUrl}/en-EN`,
        },
      },
    },
    {
      url: `${baseUrl}/en-EN`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'fr-FR': `${baseUrl}/fr-FR`,
          'en-EN': `${baseUrl}/en-EN`,
        },
      },
    },
    {
      url: `${baseUrl}/fr-FR/landing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'fr-FR': `${baseUrl}/fr-FR/landing`,
          'en-EN': `${baseUrl}/en-EN/landing`,
        },
      },
    },
    {
      url: `${baseUrl}/en-EN/landing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'fr-FR': `${baseUrl}/fr-FR/landing`,
          'en-EN': `${baseUrl}/en-EN/landing`,
        },
      },
    },
    {
      url: `${baseUrl}/fr-FR/sales`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          'fr-FR': `${baseUrl}/fr-FR/sales`,
          'en-EN': `${baseUrl}/en-EN/sales`,
        },
      },
    },
    {
      url: `${baseUrl}/en-EN/sales`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          'fr-FR': `${baseUrl}/fr-FR/sales`,
          'en-EN': `${baseUrl}/en-EN/sales`,
        },
      },
    },
  ];
}
