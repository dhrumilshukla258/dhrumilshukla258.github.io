import styles from '@/styles/AboutPage.module.css';
import { usePersonality } from '@/components/PersonalityContext';
import React, { useState, useEffect } from 'react';

const personalityDataAbout = {
  professional: (
    <div className={styles.aboutContent}>
      <section className={styles.section}>
        <p className={styles.paragraph}>
          It started with games. As a kid I was more interested in what was happening under the hood than
          on screen — cracking open a hex editor to hunt for cheat codes, changing bytes, watching the
          numbers in-game shift. That moment of &quot;wait, I can control this&quot; led to a first
          &quot;Hello, World&quot; in C, which led to an obsession that never really switched off.
        </p>
        <p className={styles.paragraph}>
          I love the creative side of engineering — the part where you go from a blank screen to something
          that actually does something. I thrive in collaborative sessions: whiteboard design discussions,
          debating trade-offs, iterating on ideas with teammates. That same curiosity bleeds into everything
          else — I&apos;ve taught myself an ortholinear keyboard layout just to see if I could, and I
          genuinely enjoy tinkering with home infrastructure purely for the challenge of it.
        </p>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Education</h2>
        <div className={styles.techEduBlock}>
          <div className={styles.techEduEntry}>
            <span className={styles.techEduDegree}>M.S. Computer Science</span>
            <span className={styles.techEduSchool}>DigiPen Institute of Technology</span>
            <span className={styles.techEduDates}>Sep 2018 – Dec 2020</span>
          </div>
          <div className={styles.techEduEntry}>
            <span className={styles.techEduDegree}>B.E. Computer Engineering</span>
            <span className={styles.techEduSchool}>Gujarat Technological University</span>
            <span className={styles.techEduDates}>Aug 2014 – May 2018</span>
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Outside of Work</h2>
        <p className={styles.paragraph}>
          I play a lot of video games — it&apos;s both a hobby and honestly useful context for working in the industry.
          Tennis and skating are my go-to ways to step away from screens. I track almost every movie I watch on
          Letterboxd, which has become its own rabbit hole. And I run a home server that keeps getting more
          services added to it, which I tell myself is &quot;infrastructure practice.&quot;
        </p>
      </section>
    </div>
  ),

  technical: (
    <div className={styles.aboutContent}>
      <section className={styles.section}>
        <pre className={styles.techAboutCode}>{`# about.py
# ─────────────────────────────────────────────────────
# First spark: hex editor + game save files → "wait, these bytes mean something"
# First code:  printf("Hello, World\\n");  // C, classic
# Current:     still chasing that same feeling

class DhrumilShukla:
    keyboard      = "Ortholinear columnar + Engram layout"
    editor        = "VS Code (obviously)"
    shell         = "zsh + tmux"
    current_reads = ["local LLM inference", "self-hosting everything"]
    homelab       = "Proxmox + Docker + XFS/mergerfs + too many services"

    hobbies = ["video games", "tennis", "skating", "movies"]
    letterboxd = "yes, I log everything"`}</pre>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Education</h2>
        <div className={styles.techEduBlock}>
          <div className={styles.techEduEntry}>
            <span className={styles.techEduDegree}>M.S. Computer Science</span>
            <span className={styles.techEduSchool}>DigiPen Institute of Technology</span>
            <span className={styles.techEduDates}>Sep 2018 – Dec 2020</span>
          </div>
          <div className={styles.techEduEntry}>
            <span className={styles.techEduDegree}>B.E. Computer Engineering</span>
            <span className={styles.techEduSchool}>Gujarat Technological University</span>
            <span className={styles.techEduDates}>Aug 2014 – May 2018</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Currently Curious About</h2>
        <div className={styles.techEduBlock}>
          {[
            { label: 'Local LLM inference tuning', desc: 'Running Ollama on homelab hardware — quantization, context window tradeoffs, prompt caching' },
            { label: 'Self-hosted everything', desc: 'Replacing cloud services one Docker container at a time — OpenCloud, Jellyfin, Sunshine, Collabora' },
          ].map(({ label, desc }) => (
            <div key={label} className={styles.techEduEntry}>
              <span className={styles.techEduDegree}>{label}</span>
              <span className={styles.techEduSchool}>{desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),

  gamer: (
    <div className={styles.aboutContent}>
      <section className={styles.section}>
        <div className={styles.charSheet}>
          <div className={styles.charStatRow}>
            <div className={styles.charStat}>
              <span className={styles.charLabel}>FIRST GAME</span>
              <span className={styles.charValue}>Hex Editor + Cheat Codes</span>
            </div>
            <div className={styles.charStat}>
              <span className={styles.charLabel}>ARCHETYPE</span>
              <span className={styles.charValue}>Explorer / Tinkerer</span>
            </div>
            <div className={styles.charStat}>
              <span className={styles.charLabel}>MAIN HOBBY</span>
              <span className={styles.charValue}>Video Games</span>
            </div>
            <div className={styles.charStat}>
              <span className={styles.charLabel}>KEYBOARD</span>
              <span className={styles.charValue}>Ortholinear + Engram</span>
            </div>
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
          {[
            { icon: '🏀', label: 'NBA 2K Series', desc: 'Worked on it AND plays it. The lore goes deep.' },
            { icon: '🧱', label: 'LEGO 2K Drive', desc: 'Built it, raced in it. Yes, that’s a flex.' },
            { icon: '🌍', label: 'The Last of Us', desc: 'Peak storytelling. Joel was right.' },
            { icon: '🍳', label: 'Overcooked', desc: 'Has caused more real-life arguments than any other game.' },
          ].map(({ icon, label, desc }) => (
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
          {[
            { icon: '🏜️', label: 'Dune Imperium', desc: 'Deck-building meets worker placement. The spice must flow.' },
            { icon: '🟦', label: 'Azul', desc: 'Deceptively serene tile-drafting game. Ruthlessly cut off your opponents.' },
            { icon: '🚂', label: 'Ticket to Ride', desc: 'Classic. Someone always blocks your route. Always.' },
            { icon: '⏳', label: 'Anachrony', desc: 'Time-travel resource management. Surprisingly not as confusing as it sounds.' },
          ].map(({ icon, label, desc }) => (
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
          {[
            { icon: '🎾', label: 'Tennis', desc: 'Casual ranked. Strong forehand. Questionable backhand.' },
            { icon: '🛼', label: 'Skating', desc: 'Best way to AFK from screens without actually logging off.' },
            { icon: '🎬', label: 'Movies (Letterboxd)', desc: 'Logs everything. Has opinions. Will recommend a film unprompted.' },
            { icon: '🖥️', label: 'Home Lab', desc: 'Self-hosting things no one asked for. On purpose. For fun.' },
            { icon: '⌨️', label: 'Ortholinear Keyboard', desc: 'Engram layout on a columnar stagger board. Peak nerd activity.' },
          ].map(({ icon, label, desc }) => (
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
          The first cheat code wasn&apos;t typed — it was found. Opened a hex editor on a game save file as
          a kid, changed some bytes, and the numbers in-game changed too. That was the moment.
          Shortly after: first C program,{' '}
          <code style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>printf(&quot;Hello, World\n&quot;)</code>,
          compiled, ran. Obsession unlocked. Been farming code XP ever since.
        </p>
        <p className={styles.paragraph}>
          Loves building things, breaking things, and understanding why they broke. Plays too many games,
          watches too many movies, and runs a home server that keeps getting more services added to it.
          No regrets.
        </p>
      </section>
    </div>
  ),
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
        <h1 className={styles.title}>Dhrumil Shukla</h1>
        <div className={styles.subtitle}>Software Engineer</div>
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
