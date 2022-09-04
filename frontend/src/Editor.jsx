import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import './creator.css'

const URL = "http://127.0.0.1:3002/v1";

function Editor (){

  let id = useParams().id;

  const [ name, setName ] = useState("");
  const [ long, setLong ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ fast, setFast ] = useState("");
  const [ doingTime, setDoingTime] = useState(0);
  const [ waitingTime, setWaitingTime] = useState(0);
  const [ images, setImages ] = useState("");
  const [ ingridents, setIngridents] = useState([]);
  const [ ingridentEdit, setIngridentEdit ] = useState("");
  const [ uploadImg, setUploadImg] = useState({name:"",replace:""});

  function load(){
    fetch(`${URL}/Recipe/${id}`)
      .then(response => response.json())
      .then(data =>{
        setName(data.name               || "");
        setLong(data.longname           || "");
        setDescription(data.description || "");
        setFast(data.fastrecipe         || "");
        setDoingTime(data.doingtime     || 0);
        setWaitingTime(data.waitingtime || 0);
        setImages(data.images );
      });

      fetch(`${URL}/Ingrident`)
        .then(response => response.json())
        .then(data => setIngridents(data) );
  }

  function save(){
    const body = {
      id: id,
      name: name,
      longname: long,
      description: description,
      fastrecipe: fast,
      doingtime: doingTime,
      waitingtime: waitingTime
    };


    const header = {
      "content-type": "application/json"
    };
    
    fetch(`${URL}/Recipe`, {method:"PATCH",  headers:header, body: JSON.stringify(body)})
      .then(response => response.json())
      .then(data => {
        console.log(data);
        load();
      });
  }

  const updatePrev = (e) => {
    setUploadImg({
      prev: window.URL.createObjectURL(e.target.files[0]) ,
      url: e.target.files[0],
      name: "",
      replace: "" });
  }

  const uploadPicture = () => {

    if (!uploadImg || !uploadImg.url)
      return;

    const formData = new FormData();
    formData.append("file", uploadImg.url);

    const data = fetch(`${URL}/Image?recipe_id=${id}&name=${uploadImg.name}&replace=${uploadImg.replace}`, {
      method: "POST",
      headers: { /*"Content-Type": "multipart/form-data" */ },
      body: formData,
    }).catch(e=> console.log("err"))
  };

  //just load the recipe on pageload
  useEffect(load, [id]);


  return (
    <div>
      <h2>Edit your Recipe</h2>

      <p>Title / Name</p>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

      <p>Long- / Subname </p>
      <input type="text" value={long} onChange={(e) => setLong(e.target.value)} />

      <p>Description</p>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

      <p>FastRecipe</p>
      <textarea value={fast} onChange={(e) => setFast(e.target.value)} />

      <p>Doing Time</p>
      <input type="number" value={doingTime} onChange={(e) => setDoingTime(e.target.value)} />

      <p>Waiting Time</p>
      <input type="number" value={waitingTime} onChange={(e) => setWaitingTime(e.target.value)} />

      <p>Adding Ingridents</p>
      <input type="number" value={ingridentEdit} onChange={(e) => setIngridentEdit(e.target.value)} />
      <select> { ingridents.map( x =>  <option key={x.id}>({x.unit}){x.name}</option> ) } </select>

      <p>Images</p>
      <img height="150" src={uploadImg.prev} />
      <input type="file" onChange={ updatePrev } />
      <input type="text" placeholder='name' value={uploadImg.name} onChange={(e)=> setUploadImg({...uploadImg, name:e.target.value}) } />
      <input type="text" placeholder='replace' value={uploadImg.replace} onChange={(e)=> setUploadImg({...uploadImg, replace:e.target.value})} />
      <button onClick={uploadPicture}>upload</button>

      <p>Update Recipe</p>
      <button onClick={save}>Save</button>

      <p>back to overview</p>

      <Link to="/">X</Link>
    </div>

  );
}

export default Editor;
