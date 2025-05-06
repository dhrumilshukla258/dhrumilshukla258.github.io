import Head from 'next/head';

interface CustomHeadProps {
  title: string;
}

const CustomHead = ({ title }: CustomHeadProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta
        name="description"
        content="Dhrumil Shulka is an avid Software Engineer building game and softwares you'd love to use"
      />
      <meta
        name="keywords"
        content="dhrumil, shukla, dhrumil shukla,  
                software, engineer, software engineer,
                game, developer, game developer
                programmer, data, data engineer
                portfolio, developer portfolio, 
                dhrumil engineer, dhrumil developer, dhrumil portfolio
                shukla engineer, shulka developer, shukla portfolio
                 mern stack, unity-portfolio, unreal-portfolio, ide-portfolio, vscode-portfolio"
      />
      <meta property="og:title" content="Dhrumil Shukla's Portfolio" />
      <meta
        property="og:description"
        content="A software engineer building games that you'd like to use."
      />
      <meta property="og:image" content="https://imgur.com/4zi5KkQ.png" />
      <meta property="og:url" content="https://vscode-portfolio.vercel.app" />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
};

export default CustomHead;

CustomHead.defaultProps = {
  title: 'Dhrumil Shukla',
};
