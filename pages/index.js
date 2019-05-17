import { useEffect } from 'react'
import fetch from 'isomorphic-unfetch'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { format } from 'date-fns'
import Head from 'next/head'
import Link from 'next/link'
import { withRouter } from 'next/router'

HomePage.getInitialProps = async ctx => {
  const { req, query } = ctx
  const protocol = req
    ? `${req.headers['x-forwarded-proto']}:`
    : location.protocol
  const host = req ? req.headers['x-forwarded-host'] : location.host
  const baseURL = `${protocol}//${host}`
  const guestbookRequest = await fetch(
    `${baseURL}/api/guestbook?page=${query.page || 1}&limit=${query.limit || 5}`
  )
  const { guestbook, pageCount } = await guestbookRequest.json()
  const existing = guestbook.find(
    s => s.id === parseInt(query.id || parseCookies(ctx).id)
  )

  if (query.token === 'logout') {
    destroyCookie(ctx, 'token')
    destroyCookie(ctx, 'id')
    destroyCookie(ctx, 'name')
    return { baseURL, existing, guestbook }
  }

  if (query.id) {
    await setCookie(ctx, 'id', query.id, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    })
    await setCookie(ctx, 'login', query.login, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    })

    if (query.token && query.token !== 'logout') {
      await setCookie(ctx, 'token', query.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      })
    }

    const { id, login, token } = query
    return { baseURL, existing, guestbook, id, login, pageCount, token }
  }
  const { id, login, token } = await parseCookies(ctx)
  return { baseURL, existing, guestbook, id, login, pageCount, token }
}


HomePage.componentDidMount = ({ router }) => {
}

function HomePage({
  baseURL,
  existing,
  guestbook,
  id,
  login,
  pageCount,
  token,
  router
}) {

  console.log()

  useEffect(() => {
    if (router.query.token) {
      router.replace('/', '/', { shallow: true })
    }
  })

  const handleSubmit = async e => {
    e.preventDefault()
    const comment = e.target.comment.value

    await fetch(`${baseURL}/api/guestbook/sign.js`, {
      method: 'PATCH',
      body: JSON.stringify({
        comment,
        id,
        token,
        user: login
      })
    })

    router.replace('/')
  }

  const handleDelete = async () => {
    await fetch(`${baseURL}/api/guestbook/delete.js?id=${id}`, {
      method: 'DELETE'
    })
    router.replace('/')
  }

  const page = 1

  return (
    <>
      <Head>
        <title>GitHub Guestbook</title>
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
            !token ? `${baseURL}/api/auth/index.js` : `/?token=logout`
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
          <h3>
            Hello, {login},{' '}
            {!!existing
              ? 'want to update your signature?'
              : 'want to sign the guestbook?'}
          </h3>
          <form onSubmit={handleSubmit}>
            <input id="comment" name="comment" />
            <button type="submit">Sign</button>
          </form>
        </>
      )}
      {guestbook.length >= 1 && (
        <>
          <h2>Signatures</h2>
          <ul>
            {guestbook.map(g => (
              <li key={g.id}>
                <Link href={`https://github.com/${g.user}`}>
                  <a className="comment">
                    <img src={`https://avatars.githubusercontent.com/${g.user}`} />
                  </a>
                </Link>
                <div className="description">
                  <div className="row">
                    <h4>{g.user}</h4>
                    <div className="time">
                      { format(Date.parse(g.updated), 'MMMM Do YYYY') }
                    </div>
                  </div>
                  <div className="row">
                    <p>{g.comment}</p>
                    {id == g.id && (
                      <button className="delete" onClick={handleDelete}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <nav>
        {page > 1 && (
          <Link prefetch href={`/?page=${page - 1}&limit=5`}>
            <a>Previous</a>
          </Link>
        )}
        {page < pageCount && (
          <Link prefetch href={`/?page=${page + 1}&limit=5`}>
            <a className="next">Next</a>
          </Link>
        )}
      </nav>
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
        li {
          border-radius: 5px;
          box-shadow: rgba(0, 0, 0, 0.1) 0px 6px 12px;
          display: grid;
          grid-template-columns: 150px 1fr;
          height: 150px;
          margin-bottom: 24px;
        }
        a {
          border-bottom: none;
        }
        a:hover {
          border-bottom: none;
        }
        img {
          border-bottom-left-radius: 5px;
          border-top-left-radius: 5px;
          height: 100%;
          width: 100%;
        }
        h4 {
          margin: 0;
        }
        form {
          display: flex;
          width: 100%;
        }
        input {
          flex-grow: 100;
          margin-right: 20px;
        }
        nav {
          display: flex;
          justify-content: space-between;
        }
        .comment {
          width: 150px;
        }
        .description {
          box-sizing: border-box;
          color: #333;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1em;
        }
        .row {
          display: flex;
          height: fit-content;
          justify-content: space-between;
          width: 100%;
        }
        .delete {
          align-self: center;
          height: 37px;
          min-width: fit-content;
          max-width: fit-content;
        }
        .next {
          margin-left: auto;
        }
      `}</style>
    </>
  );
}

export default withRouter(HomePage)