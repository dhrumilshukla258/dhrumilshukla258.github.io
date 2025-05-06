import styles from '@/styles/AboutPage.module.css';
import React, { useState, useEffect } from "react";

const bios = {
  professional: (
    <div className={styles.aboutContent}>
        <section className={styles.section}>
          <p className={styles.paragraph}>
            Hey! I'm a programmer and developer who loves solving problems and crafting clean, efficient solutions. 
            My journey began with writing a simple “Hello, World” in C — and since then, I&apos;ve built everything from 
            game engines and tools to full-fledged games, websites, mobile apps, and data-driven systems. I&apos;m driven 
            by an endless curiosity to learn and explore the unknown.
          </p>
          <p className={styles.paragraph}>
            I thrive on whiteboard sessions with teammates — brainstorming, designing, and iterating on fresh ideas. 
            I also enjoy rewiring my brain now and then: whether it&apos;s mastering an ortholinear keyboard with the Engram layout, 
            diving into networking and security to build a VPN, or transforming an old laptop and some spare HDDs into a fully functioning home server.
          </p>
        </section>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          <p className={styles.paragraph}>
            Currently at <span className={styles.highlight}>Visual Concepts Entertainment</span>, I have worked on
            presentation & gameplay elements, shader code, user interface, profiling tools, code reviews,
            and critical bug resolution. Collarabrated with engineers, artists, producers
            and players and fostered innovative problem-solving approaches.
          </p>
        </section>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Beyond Code</h2>
          <p className={styles.paragraph}>
            Aside from programming, I love to play video games, tennis, skating,
            watch movies or series and enjoy life.
          </p>
        </section>
    </div>
  ),
  playful: (
    <p>
      Hey! I'm a code goblin who fell into the programming rabbit hole after printing "Hello, World" in C — and I’ve been stuck there ever since. These days, I build games, tools, apps, and probably over-engineer my to-do list. Powered by caffeine, curiosity, and the occasional side quest.
    </p>
  ),
  technical: (
    <p>
      Hey! I’m a systems-focused programmer who enjoys deep-diving into memory management, threading, and engine architecture. From shader pipelines to gameplay loops and profiling tools — I love working across the stack to optimize performance and improve player experience.
    </p>
  ),
  casual: (
    <p>
      Hey! I'm a programmer who just loves to build cool stuff. Whether it’s a game system, an app, or a little tool that scratches a personal itch — I’m all about making things work, look great, and feel fun to use.
    </p>
  ),
  narrative: (
    <p>
      Once upon a time, I wrote my first C program and printed “Hello, World.” That tiny step opened a portal into a world of endless possibilities — from building engines and tools to diving into mobile apps and personal projects. The story continues...
    </p>
  ),
};


const AboutPage = () => {
  const [personality, setPersonality] = useState<keyof typeof bios>('professional');
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    setShowContent(false);
    const timeout = setTimeout(() => setShowContent(true), 50);
    return () => clearTimeout(timeout);
  }, [personality]);

  return (
    <div className={styles.container}>
    <div className={styles.content}>
      <h1 className={styles.title}>Dhrumil Shukla</h1>
      <div className={styles.subtitle}>Software Engineer</div>
      <div className={`${showContent ? styles.slideIn : styles.hidden}`}>
        {bios[personality]}
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

{
/*<div className={styles.selectorRow}>
<label htmlFor="personality-select" className={styles.selectorLabel}>
  Choose the way you want my personality to be:
</label>
<select
  id="personality-select"
  value={personality}
  onChange={(e) => setPersonality(e.target.value as keyof typeof bios)}
  className={styles.selectorDropdown}>
  <option value="professional">Professional</option>
  <option value="playful">Playful</option>
  <option value="technical">Technical</option>
  <option value="casual">Casual</option>
  <option value="narrative">Narrative</option>
</select>
</div>*/
}
