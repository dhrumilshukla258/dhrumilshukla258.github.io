import ContactCode from '@/components/widgets/ContactCode';
import { ContactForm } from '@/components/widgets/ContactForm';
import { contactItems } from '@/data/contacts';
import { usePersonality } from '@/components/context/PersonalityContext';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const { personality } = usePersonality();

  if (personality === 'professional') {
    return (
      <div className={styles.layout}>
        <h1 className={styles.pageTitleLeft}>Contact</h1>
        <p className={styles.pageSubtitleLeft}>
          Open to new opportunities, collaborations, and connections.
          Feel free to reach out through any channel below.
        </p>
        <div className={styles.proContainer}>
          {contactItems.map((item) => (
            <a
              key={item.social}
              href={item.href}
              target="_blank"
              rel="noopener"
              className={styles.proContactItem}
            >
              <span className={styles.proContactLabel}>{item.social}</span>
              <span className={styles.proContactValue}>{item.link}</span>
              <span className={styles.proContactArrow}>→</span>
            </a>
          ))}
        </div>
        <ContactForm />
      </div>
    );
  }

  if (personality === 'gamer') {
    return (
      <div className={styles.layout}>
        <h1 className={styles.gamerContactTitle}>📡 CHOOSE COMMUNICATION METHOD</h1>
        <p className={styles.pageSubtitle}>Select your channel, traveler.</p>
        <div className={styles.container}>
          <div className={styles.gamerMenuList}>
            {contactItems.map((item, i) => (
              <a
                key={item.social}
                href={item.href}
                target="_blank"
                rel="noopener"
                className={styles.gamerMenuItem}
              >
                <span className={styles.gamerMenuNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.gamerMenuLabel}>{item.social.toUpperCase()}</span>
                <span className={styles.gamerMenuValue}>{item.link}</span>
                <span className={styles.gamerMenuArrow}>▸</span>
              </a>
            ))}
          </div>
        </div>
        <ContactForm />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <h1 className={styles.pageTitle}>contact.js</h1>
      <p className={styles.pageSubtitle}>
        {'// Reach out through any of the following channels'}
      </p>
      <div className={styles.container}>
        <div className={styles.contactContainer}>
          <ContactCode />
        </div>
      </div>
      <div className={styles.container}>
        <ContactForm />
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: { title: 'Contact' },
  };
}

export default ContactPage;
