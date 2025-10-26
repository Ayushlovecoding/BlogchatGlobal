import {addDoc,collection} from "firebase/firestore";
import {db,auth} from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useTitle } from "../hooks/useTitle";

export const CreatePost = () => {
  const navigate = useNavigate();
  useTitle("create post");
  const postRef = collection(db,"post");


  async function handleCreatePost (event){
    event.preventDefault();
    // console.log(auth);
    const document ={
      title: event.target.title.value,
      description: event.target.description.value,
      author:{
        name:auth.currentUser.displayName ,
        id:auth.currentUser.uid
      }
    }
    try {
      await addDoc(postRef, document);
      navigate("/");
      alert("Post created successfully!");
      event.target.reset(); // clear form
    } catch (error) {
      console.error("Error creating post:", error);
    }
    
  }

  return (
    <section className="create">
      <div className="heading">
        <h1>Add new Post</h1>
      </div>
      <form  className="createPost" onSubmit={handleCreatePost}>
        <input className="title" type="text" name="title" placeholder='title' maxLength='50' required />
        <textarea type='text' name="description" className="description" placeholder='Description' maxLength='600' required></textarea>
        <button type='submit' className='submit'>Create</button>
      </form>
    </section>
  )
}


