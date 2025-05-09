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
        content="dhrumil,             shukla,               dhrumil shukla,  
                 software,            engineer,             software engineer,
                 game,                developer,            game developer
                 programmer,          data,                 data engineer
                 portfolio,           developer portfolio,  ide-portfolio,
                 dhrumil engineer,    dhrumil developer,    dhrumil portfolio,
                 shukla engineer,     shukla developer,     shukla portfolio,
                 unity-portfolio,     unreal-portfolio,     vscode-portfolio,
                 unreal,              unreal,               digipen,
                 visual concepts,     nba,                  nba 2k,
                 lego 2k drive,       lego 2k               2k,
                 take-two,            taketwo"
      />
      <meta property="og:title" content="Dhrumil Shukla's Portfolio" />
      <meta
        property="og:description"
        content="A software engineer building games that you'd like to use."
      />
    </Head>
  );
};

export default CustomHead;

CustomHead.defaultProps = {
  title: 'Dhrumil Shukla',
};
