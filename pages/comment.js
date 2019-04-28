import fetch from "isomorphic-unfetch";
import Head from "next/head";

function CommentPage({ host, query }) {
  const handleSubmit = async e => {
    e.preventDefault();
    const { id, name, picture } = query;
    await fetch(`${host}/api/auth/sign`, {
      method: "POST",
      body: JSON.stringify({
        comment: e.target.comment.value,
        id,
        name,
        picture
      })
    });
    window.location = "/";
  };
  return (
    <>
      <Head>
        <title>Add Comment</title>
        <link
          rel="stylesheet"
          href="https://css.zeit.sh/v1.css"
          type="text/css"
        />
      </Head>
      <h1>Leave a Comment</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="comment" />
        <button type="submit">Add Comment</button>
      </form>
      <style jsx>{`
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

CommentPage.getInitialProps = async ({ req, query }) => {
  const host = req ? `https://${req.headers.host}` : "";
  return { host, query };
};

export default CommentPage;
