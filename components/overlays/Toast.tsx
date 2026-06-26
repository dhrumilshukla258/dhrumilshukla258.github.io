import { useMenu } from '@/components/context/MenuContext';
import styles from './Toast.module.css';
import { VscCheck, VscError, VscInfo } from 'react-icons/vsc';

const icons = {
  success: <VscCheck />,
  error: <VscError />,
  info: <VscInfo />,
};

export function ToastContainer() {
  const { toasts, removeToast } = useMenu();

  return (
    <div className={styles.container}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type ?? 'info']}`}
          onClick={() => removeToast(t.id)}
        >
          <span className={styles.icon}>{icons[t.type ?? 'info']}</span>
          <span className={styles.message}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
