import React, { useState, useEffect, useContext } from 'react';
import Config from '../Config'; // Import your configuration for the baseURL
import './CommentSection.css';
import AuthContext from './AuthContext';

function CommentSection({ questionId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    // Fetch comments when the component mounts
    const fetchComments = async () => {
      try {
        const response = await fetch(`${Config.baseURL}/api/comments/${questionId}/`, { // Updated URL
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authTokens?.access}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setComments(data);
        } else {
          console.error('Failed to fetch comments:', response.status);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [questionId]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (newComment) {
      try {
        const response = await fetch(`${Config.baseURL}/api/add-comment/${questionId}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authTokens?.access}`,
          },
          body: JSON.stringify({ comment_text: newComment }),
        });

        if (response.ok) {
          const data = await response.json();
          setComments([...comments, data]);
          setNewComment('');
        } else {
          console.error('Failed to submit comment:', response.status);
        }
      } catch (error) {
        console.error('Error submitting comment:', error);
      }
    }
  };

  return (
    <div className="comment-section">
      <h2>Comments</h2>
      <div className="comments-list">
        {comments.map(comment => (
          <div className="comment" key={comment.id}>
            {comment.comment_text}
          </div>
        ))}
      </div>
      <div className="comment-form">
        <textarea
          value={newComment}
          onChange={handleCommentChange}
          placeholder="Add a comment..."
        />
        <button onClick={handleCommentSubmit}>Submit</button>
      </div>
    </div>
  );
}

export default CommentSection;
