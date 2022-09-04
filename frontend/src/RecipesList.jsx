import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const URL = "http://127.0.0.1:3002/v1/Recipe";

function RecipesList() {

  const [list,setList] = useState([])

  const del = (id) => {
    fetch(URL + "/" + id,{method : "DELETE"})
      .then(() => load())
      .catch(err => console.log(err))
  };

  const load = () => {
    fetch(URL)
      .then(response => response.json())
      .then(result => setList(result));
  };

  useEffect(() => {
    load();
  },[]);


  return (
    <ul>
      { list && list.map(x => <li key={x.id}>
        <Link to={ "/" + x.id }>{`${x.name} (${x.id})`}</Link>
        <Link to={ "/edit/" + x.id }><button> E</button></Link>
        <button style={{marginLeft:"15px"}} onClick={() => del(x.id) } >X</button>
      </li>) }
    </ul> 
  );
  
}

export default RecipesList;