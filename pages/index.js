import fetch from 'isomorphic-unfetch';
import { parseCookies, setCookie, destroyCookie } from 'nookies';
import Head from 'next/head';
import Link from 'next/link';

function HomePage({ baseURL, guestbook, token }) {
  return (
    <>
      <Head>
        <title>Serverless GitHub Guestbook</title>
        <link
          rel="stylesheet"
          href="https://css.zeit.sh/v1.css"
          type="text/css"
        />
      </Head>
      <h1>GitHub Guestbook</h1>
      <Link href={`${baseURL}/api/auth?provider=github`}>
        <a>
          <button>
            {token !== undefined ? 'Logged In' : 'Login With GitHub'}
          </button>
        </a>
      </Link>
      <Link href={`${baseURL}/logout`}>
        <a>
          <button>Logout</button>
        </a>
      </Link>
      <h2>Signatures</h2>
      <ul>
        {guestbook.length >= 1 &&
          guestbook.map(g => (
            <li>
              <Link href={`https://github.com/${g.name}`}>
                <a>
                  <img src={g.picture} />
                  <div className="description">
                    <h3>{g.name}</h3>
                    <p>{g.comment}</p>
                  </div>
                </a>
              </Link>
            </li>
          ))}
      </ul>
      <style jsx>{`
        ul {
          margin-left: 0;
        }
        ul li::before {
          content: '';
        }
        a {
          border-bottom: none;
          border-radius: 5px;
          box-shadow: rgba(0, 0, 0, 0.1) 0px 6px 12px;
          display: flex;
          height: 150px;
        }
        a:hover {
          border-bottom: none;
        }
        img {
          height: 100%;
        }
        h3 {
          margin: 0;
        }
        .description {
          color: #333;
          padding: 1em;
        }
      `}</style>
    </>
  );
}

HomePage.getInitialProps = async ctx => {
  const { req, query } = ctx;
  const protocol = req
    ? `${req.headers['x-forwarded-proto']}:`
    : location.protocol;
  const host = req ? req.headers['x-forwarded-host'] : location.host;
  const baseURL = `${protocol}//${host}`;
  // const request = `${baseURL}/api/guestbook`;
  // const res = await fetch(request);
  // const { guestbook } = await res.json();
  // return { guestbook, host };
  let token;
  if (query.token === 'logout') {
    destroyCookie(ctx, 'token');
  }
  if (query.token && query.token !== 'logout') {
    setCookie(ctx, 'token', query.token, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });
    token = query.token;
  }
  const guestbook = [];
  return { baseURL, guestbook, token };
};

export default HomePage;
