import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiUser, FiCalendar } from 'react-icons/fi';

import { useState } from 'react';
import Link from 'next/link';
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

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  const handlePagination = async (): Promise<void> => {
    const response = await fetch(postsPagination.next_page);

    const { results } = await response.json();

    const newPosts = [...posts, results];

    console.log(response);
  };

  return (
    <>
      <Head>
        <title>Home | Space Traveling</title>
      </Head>

      <main className={`${commonStyles.container} ${styles.container}`}>
        <div>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`}>
              <a key={post.uid} className={styles.post}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>

                <div>
                  <FiCalendar size={20} />
                  <time>{post.first_publication_date}</time>

                  <FiUser size={20} />
                  <p>{post.data.author}</p>
                </div>
              </a>
            </Link>
          ))}
        </div>

        <div className={styles.containerHandleActions}>
          {postsPagination.next_page && (
            <button type="button" onClick={handlePagination}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 2,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-Br', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    },
  };
};
