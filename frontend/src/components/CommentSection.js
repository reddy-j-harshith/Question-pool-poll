import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Config from '../Config'; // Import your configuration for the baseURL
import './CommentSection.css';
import AuthContext from './AuthContext';

function CommentSection() {
  const { questionId } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { authTokens } = useContext(AuthContext);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${Config.baseURL}/api/comments/${questionId}/`, {
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

  useEffect(() => {
    // Fetch comments when the component mounts
    fetchComments();
  }, [questionId, authTokens]);

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
          setNewComment('');
          fetchComments(); // Fetch the latest comments after submitting a new one
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
