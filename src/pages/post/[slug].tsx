import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';

import { useMemo } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    <h1>Carregando...</h1>;
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));

    return total;
  }, 0);

  const averageReading = useMemo(() => {
    return `${Math.ceil(totalWords / 200).toString()} min`;
  }, [totalWords]);

  return (
    <>
      <img
        className={styles.backgroundImg}
        src="https://geomarvel.com/wp-content/uploads/2017/07/roman-synkevych-vXInUOv1n84-unsplash.jpg"
        alt=""
      />

      <main className={commonStyles.container}>
        <div className={styles.headerArticle}>
          <h1>{post.data.title}</h1>
          <div className={styles.readingInfo}>
            <div>
              <FiCalendar size={20} />
              <time>{post.first_publication_date}</time>
            </div>

            <div>
              <FiUser size={20} />
              <span>{post.data.author}</span>
            </div>

            <div>
              <FiClock size={20} />
              <time>{averageReading}</time>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
    }
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    data: {
      author: response.data.author,
      title: response.data.title,
      subtitle: response.data.subtitle,
      content: response.data.content.map(item => ({
        heading: item.heading,
        body: [...item.body],
      })),
      banner: {
        url: response.data.banner.url,
      },
    },
    uid: response.uid,
    first_publication_date: new Date(
      response.first_publication_date
    ).toLocaleDateString('pt-Br', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };

  return {
    props: {
      post,
    },
  };
};
