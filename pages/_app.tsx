import { useEffect } from 'react';
import type { AppProps } from 'next/app';

import Layout from '@/components/Layout';
import Head from '@/components/Head';

import { PersonalityProvider } from '@/components/PersonalityContext';
import '@/styles/globals.css';
import '@/styles/themes.css';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, []);

  return (
    <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
      <title>{`Dhrumil Shukla | ${pageProps.title}`}</title>  
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
