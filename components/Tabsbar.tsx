import Tab from '@/components/Tab';

import styles from '@/styles/Tabsbar.module.css';

const Tabsbar = () => {
  return (
    <div className={styles.tabs}>
      <Tab icon="/logos/file_type_csharp2.svg" filename="home.cs" path="/" />
      <Tab icon="/logos/file_type_python.svg" filename="experience.py" path="/work"/>
      <Tab icon="/logos/file_type_cpp3.svg" filename="projects.cpp" path="/projects" />
      <Tab icon="/logos/json_icon.svg" filename="about.json" path="/about" />
      <Tab icon="/logos/file_type_c.svg" filename="contact.c" path="/contact" />
      <Tab icon="/logos/markdown_icon.svg" filename="github.md" path="/github"/>
    </div>
  );
};

export default Tabsbar;
