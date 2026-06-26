import { useEffect } from 'react';
import type { AppProps } from 'next/app';

import Layout from '@/components/layout/Layout';
import Head from '@/components/layout/Head';
import { owner, defaultTheme } from '@/data/owner';

import { PersonalityProvider } from '@/components/context/PersonalityContext';
import '@/styles/globals.css';
import '@/styles/themes.css';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const personality = localStorage.getItem('personality') || 'professional';
    const theme =
      localStorage.getItem(`theme_${personality}`) ||
      defaultTheme[personality] ||
      'github-dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-personality', personality);
  }, []);

  return (
    <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
      <title>{`${owner.name} | ${pageProps.title}`}</title>
    </Head>
    <PersonalityProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PersonalityProvider>
    </>
  );
}

export default MyApp;
