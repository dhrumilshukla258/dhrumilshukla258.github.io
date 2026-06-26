import { useRef, useState } from 'react';
import Link from 'next/link';
import styles from './DropdownMenu.module.css';

export interface MenuItemDef {
  label?: string;
  shortcut?: string;
  action?: () => void;
  href?: string;
  submenu?: MenuItemDef[];
  disabled?: boolean;
  separator?: true;
  glitch?: true;
}

function MenuItemRow({ item, onClose }: { item: MenuItemDef; onClose: () => void }) {
  const [subOpen, setSubOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (item.separator) return <div className={styles.separator} />;

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (item.submenu) setSubOpen(true);
  };

  const handleMouseLeave = () => {
    if (item.submenu) {
      timerRef.current = setTimeout(() => setSubOpen(false), 150);
    }
  };

  const handleClick = () => {
    if (item.disabled || item.submenu) return;
    item.action?.();
    onClose();
  };

  const rowEl = (
    <div
      className={`${styles.item} ${item.disabled ? styles.disabled : ''} ${item.submenu ? styles.hasSubmenu : ''} ${item.glitch ? styles.glitchItem : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <span className={styles.label}>{item.label}</span>
      <span className={styles.right}>
        {item.shortcut && <span className={styles.shortcut}>{item.shortcut}</span>}
        {item.submenu && <span className={styles.chevron}>›</span>}
      </span>
      {item.submenu && subOpen && (
        <div
          className={styles.submenu}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {item.submenu.map((sub, i) => (
            <MenuItemRow key={i} item={sub} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  );

  if (item.href && !item.disabled) {
    return (
      <Link href={item.href} onClick={onClose} className={styles.linkWrapper}>
        {rowEl}
      </Link>
    );
  }

  return rowEl;
}

interface DropdownMenuProps {
  items: MenuItemDef[];
  onClose: () => void;
}

export function DropdownMenu({ items, onClose }: DropdownMenuProps) {
  return (
    <div className={styles.menu}>
      {items.map((item, i) => (
        <MenuItemRow key={i} item={item} onClose={onClose} />
      ))}
    </div>
  );
}
