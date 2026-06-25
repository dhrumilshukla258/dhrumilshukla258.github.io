import React, { useEffect, useRef } from 'react';
import { InputState } from '@/lib/worldGame';
import styles from '@/styles/GameDpad.module.css';

interface Props {
  inputRef: React.MutableRefObject<InputState>;
}

// Each button sets/clears a key on the shared input ref via pointer events.
// Works for touch AND mouse so it's testable on desktop too.

const DIRS: { key: keyof InputState; label: string; style: string }[] = [
  { key: 'up',    label: '▲', style: styles.dUp    },
  { key: 'left',  label: '◀', style: styles.dLeft  },
  { key: 'down',  label: '▼', style: styles.dDown  },
  { key: 'right', label: '▶', style: styles.dRight },
];

function DpadBtn({ dir, inputRef }: { dir: typeof DIRS[0]; inputRef: Props['inputRef'] }) {
  const held = useRef(false);

  const start = () => { held.current = true;  inputRef.current[dir.key] = true; };
  const end   = () => { held.current = false; inputRef.current[dir.key] = false; };

  return (
    <button
      className={`${styles.dBtn} ${dir.style}`}
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
    >
      {dir.label}
    </button>
  );
}

export function GameDpad({ inputRef }: Props) {
  // Release all keys if pointer leaves the dpad area entirely
  useEffect(() => {
    const clear = () => {
      inputRef.current.left = inputRef.current.right =
      inputRef.current.up   = inputRef.current.down  = false;
    };
    window.addEventListener('pointercancel', clear);
    return () => window.removeEventListener('pointercancel', clear);
  }, [inputRef]);

  return (
    <div className={styles.dpad}>
      {DIRS.map(d => <DpadBtn key={d.key} dir={d} inputRef={inputRef} />)}
    </div>
  );
}

export function ActionBtn({ inputRef, label = 'E' }: { inputRef: Props['inputRef']; label?: string }) {
  const start = () => { inputRef.current.action = true; };
  const end   = () => { inputRef.current.action = false; };
  return (
    <button
      className={styles.actionBtn}
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={end}
    >
      {label}
    </button>
  );
}
