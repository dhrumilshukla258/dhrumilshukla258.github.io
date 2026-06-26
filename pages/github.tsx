import { useEffect, useState } from 'react';
import Image from 'next/image';
import GitHubCalendar from 'react-github-calendar';
import { VscRepo, VscPerson } from 'react-icons/vsc';

import RepoCard from '@/components/cards/RepoCard';
import { Repo, User } from '@/types';

import { owner } from '@/data/owner';
import styles from './GithubPage.module.css';

const GithubPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    async function fetchGitHubData() {
      const username = owner.github;
      if (!username) return;

      try {
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        const userData = await userRes.json();
        setUser(userData);

        const repoRes = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=6`);
        const repoData = await repoRes.json();
        setRepos(repoData);
      } catch (err) {
        console.error('Failed to fetch GitHub data:', err);
      }
    }

    fetchGitHubData();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className={styles.layout}>
      <div className={styles.pageHeading}>
        <h1 className={styles.pageTitle}>GitHub</h1>
        <p className={styles.pageSubtitle}>
          Browse through my GitHub repositories and see what I&apos;ve been
          working on. These are some of my public repositories showcasing
          various projects and skills.
        </p>
      </div>

      <div className={styles.githubPage}>
        <div className={styles.profileSection}>
          <div className={styles.profileInfo}>
            <Image
              src={user.avatar_url}
              className={styles.avatar}
              alt={user.login}
              width={100}
              height={100}
              priority
            />
            <div className={styles.userInfo}>
              <h2 className={styles.username}>{user.login}</h2>
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <VscRepo className={styles.statIcon} />
                  <span>{user.public_repos} repositories</span>
                </div>
                <div className={styles.statItem}>
                  <VscPerson className={styles.statIcon} />
                  <span>{user.followers} followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Popular Repositories</h3>
        </div>
        <div className={styles.reposContainer}>
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
        <div className={styles.contributions}>
          <GitHubCalendar
            username={owner.github}
            hideColorLegend
            hideMonthLabels
            colorScheme="dark"
            theme={{
              dark: ['#161B22', '#0e4429', '#006d32', '#26a641', '#39d353'],
              light: ['#161B22', '#0e4429', '#006d32', '#26a641', '#39d353'],
            }}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default GithubPage;
