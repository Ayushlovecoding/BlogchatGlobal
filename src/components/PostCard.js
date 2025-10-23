import { doc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useState } from "react";

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
    </div>
  )
}


// import { doc, deleteDoc } from "firebase/firestore";
// import { auth, db } from "../firebase/config";

// export const PostCard = ({post,toggle, setToggle}) => {
//   const {id,title,description,author}=post;
//   const isAuth = JSON.parse(localStorage.getItem("isAuth"));
   
//   async function handleDelete(){
//       const document = doc(db, "post", id);
//       await deleteDoc(document);
//       setToggle(!toggle);
//     }

//   return (
//     <div className='card'>
//       <p className="title">{title}</p>
//       <p className="description">{description}</p>
//       <p className="control">
//        <span className="author">{author.name}</span>
//           { isAuth && (author.id === auth.currentUser.uid) && <span onClick={handleDelete} className="delete"><i className="bi bi-trash3"></i></span> }
//       </p>
//     </div>
//   )
// }






// export const PostCard = ({post, toggle, setToggle}) => {
//     const {id, title, description, author} = post;
//     const isAuth = JSON.parse(localStorage.getItem("isAuth"));

//     async function handleDelete(){
//       const document = doc(db, "posts", id);
//       await deleteDoc(document);
//       setToggle(!toggle);
//     }

//   return (
//     <div className="card">
//         <p className="title">{title}</p>
//         <p className="description">{description}</p>
//         <p className="control">
//             
//         </p>
//     </div>
//   )
// }
