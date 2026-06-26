import styles from './ContactCode.module.css';
import {contactItems} from '@/data/contacts'

const ContactCode = () => {
  return (
    <div className={styles.code}>
      <p className={styles.line}>
        <span className={styles.keyword}>var </span>
        <span className={styles.className}>socials = <span className={styles.keyword}>new</span> </span> &#123;
      </p>
      {contactItems.map((item, index) => (
        <p className={styles.line} key={index}>
          &nbsp;{item.social} = {' '}
          <a href={item.href} target="_blank" rel="noopener">
            &quot;{item.link}&quot;
          </a>,
        </p>
      ))}
      <p className={styles.line}>&#125;;</p>
    </div>
  );
};

export default ContactCode;