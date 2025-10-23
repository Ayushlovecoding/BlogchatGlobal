import { PostCard } from '../components/PostCard';
import { useTitle } from "../hooks/useTitle";
import { getDocs, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";

export const HomePage = () => {
  
  const [posts, setPosts] = useState([]);
  const [toggle, setToggle] = useState(false);
  useTitle("Home");
  const postsRef = collection(db, "post");
    
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
  }, [toggle]); // Changed from [postsRef, toggle] to just [toggle]
  
  return (
    <section>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} toggle={toggle} setToggle={setToggle} />
      ))}
    </section>
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
