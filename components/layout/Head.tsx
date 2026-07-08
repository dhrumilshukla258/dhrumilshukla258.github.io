import Head from 'next/head';
import { owner } from '@/data/owner';

interface CustomHeadProps {
  title?: string;
  description?: string;
  path?: string;
}

const CustomHead = ({ title = owner.name, description = owner.description, path = '' }: CustomHeadProps) => {
  const url = `https://${owner.site}${path}`;
  const imageUrl = `https://${owner.site}/og-image.png`;

  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={owner.keywords.join(', ')} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={`${owner.name}'s Portfolio`} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: owner.name,
            jobTitle: owner.title,
            url: `https://${owner.site}`,
            sameAs: [
              `https://github.com/${owner.github}`,
            ],
            worksFor: {
              '@type': 'Organization',
              name: owner.company,
            },
          }),
        }}
      />
    </Head>
  );
};

export default CustomHead;
