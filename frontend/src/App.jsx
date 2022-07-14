import React from 'react';
import RecipesList from './RecipesList';
import { Link } from 'react-router-dom';

const App = () => {
    return <div>
        <RecipesList />
        <Link to="/create">Create</Link>
    </div>
}

export default App;