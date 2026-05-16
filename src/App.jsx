import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Drawer } from './drawer'
import { Rentals } from './rentals'
import { VehiclePickup } from './vehicle_pickup'

function App() {

  return (
    <>
    <BrowserRouter>
      <Drawer>
        <Routes>
          <Route path="/" element={<Rentals/>}/>
          <Route path="/Vehicle Pickup" element={<VehiclePickup/>}/>
        </Routes>
      </Drawer>
    </BrowserRouter>
    </>
  )
}

export default App
