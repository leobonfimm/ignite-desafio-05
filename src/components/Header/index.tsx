import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={commonStyles.container}>
      <div className={styles.headerContent}>
        <img src="/Logo.svg" alt="Logo" />
      </div>
    </header>
  );
}
