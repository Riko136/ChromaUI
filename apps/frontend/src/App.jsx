
import './App.css'
import ConnectForm from './components/connect-form';
import Layout from './layout';
import {Routes, Route } from "react-router";

function App() {

  return (
    <Routes>
      <Route path='/' element={<ConnectForm/>}/>
      <Route path='/dashboard' element={<Layout/>}/>
    </Routes>

  )
}

export default App
