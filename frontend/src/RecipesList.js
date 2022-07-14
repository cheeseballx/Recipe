import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const URL = "http://127.0.0.1:3002/v1/Recipe";

function RecipesList() {

  const [list,setList] = useState([])

  useEffect(() => {
    fetch(URL)
    .then(response => response.json())
    .then(result => setList(result));
  },[]);


  return (
    <ul>
      { list && list.map(x => <li>
        <Link to={ "/" + x.id }>{x.name}</Link>
      </li>) }
    </ul> 
  );
  
}

export default RecipesList;