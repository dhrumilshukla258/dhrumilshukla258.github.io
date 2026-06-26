import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useMenu } from '@/components/context/MenuContext';
import { VscClose, VscArrowUp, VscArrowDown } from 'react-icons/vsc';
import styles from './FindPanel.module.css';

export function FindPanel() {
  const { findOpen, setFindOpen } = useMenu();
  const [query, setQuery] = useState('');
  const [, setMatchCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (findOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setMatchCount(0);
    }
  }, [findOpen]);

  const doFind = (q: string, forward = true) => {
    if (!q) return;
    // @ts-expect-error — window.find is non-standard but widely supported
    const found: boolean = window.find(q, false, !forward, true, false, false, false);
    setMatchCount(found ? 1 : 0);
    // window.find() steals focus — return it to the input
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleChange = (val: string) => {
    setQuery(val);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { if (e.shiftKey) { doFind(query, false); } else { doFind(query, true); } }
    if (e.key === 'Escape') { setFindOpen(false); }
  };

  if (!findOpen) return null;

  return (
    <div className={styles.panel}>
      <input
        ref={inputRef}
        className={styles.input}
        placeholder="Find"
        value={query}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKey}
      />
      <button className={styles.btn} title="Previous (Shift+Enter)" onClick={() => doFind(query, false)}>
        <VscArrowUp size={13} />
      </button>
      <button className={styles.btn} title="Next (Enter)" onClick={() => doFind(query, true)}>
        <VscArrowDown size={13} />
      </button>
      <button className={styles.btn} title="Close (Esc)" onClick={() => setFindOpen(false)}>
        <VscClose size={13} />
      </button>
    </div>
  );
}
