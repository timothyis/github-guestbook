// Dependencies
import { useEffect } from 'react'
import fetch from 'isomorphic-unfetch'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import Head from 'next/head'
import Link from 'next/link'
import { withRouter } from 'next/router'

// Components
import Comment from '../components/Comment'

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
  useEffect(() => {
    if (router.query.token) {
      router.replace('/', '/', { shallow: true })
    }

    if (router.query.page > pageCount) {
      router.replace({pathname: router.pathname, query: Object.assign(router.query, {page: pageCount})}, { shallow: true})
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

  const page = parseInt(router.query.page) || 1

  const previousParams = {
    ...(router.query.limit && { limit: router.query.limit }),
    ...((page - 1 >= 1 && { page: page - 1}) || (page - 1 === 1 && null))
  }

  const nextParams = {
    ...(router.query.limit && { limit: router.query.limit }),
    ...(page + 1 <= pageCount && { page: page + 1})
  }

  const esc = encodeURIComponent;
  const buildParams = (params) => Object.keys(params)
      .map(k => esc(k) + '=' + esc(params[k]))
      .join('&');

  const nextPageLink = `/?${buildParams(nextParams)}`
  const previousPageLink = `/?${buildParams(previousParams)}`

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
          <div className="comments-list">
            {guestbook.map(g => (
              <Comment
                id={g.id}
                loggedInId={id}
                comment={g.comment}
                user={g.user}
                updated={g.updated}
                key={g.id}
                handleDelete={handleDelete}
                />
            ))}
          </div>
        </>
      )}
      {
      }

      <nav>
        {previousParams.page && (
          <Link prefetch href={previousPageLink}>
            <a>Previous</a>
          </Link>
        )}
        {nextParams.page && (
          <Link prefetch href={nextPageLink}>
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

        .comments-list {
          margin-left: 0;
        }

        ul li::before {
          content: '';
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

        .next {
          margin-left: auto;
        }
      `}</style>
    </>
  );
}

export default withRouter(HomePage)