import NotFound from "../assets/images/page-not-found.jpg";
import { Link } from "react-router-dom";
import { useTitle } from "../hooks/useTitle";

 export const PageNotFound = () => {
  useTitle("Page not found");
  return (
    <section className='pageNotFound'>
      <p>404/ Page Not Found</p>
      <img src={NotFound} alt="Page Not Found" />
      <Link to='/'>
        <button>Back to Home</button>
      </Link>
    </section>
  )
}






// import { useTitle } from "../hooks/useTitle";
 

// export const PageNotFound = () => {
//   useTitle("Page Not Found");

//   return (
//     <section className="pageNotFound">
//       <p>404 / Page Not Found</p>
//       <img src={NotFound} alt="Page Not Found" />
//       <Link to="/">
//         <button>Back To Home</button>
//       </Link>
//     </section>
//   )
// }
