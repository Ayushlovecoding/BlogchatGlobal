import { doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";

export const PostCard = ({post, toggle, setToggle}) => {
  const {id, title, description, author, reactions = {}} = post;
  const isAuth = JSON.parse(localStorage.getItem("isAuth"));
  
  // State to track user's reactions
  const [userReactions, setUserReactions] = useState(reactions);
  
  async function handleDelete(){
    const document = doc(db, "post", id);
    await deleteDoc(document);
    setToggle(!toggle);
  }

  async function handleReaction(reactionType){
    if (!isAuth) {
      alert("Please login to react!");
      return;
    }

    const userId = auth.currentUser.uid;
    const postRef = doc(db, "post", id);
    
    // Get current reactions for this type
    const currentReactions = userReactions[reactionType] || [];
    const hasReacted = currentReactions.includes(userId);

    try {
      if (hasReacted) {
        // Remove reaction
        await updateDoc(postRef, {
          [`reactions.${reactionType}`]: arrayRemove(userId)
        });
        setUserReactions({
          ...userReactions,
          [reactionType]: currentReactions.filter(id => id !== userId)
        });
      } else {
        // Add reaction
        await updateDoc(postRef, {
          [`reactions.${reactionType}`]: arrayUnion(userId)
        });
        setUserReactions({
          ...userReactions,
          [reactionType]: [...currentReactions, userId]
        });
      }
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  }

  const getReactionCount = (type) => {
    return userReactions[type]?.length || 0;
  };

  const hasUserReacted = (type) => {
    if (!isAuth) return false;
    return userReactions[type]?.includes(auth.currentUser.uid) || false;
  };

  // Comments state + UI
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  
  // ✅ FIX: Get socket from the context object
  const { socket } = useSocket();

  useEffect(() => {
    let mounted = true;

    const handleRemoteComment = (payload) => {
      if (!mounted) return;
      if (payload?.postId !== id) return;
      setComments((c) => [...c, payload.comment]);
    };

    // ✅ FIX: Add null check before using socket
    if (socket && commentsOpen) {
      socket.emit('joinPost', id);
      socket.on('comment:new', handleRemoteComment);
    }

    return () => {
      mounted = false;
      // ✅ FIX: Add null check in cleanup
      if (socket) {
        socket.emit('leavePost', id);
        socket.off('comment:new', handleRemoteComment);
      }
    };
  }, [socket, commentsOpen, id]);

  const fetchComments = async () => {
    try {
      const commentsRef = collection(db, 'post', id, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.warn('Failed to fetch comments', err.message || err);
    }
  };

  const handleToggleComments = async () => {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next) await fetchComments();
  };

  const handleAddComment = async () => {
    if (!isAuth) return alert('Please login to comment');
    if (!commentText.trim()) return;

    const newComment = {
      text: commentText.trim(),
      author: { id: auth.currentUser.uid, name: auth.currentUser.displayName || 'Anonymous' },
      createdAt: new Date().toISOString()
    };

    try {
      // Persist to Firestore
      const commentsRef = collection(db, 'post', id, 'comments');
      await addDoc(commentsRef, newComment);

      // ✅ FIX: Add null check before emitting
      if (socket) {
        socket.emit('comment:create', { postId: id, comment: newComment });
      }

      // Optimistically add locally
      setComments((c) => [...c, newComment]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment', err);
      alert('Could not add comment');
    }
  };

  return (
    <div className='card'>
      <p className="title">{title}</p>
      <p className="description">{description}</p>
      <p className="control">
        <span className="author">{author.name}</span>
        
        {/* Reaction Emojis */}
        <span className="reactions">
          <button 
            className={`reaction-btn ${hasUserReacted('like') ? 'active' : ''}`}
            onClick={() => handleReaction('like')}
            title="Like"
          >
            <i className="bi bi-heart-fill"></i>
            {getReactionCount('like') > 0 && <span className="count">{getReactionCount('like')}</span>}
          </button>

          <button 
            className={`reaction-btn ${hasUserReacted('smile') ? 'active' : ''}`}
            onClick={() => handleReaction('smile')}
            title="Smile"
          >
            <i className="bi bi-emoji-smile-fill"></i>
            {getReactionCount('smile') > 0 && <span className="count">{getReactionCount('smile')}</span>}
          </button>

          <button 
            className={`reaction-btn ${hasUserReacted('laugh') ? 'active' : ''}`}
            onClick={() => handleReaction('laugh')}
            title="Laugh"
          >
            <i className="bi bi-emoji-laughing-fill"></i>
            {getReactionCount('laugh') > 0 && <span className="count">{getReactionCount('laugh')}</span>}
          </button>

          <button 
            className={`reaction-btn ${hasUserReacted('fire') ? 'active' : ''}`}
            onClick={() => handleReaction('fire')}
            title="Fire"
          >
            <i className="bi bi-fire"></i>
            {getReactionCount('fire') > 0 && <span className="count">{getReactionCount('fire')}</span>}
          </button>

          <button 
            className={`reaction-btn ${hasUserReacted('clap') ? 'active' : ''}`}
            onClick={() => handleReaction('clap')}
            title="Clap"
          >
            <i className="bi bi-hand-thumbs-up-fill"></i>
            {getReactionCount('clap') > 0 && <span className="count">{getReactionCount('clap')}</span>}
          </button>
        </span>

        {/* Delete button (only for post owner) */}
        {isAuth && (author.id === auth.currentUser.uid) && 
          <span onClick={handleDelete} className="delete">
            <i className="bi bi-trash3"></i>
          </span>
        }
      </p>

      {/* Comments section */}
      <div className="comments">
        <button className="btn" onClick={handleToggleComments} style={{marginTop:8,
        backgroundColor: '#7c3aed',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 20px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
      transition: 'all 0.2s ease'
      }}>
          {commentsOpen ? 'Hide Comments' : 'Show Comments'}
        </button>

        {commentsOpen && (
          <div className="comments-area">
            <div className="comments-list">
              {comments.map((c, idx) => (
                <div key={c.id || idx} className="comment">
                  <strong>{c.author?.name || 'Unknown'}</strong>
                  <p>{c.text}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="muted">No comments yet — be first!</p>}
            </div>

            <div className="comment-form">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{width:'80%'}}
              />
              <button className="btn" onClick={handleAddComment} style={{marginLeft:8}}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}