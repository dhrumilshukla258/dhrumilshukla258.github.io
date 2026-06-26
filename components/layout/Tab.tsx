import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { useMenu } from '@/components/context/MenuContext';
import styles from './Tab.module.css';

interface TabProps {
  icon: string;
  filename: string;
  path: string;
  entering?: boolean;
  dropIndicator?: boolean;
  onClose: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

const Tab = ({ icon, filename, path, entering, dropIndicator, onClose, onDragStart, onDragOver, onDrop, onDragEnd }: TabProps) => {
  const router = useRouter();
  const isActive = router.pathname === path;
  const ref = useRef<HTMLDivElement>(null);
  const { showContextMenu, addToast } = useMenu();

  useEffect(() => {
    if (!isActive) return;
    const scrollIntoView = () => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    scrollIntoView();
    window.addEventListener('resize', scrollIntoView);
    return () => window.removeEventListener('resize', scrollIntoView);
  }, [isActive]);

  const tabContextMenu = [
    { label: 'Open',              action: () => router.push(path) },
    { label: 'Close Tab',         action: onClose },
    { label: 'Close Other Tabs',  action: () => addToast('Close others from each tab\'s ✕', 'info') },
    { separator: true as const },
    { label: 'Copy Path',         action: () => { const u = window.location.origin + path; navigator.clipboard.writeText(u).then(() => addToast(`Copied: ${u}`, 'success')); } },
    { label: 'Copy Relative Path',action: () => navigator.clipboard.writeText(path).then(() => addToast(`Copied: ${path}`, 'success')) },
    { separator: true as const },
    { label: 'Pin Tab',           action: () => addToast(`"${filename}" pinned 📌`, 'success') },
    { label: 'Split Editor',      action: () => addToast('Split editor not supported 😄', 'info') },
  ];

  return (
    <div
      ref={ref}
      className={`${styles.tab} ${isActive ? styles.active : ''} ${dropIndicator ? styles.dropTarget : ''} ${entering ? styles.entering : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDrop={e => { e.preventDefault(); onDrop(); }}
      onDragEnd={onDragEnd}
      onContextMenu={e => showContextMenu(e, tabContextMenu)}
    >
      <Link href={path} className={styles.tabLink}>
        <Image src={icon} alt={filename} height={18} width={18} />
        <p>{filename}</p>
      </Link>
      <button
        className={styles.closeBtn}
        onClick={e => { e.preventDefault(); e.stopPropagation(); onClose(); }}
        title="Close tab"
        aria-label="Close tab"
      >
        ✕
      </button>
    </div>
  );
};

export default Tab;
