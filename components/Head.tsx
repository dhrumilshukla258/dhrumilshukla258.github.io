import Head from 'next/head';
import { owner } from '@/data/owner';

interface CustomHeadProps {
  title: string;
}

const CustomHead = ({ title }: CustomHeadProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta
        name="description"
        content={owner.tagline}
      />
      <meta name="keywords" content={owner.keywords.join(', ')} />
      <meta property="og:title" content={`${owner.name}'s Portfolio`} />
      <meta
        property="og:description"
        content={owner.description}
      />
    </Head>
  );
};

export default CustomHead;

CustomHead.defaultProps = {
  title: owner.name,
};
