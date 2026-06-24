import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

import styles from '@/styles/Tab.module.css';

interface TabProps {
  icon: string;
  filename: string;
  path: string;
}

const Tab = ({ icon, filename, path }: TabProps) => {
  const router = useRouter();
  const isActive = router.pathname === path;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;
    const scrollIntoView = () => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    };
    scrollIntoView();
    window.addEventListener('resize', scrollIntoView);
    return () => window.removeEventListener('resize', scrollIntoView);
  }, [isActive]);

  return (
    <Link href={path}>
      <div
        ref={ref}
        className={`${styles.tab} ${isActive && styles.active}`}
      >
        <Image src={icon} alt={filename} height={18} width={18} />
        <p>{filename}</p>
      </div>
    </Link>
  );
};

export default Tab;
