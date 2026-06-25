import { useMenu } from '@/components/MenuContext';
import { usePersonality } from '@/components/PersonalityContext';
import { REPO_URL } from '@/data/owner';
import styles from '@/styles/CloseDialog.module.css';

const CONTENT = {
  professional: {
    icon: '⚠️',
    title: 'Close Portfolio?',
    body: 'Your recruiter session will be terminated.\nAny unsaved impressions will be lost.',
    confirm: 'Close Anyway',
    cancel: 'Stay',
  },
  gamer: {
    icon: '🎮',
    title: 'QUIT TO DESKTOP?',
    body: 'PLAYER progress will not be saved to the cloud.\nAre you sure you want to exit this questline?',
    confirm: 'QUIT GAME',
    cancel: 'KEEP PLAYING',
  },
  technical: {
    icon: null,
    title: '$ kill -9 <portfolio_pid>',
    body: 'SIGKILL will terminate the current session.\nUncommitted impressions will be lost.\n\nProceed? [y/N]',
    confirm: 'y',
    cancel: 'N (abort)',
  },
};

export function CloseDialog() {
  const { closeDialogOpen, setCloseDialogOpen } = useMenu();
  const { personality } = usePersonality();

  if (!closeDialogOpen) return null;

  const C = CONTENT[personality];

  const handleClose = () => {
    setCloseDialogOpen(false);
    // Try to close the tab; if that fails, go to GitHub profile
    window.close();
    setTimeout(() => {
      window.location.href = REPO_URL;
    }, 300);
  };

  return (
    <div className={`${styles.overlay} ${styles[personality]}`} onClick={() => setCloseDialogOpen(false)}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        {C.icon && <div className={styles.icon}>{C.icon}</div>}
        <h2 className={styles.title}>{C.title}</h2>
        <pre className={styles.body}>{C.body}</pre>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleClose}>
            {C.confirm}
          </button>
          <button className={`${styles.btn} ${styles.btnCancel}`} onClick={() => setCloseDialogOpen(false)}>
            {C.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
