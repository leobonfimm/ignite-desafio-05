import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiUser, FiCalendar } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(): JSX.Element {
  return (
    <>
      <Head>
        <title>Space Traveling</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.post}>
          <strong>Como utilizar Hooks</strong>
          <p>Pensando em sincronização em vez de ciclos de vida.</p>

          <div>
            <FiCalendar size={20} />
            <time>19 Abr 2021</time>

            <FiUser size={20} />
            <p>Leonardo Bonfim</p>
          </div>

          <a href="/">Carregar mais posts</a>
        </div>
        <button type="button" className={styles.previewButton}>
          Sair do modo Preview
        </button>
      </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
