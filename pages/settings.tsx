import ThemeInfo from '@/components/widgets/ThemeInfo';

import styles from './SettingsPage.module.css';

const SettingsPage = () => {
  return (
    <div className={styles.layout}>
      <h1 className={styles.pageTitle}>Color Theme</h1>
      <p className={styles.pageSubtitle}>Choose a theme — your selection is saved per personality.</p>
      <div className={styles.container}>
        <ThemeInfo
          name="Professional"
          icon="/themes/github-dark.png"
          publisher="Resume style"
          theme="professional"
        />
        <ThemeInfo
          name="VS Code Dark+"
          icon="/themes/night-owl.png"
          publisher="Microsoft"
          theme="vscode"
        />
        <ThemeInfo
          name="GitHub Dark"
          icon="/themes/github-dark.png"
          publisher="GitHub"
          theme="github-dark"
        />
        <ThemeInfo
          name="Unreal Engine"
          icon="/themes/unreal.png"
          publisher="Epic Games"
          theme="unreal"
        />
        <ThemeInfo
          name="Unity Engine"
          icon="/themes/unity.png"
          publisher="Unity"
          theme="unity"
        />
        <ThemeInfo
          name="Dracula"
          icon="/themes/dracula.png"
          publisher="Dracula Theme"
          theme="dracula"
        />
        <ThemeInfo
          name="Ayu Dark"
          icon="/themes/ayu.png"
          publisher="teabyii"
          theme="ayu-dark"
        />
        <ThemeInfo
          name="Ayu Mirage"
          icon="/themes/ayu.png"
          publisher="teabyii"
          theme="ayu-mirage"
        />
        <ThemeInfo
          name="Nord"
          icon="/themes/nord.png"
          publisher="arcticicestudio"
          theme="nord"
        />
        <ThemeInfo
          name="Night Owl"
          icon="/themes/night-owl.png"
          publisher="sarah.drasner"
          theme="night-owl"
        />
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: { title: 'Settings' },
  };
}

export default SettingsPage;
