import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Recipe from './Reciepe';
import Creator from './Creator';
import Editor from './Editor';


ReactDOM.render(
  <React.StrictMode>

  <BrowserRouter>
    <Routes>
      <Route path="/"         element={<App />}       />
      <Route path="/:id"      element={<Recipe />}    />
      <Route path="/create"   element={<Creator /> }  />
      <Route path="/edit/:id" element={<Editor /> }   />
    </Routes>
  </BrowserRouter>

  </React.StrictMode>,
  document.getElementById('root')
);
