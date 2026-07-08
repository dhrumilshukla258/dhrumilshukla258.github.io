import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import Layout from '@/components/layout/Layout';
import CustomHead from '@/components/layout/Head';
import { owner, defaultTheme } from '@/data/owner';

import { PersonalityProvider } from '@/components/context/PersonalityContext';
import '@/styles/globals.css';
import '@/styles/themes.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const personality = localStorage.getItem('personality') || 'professional';
    const theme =
      localStorage.getItem(`theme_${personality}`) ||
      defaultTheme[personality] ||
      'github-dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-personality', personality);
  }, []);

  const head = (
    <CustomHead
      title={pageProps.title ? `${owner.name} | ${pageProps.title}` : owner.name}
      description={pageProps.description}
      path={router.pathname === '/' ? '' : router.pathname}
    />
  );

  // Standalone printable page — skip the VS Code chrome entirely.
  if (router.pathname === '/resume') {
    return (
      <>
        {head}
        <Component {...pageProps} />
      </>
    );
  }

  return (
    <>
    {head}
    <PersonalityProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PersonalityProvider>
    </>
  );
}

export default MyApp;
