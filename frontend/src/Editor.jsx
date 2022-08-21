import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import './creator.css'

const URL = "http://127.0.0.1:3002/v1/Recipe";

function Editor (){

  let id = useParams().id;

  const [ name, setName ] = useState("");
  const [ long, setLong ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ fast, setFast ] = useState("");
  const [ doingTime, setDoingTime] = useState(0);
  const [ waitingTime, setWaitingTime] = useState(0);
  const [ images, setImages ] = useState("");
  const [ uploadImg, setUploadImg] = useState({});

  function load(){
    fetch(`${URL}/${id}`)
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
    
    fetch(`${URL}`, {method:"PATCH",  headers:header, body: JSON.stringify(body)})
      .then(response => response.json())
      .then(data => {
        console.log(data);
        load();
      });
  }

  const uploadPicture = (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    const data = fetch("http://localhost:3000/upload/post", {
      method: "post",
      headers: { "Content-Type": "multipart/form-data" },
      body: formData,
    });
    /*const uploadedImage = await data.json();
    if (uploadedImage) {
      console.log("Successfully uploaded image");
    } else {
      console.log("Error Found");
    }*/
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

      <p>Images</p>
      <img src={uploadImg.prev} />
      <input type="file" onChange={(e) => setUploadImg({prev: URL.createObjectURL(e.target.files[0]) ,url: e.target.files[0]})} />


      <p>Update Recipe</p>
      <button onClick={save}>Save</button>

      <p>back to overview</p>

      <Link to="/">X</Link>
    </div>

  );
}

export default Editor;
