import { PostCard } from '../components/PostCard';
import { useTitle } from "../hooks/useTitle";
import { getDocs, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { auth } from "../firebase/config";
import Chat from "../components/Chat";
import { useSocket } from "../contexts/SocketContext";
import { onAuthStateChanged } from "firebase/auth"; // ✅ ADD THIS

export const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // ✅ ADD THIS
  const { connectUser } = useSocket();
  useTitle("Home");
  const postsRef = collection(db, "post");

   // ✅ ADD THIS: Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        connectUser({
          username: user.displayName || user.email
        });
      }
    });

    return () => unsubscribe();
  }, [connectUser]);
  
  useEffect(() => {
    async function getPosts(){
      const data = await getDocs(postsRef);
      setPosts(
        data.docs.map((document) => ({
          ...document.data(),
          id: document.id,
        }))
      ); 
    }
    getPosts();
  }, [postsRef,toggle]);

  useEffect(() => {
    if (auth.currentUser) {
      connectUser({
        username: auth.currentUser.displayName || auth.currentUser.email
      });
    }
  }, [connectUser]);
  
  return (
    <div className="home-container">
      <section className="posts-section">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} toggle={toggle} setToggle={setToggle} />
        ))}
      </section>

      {/* Chat Button and Panel */}
      {currentUser && (
        <>
          <button 
            className="chat-toggle-button"
            onClick={() => setShowChat(!showChat)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              padding: '15px 25px',
              backgroundColor: '#7e4ef0',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 1000,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>
              {showChat ? 'close' : 'chat'}
            </span>
            {showChat ? 'Close Chat' : 'Go Global Chat'}
          </button>

          {showChat && (
            <div 
              className="chat-panel"
              style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                bottom: '20px',
                width: '350px',
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
                zIndex: 999,
                overflow: 'hidden'
              }}
            >
              <Chat user={currentUser} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

// import { PostCard } from '../components/PostCard';
// import { useTitle } from "../hooks/useTitle";
// import {getDocs,collection} from "firebase/firestore";
// import {useEffect,useState} from "react";
// import { db } from "../firebase/config";

// export const HomePage = () => {
  
//   const [posts,setPosts] = useState([]);
//   const [toggle,setToggle] = useState(false);
//   useTitle("Home");
//   const postsRef = collection(db,"post")
    
//     useEffect(() => {
//       async function getPosts(){
//         const data = await getDocs(postsRef);
//         setPosts(
//           data.docs.map((document)=>({
//             ...document.data(),
//             id:document.id,
//           }))
//         ); 
//       }
//       getPosts();
//     },[postsRef,toggle]);
  
//   return (
//     <section>
//     {posts.map((post) => (
//        <PostCard key={post.id} post={post} toggle={toggle} setToggle={setToggle} />
//     ))}
//     </section>
//   )
// }
