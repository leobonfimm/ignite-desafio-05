import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import Head from 'next/head';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { Comment } from '../../components/Comment';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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

interface PostNeighborhood {
  title: string;
  uid: string;
}
interface PostProps {
  post: Post;
  preview: boolean;
  prevPost: PostNeighborhood;
  nextPost: PostNeighborhood;
}

export default function Post({
  post,
  preview,
  nextPost,
  prevPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h2>Carregando...</h2>;
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));

    return total;
  }, 0);

  const averageReading = `${Math.ceil(totalWords / 200).toString()} min`;

  const formattedDate = format(
    parseISO(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const formattedUpdatedDate = format(
    parseISO(post.last_publication_date),
    "'* editado em 'dd MMM yyyy', às 'hh:mm",
    {
      locale: ptBR,
    }
  );

  return (
    <>
      <Head>
        <title>{post.data.title} | Space Traveling</title>
      </Head>

      <Header />

      {post.data.banner.url && (
        <img
          className={styles.backgroundImg}
          src={post.data.banner.url}
          alt={post.data.title}
        />
      )}

      <main className={commonStyles.container}>
        <article className={styles.container}>
          <div className={styles.headerArticle}>
            <h1>{post.data.title}</h1>
            <div className={styles.readingInfo}>
              <div>
                <FiCalendar size={20} />
                <time>{formattedDate}</time>
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

            <p>{formattedUpdatedDate}</p>
          </div>

          {post.data.content.map(({ heading, body }) => (
            <div key={heading} className={styles.postContent}>
              {heading && <h2>{heading}</h2>}

              <div
                className={styles.postSection}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
              />
            </div>
          ))}
        </article>

        <div className={styles.separator} />

        <div className={styles.prevNextPost}>
          <div>
            {prevPost && (
              <>
                <p>{prevPost.title}</p>
                <Link href={`/post/${prevPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </>
            )}
          </div>

          <div>
            {nextPost && (
              <>
                <p>{nextPost.title}</p>
                <Link href={`/post/${nextPost.uid}`}>
                  <a>Próximo post</a>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={styles.comment}>
          <Comment />
        </div>

        {preview && (
          <Link href="/api/exit-preview">
            <a className={commonStyles.buttonPreview}>Sair do modo Preview</a>
          </Link>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 3,
    }
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('post', String(slug), {});

  const postPrevious = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: response.uid,
      orderings: '[document.first_publication_date]',
    }
  );

  const postNext = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: response.uid,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const post = {
    data: {
      author: response.data.author,
      title: response.data.title,
      subtitle: response.data.subtitle,
      content: response.data.content,
      banner: { url: response.data.banner.url },
    },
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
  };

  return {
    props: {
      post,
      preview,
      prevPost:
        slug === postPrevious.results[0].uid
          ? null
          : {
              title: postPrevious.results[0]?.data?.title,
              uid: postPrevious.results[0]?.uid,
            },
      nextPost:
        slug === postNext.results[0].uid
          ? null
          : {
              title: postNext.results[0]?.data?.title,
              uid: postNext.results[0]?.uid,
            },
    },
  };
};
