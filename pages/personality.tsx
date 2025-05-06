import PersonalityInfo from '@/components/PersonalityInfo';
import styles from '@/styles/SettingsPage.module.css';


const PersonalityPage = () => {
  return (

        <div className={styles.layout}>
            <h1 className={styles.title}>Choose my personality</h1>
            <div className={styles.subtitle}>This will be reflected everywhere in the site</div>
        <div className={styles.container}>
        
            <PersonalityInfo
            imagepath="/personality/personality-1.png"
            personality="professional"
            buttontext="Professional"
            />
            <PersonalityInfo
            imagepath="/personality/personality-2.png"
            personality="playful"
            buttontext="Playful"
            />
            <PersonalityInfo
            imagepath="/personality/personality-3.png"
            personality="technical"
            buttontext="Technical"
            />
            <PersonalityInfo
            imagepath="/personality/personality-4.png"
            personality="casual"
            buttontext="Casual"
            />
            <PersonalityInfo
            imagepath="/personality/personality-5.png"
            personality="narrative"
            buttontext="Narrative"
            />
        </div>
        </div>
  );
};

export async function getStaticProps() {
  return {
    props: { title: 'Personality' },
  };
}

export default PersonalityPage;
