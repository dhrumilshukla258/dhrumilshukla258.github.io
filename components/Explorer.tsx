import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePersonality } from '@/components/PersonalityContext';
import { VscChevronRight } from 'react-icons/vsc';

import styles from '@/styles/Explorer.module.css';

const explorerItems = [
  {
    name: 'home.c',
    path: '/',
    icon: '/logos/file_type_c.svg',
  },
  {
    name: 'experience.py',
    path: '/work',
    icon: '/logos/file_type_python.svg',
  },
  {
    name: 'projects.cpp',
    path: '/projects',
    icon: '/logos/file_type_cpp3.svg',
  },
  {
    name: 'about.json',
    path: '/about',
    icon: '/logos/json_icon.svg',
  },
  {
    name: 'contact.cs',
    path: '/contact',
    icon: '/logos/file_type_csharp2.svg',
  },
  {
    name: 'github.md',
    path: '/github',
    icon: '/logos/markdown_icon.svg',
  },
];

const Explorer = () => {
  const [portfolioOpen, setPortfolioOpen] = useState(true);
  const { personality } = usePersonality();
  const personalityDataExplorer = {
    professional: (
      <div className={styles.professional}></div>
    ),
    gamer:(
      <div className={styles.explorer}>
        <p className={styles.title}>Explorer</p>
        <div>
          <input
            type="checkbox"
            className={styles.checkbox}
            id="portfolio-checkbox"
            checked={portfolioOpen}
            onChange={() => setPortfolioOpen(!portfolioOpen)}
          />
          <label htmlFor="portfolio-checkbox" className={styles.heading}>
            <VscChevronRight
              className={styles.chevron}
              style={portfolioOpen ? { transform: 'rotate(90deg)' } : {}}
            />
            Portfolio
          </label>
          <div
            className={styles.files}
            style={portfolioOpen ? { display: 'block' } : { display: 'none' }}
          >
            {explorerItems.map((item) => (
              <Link href={item.path} key={item.name}>
                <div className={styles.file}>
                  <Image src={item.icon} alt={item.name} height={18} width={18} />{' '}
                  <p>{item.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    ),
    technical:(
      <div className={styles.explorer}>
        <p className={styles.title}>Explorer</p>
        <div>
          <input
            type="checkbox"
            className={styles.checkbox}
            id="portfolio-checkbox"
            checked={portfolioOpen}
            onChange={() => setPortfolioOpen(!portfolioOpen)}
          />
          <label htmlFor="portfolio-checkbox" className={styles.heading}>
            <VscChevronRight
              className={styles.chevron}
              style={portfolioOpen ? { transform: 'rotate(90deg)' } : {}}
            />
            Portfolio
          </label>
          <div
            className={styles.files}
            style={portfolioOpen ? { display: 'block' } : { display: 'none' }}
          >
            {explorerItems.map((item) => (
              <Link href={item.path} key={item.name}>
                <div className={styles.file}>
                  <Image src={item.icon} alt={item.name} height={18} width={18} />{' '}
                  <p>{item.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    ),
  };

  
      
  return (
    personalityDataExplorer[personality]
  );
};

export default Explorer;
