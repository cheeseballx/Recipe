import { useState } from 'react';
import { Link } from 'react-router-dom';

import './creator.css'

const URL = "http://127.0.0.1:3002/v1/Recipe/";

function Creator (){

  const [ name, setName ] = useState("");
  const [ long, setLong ] = useState("");
  const [ description, setDescription ] = useState("");

  function createRecipe(){
    fetch(`${URL}?name=${name}&longname=${long}&description=${description}`, {method:"POST"})
      .then(response => response.json())
      .then(data => console.log(data));
  }


  return (
    <div>
      <h2>Create a Recipe</h2>

      <p>give it a title / name</p>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

      <p>give it a longer name, subName </p>
      <input type="text" value={long} onChange={(e) => setLong(e.target.value)} />

      <p>Description</p>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

      <p>next steps</p>
      <button onClick={createRecipe}>Just Create this Recipe</button>
      <button>Create and go to details</button>

      <p>back to overview</p>

      <Link to="/">X</Link>
    </div>

  );
}

export default Creator;
