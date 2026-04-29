
import './App.css'
import ConnectForm from './pages/connectForm'
import Dashboard from './pages/dashboard'
import {Routes, Route } from "react-router";

function App() {

  return (
    <Routes>
      <Route path='/' element={<ConnectForm/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
    </Routes>

  )
}

export default App
