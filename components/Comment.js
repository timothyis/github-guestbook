import { format } from 'date-fns'

function Comment({id, user, comment, updated, loggedInId, handleDelete, ...props}) {
  return (
    <div className="comment" {...props}>
      <a href={`https://github.com/${user}`} className="avatar">
        <img src={`https://avatars.githubusercontent.com/${user}?size=128&v=4`} alt={`${user}'s avatar`}/>
      </a>
      <div className="comment-content">
        <div className="comment-header">
          <a href={`https://github.com/${user}`} className="user">
            <h4>{ user }</h4>
          </a>
          <span className="updated-date">
            { format(Date.parse(updated), 'MMMM Do YYYY') }
          </span>
          {loggedInId === id  && (
            <span className="delete">
              - {' '}
              <a onClick={handleDelete}>
                Delete
              </a>
            </span>
          )}

        </div>
        <div className="comment-body">
          <p>{ comment }</p>
        </div>
      </div>

      <style jsx>{`
        .comment {
          border-radius: 5px;
          box-shadow: rgba(0, 0, 0, 0.1) 0px 6px 12px;
          display: grid;
          grid-template-columns: 96px 1fr;
          margin-bottom: 24px;
        }

        .avatar {
          width: 64px;
          height: 64px;
          margin: 16px;
          border-radius: 5px;
          overflow: hidden;
        }

        .user {
          flex: 1 0 auto;
        }

        .comment-content {
          box-sizing: border-box;
          color: #333;
          display: flex;
          flex-direction: column;
          padding: 16px;
        }

        h4 {
          margin: 0;
        }

        a {
          border-bottom: none;
          cursor: pointer;
        }

        a:hover {
          border-bottom: none;
        }

        .comment-header {
          display: flex;
          height: fit-content;
          justify-content: space-between;
          width: 100%;
        }

        .delete {
          margin-left: 4px;
        }
      `}</style>
    </div>
  )
}

export default Comment
