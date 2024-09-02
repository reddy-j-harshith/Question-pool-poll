import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css';
import Homepage from './pages/Homepage'
import Easypage from './pages/Easypage'
import Mediumpage from './pages/Mediumpage'
import Hardpage from './pages/Hardpage'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path = '/home' element = {<Homepage />}/>
          <Route path = '/easy' element = {<Easypage />}/>
          <Route path = '/easy' element = {<Mediumpage />}/>
          <Route path = '/easy' element = {<Hardpage />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
