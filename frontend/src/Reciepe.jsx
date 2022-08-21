import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

const URL = "http://127.0.0.1:3002/v1/Recipe/";

function Recipe() {

    const id = useParams().id;
    const [data,setData] = useState({})

    useEffect(() => {
        fetch(URL + id)
            .then(response => response.json())
            .then(result => setData(result));
  },[id]);

  return !data ? <div>wait</div> :(
    <div>
      <h1>{data.name}</h1>
      <h2>{data.longname}</h2>
      {data.images && data.images.map(pic => <img src={"img"+pic.url} /> )}
      <h4>{data.description}</h4>

      {data.components && data.components.map(c=> {
        return <p key={c.id}>{c.amount} {c.ingrident.unit} {c.ingrident.name}</p>
      })}


      <Link to="/">X</Link>
    </div>

  );
}

export default Recipe;
