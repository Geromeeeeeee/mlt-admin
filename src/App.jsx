import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Drawer } from './drawer'
import { Rentals } from './rentals'

function App() {

  return (
    <>
    <BrowserRouter>
      <Drawer>
        <Routes>
          <Route path="/rentals" element={<Rentals/>}/>
        </Routes>
      </Drawer>
    </BrowserRouter>
    </>
  )
}

export default App
