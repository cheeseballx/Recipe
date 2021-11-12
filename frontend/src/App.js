import './App.css';
import { useEffect, useState } from 'react';

const RecipeID = "1010";
const URL = "http://127.0.0.1:3002/v1/Recipe/" + RecipeID;

function App() {

  const [data,setData] = useState({})

  useEffect(() => {
    fetch(URL)
    .then(response => response.json())
    .then(result => setData(result));
  },[]);

  return (
    <div>
      <h1>{data.name}</h1>
      <h2>{data.longname}</h2>
      <h4>{data.description}</h4>

      {data.components && data.components.map(c=> {
        return <p key={c.id}>{c.amount} {c.ingrident.unit} {c.ingrident.name}</p>
      })}
    </div>
  );
}

export default App;
