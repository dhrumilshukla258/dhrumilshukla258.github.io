import styles from './AboutPage.module.css';
import { usePersonality } from '@/components/context/PersonalityContext';
import { owner } from '@/data/owner';
import { aboutProfessional, aboutTechnical, aboutGamer } from '@/data/about';
import React, { useState, useEffect } from 'react';

const professionalSection = (
  <div className={styles.aboutContent}>
    <section className={styles.section}>
      {aboutProfessional.paragraphs.map((p, i) => (
        <p key={i} className={styles.paragraph}>{p}</p>
      ))}
    </section>
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Education</h2>
      <div className={styles.techEduBlock}>
        {owner.educationStructured.map(e => (
          <div key={e.school} className={styles.techEduEntry}>
            <span className={styles.techEduDegree}>{e.degree}</span>
            <span className={styles.techEduSchool}>{e.school}</span>
            <span className={styles.techEduDates}>{e.dates}</span>
          </div>
        ))}
      </div>
    </section>
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Outside of Work</h2>
      <p className={styles.paragraph}>{aboutProfessional.outsideOfWork}</p>
    </section>
  </div>
);

const technicalSection = (
  <div className={styles.aboutContent}>
    <section className={styles.section}>
      <pre className={styles.techAboutCode}>{`# about.py
# ─────────────────────────────────────────────────────
# First spark: hex editor + game save files -> "wait, these bytes mean something"
# First code:  printf("Hello, World\\n");  // C, classic
# Current:     still chasing that same feeling

class ${owner.name.replace(/ /g, '')}:
    keyboard      = "${owner.keyboard}"
    editor        = "${aboutTechnical.editorName}"
    shell         = "${aboutTechnical.shell}"
    current_reads = ${JSON.stringify(aboutTechnical.currentReads)}
    homelab       = "${aboutTechnical.homelab}"

    hobbies = ${JSON.stringify(owner.hobbies)}
    letterboxd = "yes, I log everything"`}</pre>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Education</h2>
      <div className={styles.techEduBlock}>
        {owner.educationStructured.map(e => (
          <div key={e.school} className={styles.techEduEntry}>
            <span className={styles.techEduDegree}>{e.degree}</span>
            <span className={styles.techEduSchool}>{e.school}</span>
            <span className={styles.techEduDates}>{e.dates}</span>
          </div>
        ))}
      </div>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Currently Curious About</h2>
      <div className={styles.techEduBlock}>
        {aboutTechnical.currentlyCurious.map(({ label, desc }) => (
          <div key={label} className={styles.techEduEntry}>
            <span className={styles.techEduDegree}>{label}</span>
            <span className={styles.techEduSchool}>{desc}</span>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const gamerSection = (
  <div className={styles.aboutContent}>
    <section className={styles.section}>
      <div className={styles.charSheet}>
        <div className={styles.charStatRow}>
          {aboutGamer.charStats.map(({ label, value }) => (
            <div key={label} className={styles.charStat}>
              <span className={styles.charLabel}>{label}</span>
              <span className={styles.charValue}>{value}</span>
            </div>
          ))}
        </div>
        <div className={styles.charXpRow}>
          <span className={styles.charXpLabel}>CURIOSITY STAT</span>
          <div className={styles.charXpBar}>
            <div className={styles.charXpFill} style={{ width: '96%' }}></div>
          </div>
          <span className={styles.charXpPct}>96</span>
        </div>
      </div>
    </section>

    <section className={styles.section}>
      <h2 className={`${styles.sectionTitle} ${styles.gamerSectionTitle}`}>🕹️ GAMES PLAYED</h2>
      <ul className={styles.achievementList}>
        {aboutGamer.videoGames.map(({ icon, label, desc }) => (
          <li key={label} className={styles.achievementItem}>
            <span className={styles.achievementIcon}>{icon}</span>
            <div>
              <div className={styles.achievementLabel}>{label}</div>
              <div className={styles.achievementDesc}>{desc}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>

    <section className={styles.section}>
      <h2 className={`${styles.sectionTitle} ${styles.gamerSectionTitle}`}>🎲 BOARD GAMES</h2>
      <ul className={styles.achievementList}>
        {aboutGamer.boardGames.map(({ icon, label, desc }) => (
          <li key={label} className={styles.achievementItem}>
            <span className={styles.achievementIcon}>{icon}</span>
            <div>
              <div className={styles.achievementLabel}>{label}</div>
              <div className={styles.achievementDesc}>{desc}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>

    <section className={styles.section}>
      <h2 className={`${styles.sectionTitle} ${styles.gamerSectionTitle}`}>🎯 OFF-DUTY ACTIVITIES</h2>
      <ul className={styles.achievementList}>
        {aboutGamer.offDuty.map(({ icon, label, desc }) => (
          <li key={label} className={styles.achievementItem}>
            <span className={styles.achievementIcon}>{icon}</span>
            <div>
              <div className={styles.achievementLabel}>{label}</div>
              <div className={styles.achievementDesc}>{desc}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>

    <section className={styles.section}>
      <h2 className={`${styles.sectionTitle} ${styles.gamerSectionTitle}`}>📖 ORIGIN STORY</h2>
      <p className={styles.paragraph}>
        {aboutGamer.originStory[0]}
        <code style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{aboutGamer.originStory[1]}</code>
        {aboutGamer.originStory[2]}
      </p>
      <p className={styles.paragraph}>{aboutGamer.originStory2}</p>
    </section>
  </div>
);

const personalityDataAbout = {
  professional: professionalSection,
  technical:    technicalSection,
  gamer:        gamerSection,
};

const AboutPage = () => {
  const { personality } = usePersonality();
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    setShowContent(false);
    const timeout = setTimeout(() => setShowContent(true), 50);
    return () => clearTimeout(timeout);
  }, [personality]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>{owner.name}</h1>
        <div className={styles.subtitle}>{owner.title}</div>
        <div className={`${showContent ? styles.slideIn : styles.hidden}`}>
          {personalityDataAbout[personality]}
        </div>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: { title: 'About' },
  };
}

export default AboutPage;
