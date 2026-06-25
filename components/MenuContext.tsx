import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { MenuItemDef } from '@/components/DropdownMenu';

export type MenuId = 'file' | 'edit' | 'view' | 'go' | 'run' | 'terminal' | 'help' | null;

export interface Toast {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'error';
}

export interface ContextMenuState {
  x: number;
  y: number;
  items: MenuItemDef[];
}

interface MenuContextType {
  activeMenu: MenuId;
  setActiveMenu: (id: MenuId) => void;
  zenMode: boolean;
  toggleZenMode: () => void;
  sidebarVisible: boolean;
  toggleSidebar: () => void;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  findOpen: boolean;
  setFindOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: number) => void;
  zoomLevel: number;
  adjustZoom: (delta: number) => void;
  resetZoom: () => void;
  contextMenu: ContextMenuState | null;
  showContextMenu: (e: MouseEvent | React.MouseEvent, items: MenuItemDef[]) => void;
  hideContextMenu: () => void;
  miniGameOpen: boolean;
  setMiniGameOpen: (open: boolean) => void;
  closeDialogOpen: boolean;
  setCloseDialogOpen: (open: boolean) => void;
}

const MenuContext = createContext<MenuContextType | null>(null);

let toastCounter = 0;

export function MenuProvider({ children }: { children: ReactNode }) {
  const [activeMenu, setActiveMenu] = useState<MenuId>(null);
  const [zenMode, setZenMode] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [miniGameOpen, setMiniGameOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const toggleZenMode = useCallback(() => setZenMode(z => !z), []);
  const toggleSidebar = useCallback(() => setSidebarVisible(s => !s), []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastCounter;
    setToasts(ts => [...ts, { id, message, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const applyZoom = useCallback((level: number) => {
    const clamped = Math.max(-3, Math.min(5, level));
    setZoomLevel(clamped);
    document.body.style.zoom = `${100 + clamped * 10}%`;
  }, []);

  const adjustZoom = useCallback((delta: number) => {
    setZoomLevel(prev => {
      const next = Math.max(-3, Math.min(5, prev + delta));
      document.body.style.zoom = `${100 + next * 10}%`;
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => applyZoom(0), [applyZoom]);

  const showContextMenu = useCallback((e: MouseEvent | React.MouseEvent, items: MenuItemDef[]) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, items });
  }, []);

  const hideContextMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.shiftKey && e.key === 'P') { e.preventDefault(); setCommandPaletteOpen(o => !o); }
      if (mod && e.key === 'f') { e.preventDefault(); setFindOpen(o => !o); }
      if (mod && e.key === '`') { e.preventDefault(); setTerminalOpen(o => !o); }
      if (mod && e.key === 'b') { e.preventDefault(); setSidebarVisible(s => !s); }
      if (mod && (e.key === '=' || e.key === '+')) { e.preventDefault(); adjustZoom(1); }
      if (mod && e.key === '-') { e.preventDefault(); adjustZoom(-1); }
      if (mod && e.key === '0') { e.preventDefault(); resetZoom(); }
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setCommandPaletteOpen(false);
        setFindOpen(false);
        setContextMenu(null);
        setZenMode(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [adjustZoom, resetZoom]);

  return (
    <MenuContext.Provider value={{
      activeMenu, setActiveMenu,
      zenMode, toggleZenMode,
      sidebarVisible, toggleSidebar,
      terminalOpen, setTerminalOpen,
      commandPaletteOpen, setCommandPaletteOpen,
      findOpen, setFindOpen,
      toasts, addToast, removeToast,
      zoomLevel, adjustZoom, resetZoom,
      contextMenu, showContextMenu, hideContextMenu,
      miniGameOpen, setMiniGameOpen,
      closeDialogOpen, setCloseDialogOpen,
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}
