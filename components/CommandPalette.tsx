import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useMenu } from '@/components/MenuContext';
import { pages } from '@/data/pages';
import { themes as THEMES } from '@/data/owner';
import styles from '@/styles/CommandPalette.module.css';

interface CommandDef {
  id: string;
  label: string;
  detail?: string;
  category: string;
  action: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, toggleSidebar, setTerminalOpen, toggleZenMode, addToast, adjustZoom, resetZoom } = useMenu();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const applyTheme = useCallback((themeId: string) => {
    document.documentElement.setAttribute('data-theme', themeId);
    const personality = document.documentElement.getAttribute('data-personality') || 'professional';
    localStorage.setItem(`theme_${personality}`, themeId);
    addToast(`Theme: ${THEMES.find(t => t.id === themeId)?.label ?? themeId}`, 'success');
  }, [addToast]);

  const commands: CommandDef[] = [
    ...pages.map(p => ({
      id: `nav-${p.path}`,
      label: `Go to ${p.professional.name}`,
      detail: p.path,
      category: 'Navigate',
      action: () => router.push(p.path),
    })),
    { id: 'nav-settings', label: 'Open Settings', detail: '/settings', category: 'Navigate', action: () => router.push('/settings') },
    ...THEMES.map(t => ({
      id: `theme-${t.id}`,
      label: `Set Theme: ${t.label}`,
      detail: t.id,
      category: 'Appearance',
      action: () => applyTheme(t.id),
    })),
    { id: 'toggle-sidebar',  label: 'Toggle Sidebar',        detail: 'Ctrl+B',        category: 'View', action: toggleSidebar },
    { id: 'toggle-terminal', label: 'Toggle Terminal',        detail: 'Ctrl+`',        category: 'View', action: () => setTerminalOpen(true) },
    { id: 'toggle-zen',      label: 'Toggle Zen Mode',        detail: '',              category: 'View', action: toggleZenMode },
    { id: 'zoom-in',         label: 'Zoom In',               detail: 'Ctrl++',        category: 'View', action: () => adjustZoom(1) },
    { id: 'zoom-out',        label: 'Zoom Out',              detail: 'Ctrl+-',        category: 'View', action: () => adjustZoom(-1) },
    { id: 'zoom-reset',      label: 'Reset Zoom',            detail: 'Ctrl+0',        category: 'View', action: resetZoom },
  ];

  const filtered = query.trim()
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        (c.detail ?? '').toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const execute = useCallback((cmd: CommandDef) => {
    setCommandPaletteOpen(false);
    cmd.action();
  }, [setCommandPaletteOpen]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && filtered[selected]) execute(filtered[selected]);
    if (e.key === 'Escape') setCommandPaletteOpen(false);
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setCommandPaletteOpen(false)}>
      <div className={styles.palette} onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="Type a command or search..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
        />
        <div ref={listRef} className={styles.list}>
          {filtered.length === 0 && (
            <div className={styles.empty}>No commands found</div>
          )}
          {filtered.map((cmd, i) => (
            <div
              key={cmd.id}
              className={`${styles.command} ${i === selected ? styles.commandSelected : ''}`}
              onMouseEnter={() => setSelected(i)}
              onClick={() => execute(cmd)}
            >
              <div className={styles.commandLeft}>
                <span className={styles.commandCategory}>{cmd.category}</span>
                <span className={styles.commandLabel}>{cmd.label}</span>
              </div>
              {cmd.detail && <span className={styles.commandDetail}>{cmd.detail}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
