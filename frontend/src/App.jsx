import React from 'react';
import { Link } from 'react-router-dom';
import RecipesList from './RecipesList';

const App = () => {
    return <div>
        <RecipesList />
        <Link to="/create">Create</Link>
    </div>
}

export default App;