import fetch from 'isomorphic-unfetch';
import { parseCookies, setCookie, destroyCookie } from 'nookies';
import Head from 'next/head';
import Link from 'next/link';

function HomePage({ baseURL, guestbook, id, login, token }) {
  const handleSubmit = e => {
    e.preventDefault();
  };
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
      <header>
        <h1>GitHub Guestbook</h1>
        <Link
          href={
            !token ? `${baseURL}/api/auth?provider=github` : `/?token=logout`
          }
        >
          <a>
            <button>
              {token !== undefined ? 'Logout' : 'Login With GitHub'}
            </button>
          </a>
        </Link>
      </header>
      {token && (
        <>
          <h2>Hello, {login}, want to sign the guestbook?</h2>
          <form onSubmit={handleSubmit}>
            <input id="comment" name="comment" />
            <button type="submit">Sign</button>
          </form>
        </>
      )}
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
        header {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }
        ul {
          margin-left: 0;
        }
        ul li::before {
          content: '';
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
        form {
          display: flex;
          width: 100%;
        }
        input {
          flex-grow: 100;
          margin-right: 20px;
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
  if (query.token === 'logout') {
    destroyCookie(ctx, 'token');
    destroyCookie(ctx, 'id');
    destroyCookie(ctx, 'name');
  }
  if (query.id) {
    await setCookie(ctx, 'id', query.id, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });
    await setCookie(ctx, 'login', query.login, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });
  }
  if (query.token && query.token !== 'logout') {
    await setCookie(ctx, 'token', query.token, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });
  }
  const { id, login, token } = await parseCookies(ctx);
  const guestbook = [];
  return { baseURL, guestbook, id, login, token };
};

export default HomePage;
