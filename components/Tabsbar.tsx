import Tab from '@/components/Tab';
import { usePersonality } from '@/components/PersonalityContext';
import styles from '@/styles/Tabsbar.module.css';

const personalityDataTaskbar = {
  professional: (
    <div> </div>
  ),
  gamer: (
    <div className={styles.tabs}>
      <Tab icon="/logos/file_type_bat.svg" filename="home.exe" path="/" />
      <Tab icon="/logos/file_type_log.svg" filename="career.log" path="/work"/>
      <Tab icon="/logos/file_type_binary.svg" filename="builds.dat" path="/projects" />
      <Tab icon="/logos/file_type_config.svg" filename="character.cfg" path="/about" />
      <Tab icon="/logos/file_type_db.svg" filename="contact.msg" path="/contact" />
      <Tab icon="/logos/file_type_git.svg" filename="source.git" path="/github"/>
    </div>
  ),
  technical: (
    <div className={styles.tabs}>    
      <Tab icon="/logos/file_type_c.svg" filename="home.c" path="/" />
      <Tab icon="/logos/file_type_python.svg" filename="experience.py" path="/work"/>
      <Tab icon="/logos/file_type_cpp3.svg" filename="projects.cpp" path="/projects" />
      <Tab icon="/logos/json_icon.svg" filename="about.json" path="/about" />
      <Tab icon="/logos/file_type_csharp2.svg" filename="contact.cs" path="/contact" />
      <Tab icon="/logos/markdown_icon.svg" filename="github.md" path="/github"/>
    </div>
  ),
};

const Tabsbar = () => {
  const { personality } = usePersonality();

  return (
    <div>
      {personalityDataTaskbar[personality]}
    </div>
  );
};

export default Tabsbar;
