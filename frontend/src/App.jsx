import { useState } from 'react'
import './App.css'
import Navbar from '../components/Common/Navbar'
import Home from '../pages/Home'
import { Route, Routes } from 'react-router-dom'




function App() {

  return (
     <div className="flex min-h-screen w-screen flex-col bg-richblack-900 font-inter">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>} />
      </Routes>
    </div>
  )
}

export default App
