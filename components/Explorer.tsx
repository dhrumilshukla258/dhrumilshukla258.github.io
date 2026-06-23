import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { usePersonality } from '@/components/PersonalityContext';
import { VscChevronRight, VscSettings } from 'react-icons/vsc';

import styles from '@/styles/Explorer.module.css';

const professionalItems = [
  { name: 'home.c',        path: '/',        icon: '/logos/file_type_c.svg' },
  { name: 'experience.py', path: '/work',    icon: '/logos/file_type_python.svg' },
  { name: 'projects.cpp',  path: '/projects',icon: '/logos/file_type_cpp3.svg' },
  { name: 'about.json',    path: '/about',   icon: '/logos/json_icon.svg' },
  { name: 'contact.cs',    path: '/contact', icon: '/logos/file_type_csharp2.svg' },
  { name: 'github.md',     path: '/github',  icon: '/logos/markdown_icon.svg' },
];

const gamerItems = [
  { name: 'home.exe',      path: '/',        icon: '/logos/file_type_bat.svg' },
  { name: 'career.log',    path: '/work',    icon: '/logos/file_type_log.svg' },
  { name: 'builds.dat',    path: '/projects',icon: '/logos/file_type_binary.svg' },
  { name: 'character.cfg', path: '/about',   icon: '/logos/file_type_config.svg' },
  { name: 'contact.msg',   path: '/contact', icon: '/logos/file_type_db.svg' },
  { name: 'source.git',    path: '/github',  icon: '/logos/file_type_git.svg' },
];

const technicalItems = professionalItems;

interface ExplorerPanelProps {
  title: string;
  label: string;
  items: typeof professionalItems;
  className: string;
}

function ExplorerPanel({ title, label, items, className }: ExplorerPanelProps) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  return (
    <div className={className}>
      <p className={styles.title}>{title}</p>
      <div>
        <input
          type="checkbox"
          className={styles.checkbox}
          id={`explorer-checkbox-${label}`}
          checked={open}
          onChange={() => setOpen(!open)}
        />
        <label htmlFor={`explorer-checkbox-${label}`} className={styles.heading}>
          <VscChevronRight
            className={styles.chevron}
            style={open ? { transform: 'rotate(90deg)' } : {}}
          />
          {label}
        </label>
        <div className={styles.files} style={open ? { display: 'block' } : { display: 'none' }}>
          {items.map((item) => (
            <Link href={item.path} key={item.name}>
              <div className={`${styles.file} ${router.pathname === item.path ? styles.fileActive : ''}`}>
                <Image src={item.icon} alt={item.name} height={18} width={18} />
                <p>{item.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className={styles.settingsLink}>
        <Link href="/settings">
          <div className={`${styles.file} ${router.pathname === '/settings' ? styles.fileActive : ''}`}>
            <VscSettings size={16} />
            <p>settings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

const Explorer = () => {
  const { personality } = usePersonality();

  if (personality === 'professional') {
    return null;
  }

  if (personality === 'gamer') {
    return (
      <ExplorerPanel
        title="Explorer"
        label="SAVE DATA"
        items={gamerItems}
        className={styles.explorerSmallOnly}
      />
    );
  }

  // technical
  return (
    <ExplorerPanel
      title="Explorer"
      label="Portfolio"
      items={technicalItems}
      className={styles.explorerSmallOnly}
    />
  );
};

export default Explorer;
