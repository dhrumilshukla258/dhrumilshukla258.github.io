import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { usePersonality, PersonalityType } from '@/components/PersonalityContext';
import {
  VscHome,
  VscBriefcase,
  VscCode,
  VscFiles,
  VscMail,
  VscGithub,
  VscSettings,
} from 'react-icons/vsc';
import Image from 'next/image';
import styles from '@/styles/Sidebar.module.css';

const sidebarTopItems = [
  { Icon: VscHome, path: '/' },
  { Icon: VscBriefcase, path: '/work' },
  { Icon: VscCode, path: '/projects' },
  { Icon: VscFiles, path: '/about' },
  { Icon: VscMail, path: '/contact' },
  { Icon: VscGithub, path: '/github' },
];

const sidebarMiddleItems = [
  { IconPath: '/personality/gamer.png', IconPersonality: "gamer" },
  { IconPath: '/personality/professional.png', IconPersonality: "professional" },
  { IconPath: '/personality/technical.png', IconPersonality: "technical" },
]

const sidebarBottomItems = [
  { Icon: VscSettings, path: '/settings' },
];

const Sidebar = () => {
  const router = useRouter();
  const { personality: currentPersonality, setPersonality } = usePersonality();
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('hasSeenPersonality');
      if (!seen) {
        setIsFirstVisit(true);
        // Show tooltip after a short delay so the page settles
        const t = setTimeout(() => setShowTooltip(true), 1200);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const dismissFirstVisit = () => {
    localStorage.setItem('hasSeenPersonality', 'true');
    setIsFirstVisit(false);
    setShowTooltip(false);
  };

  const handlePersonalityClick = (p: PersonalityType) => {
    setPersonality(p);
    if (isFirstVisit) dismissFirstVisit();
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        {sidebarTopItems.map(({ Icon, path }) => (
          <Link href={path} key={path}>
            <div
              className={`${styles.iconContainer} ${
                router.pathname === path && styles.active
              }`}
            >
              <Icon
                size={16}
                fill={
                  router.pathname === path
                    ? 'rgb(225, 228, 232)'
                    : 'rgb(106, 115, 125)'
                }
                className={styles.icon}
              />
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.sidebarMiddle}>
      <div className={`${styles.iconsWrapper} ${showTooltip ? styles.tooltipVisible : ''} ${styles.tooltipAnchor}`}>
        {sidebarMiddleItems.map(({ IconPath, IconPersonality }) => (
          <div className= {`${styles.iconContainer} ${
            currentPersonality === IconPersonality ? styles.activeGlow : styles.inactive
          }`}

          key={IconPath} onClick={() => handlePersonalityClick(IconPersonality as PersonalityType)}>
            <div className={styles.bottomicon} style={{ position: 'relative', marginTop: '10px'}}>
            <Image
              src={IconPath}
              alt={'Set my Personality to ' + IconPersonality}
              fill
              className={styles.bottomicon}
            />
            </div>
          </div>
        ))}
        <div className={styles.tooltip}>
          <span>Switch my lens — 3 ways to see me</span>
          <button className={styles.tooltipDismiss} onClick={dismissFirstVisit}>Got it</button>
        </div>
      </div>
      </div>

      <div className={styles.sidebarBottom}>
        {sidebarBottomItems.map(({ Icon, path }) => (
          <Link href={path} key={path}>
            <div
              className={`${styles.iconContainer} ${
                router.pathname === path && styles.active
              }`}
            >
              <Icon
                size={16}
                fill={
                  router.pathname === path
                    ? 'rgb(225, 228, 232)'
                    : 'rgb(106, 115, 125)'
                }
                className={styles.icon}
              />
            </div>
          </Link>
        ))}
      </div>

      
    </aside>
  );
};

export default Sidebar;
