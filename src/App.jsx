import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Drawer } from './drawer'
import { Rentals } from './rentals'
import { VehiclePickup } from './vehicle_pickup'
import { Return_Form } from './return_form'

function App() {

  return (
    <>
    <BrowserRouter>
      <Drawer>
        <Routes>
          <Route path="/" element={<Rentals/>}/>
          <Route path="/Vehicle Pickup" element={<VehiclePickup/>}/>
          <Route path="/Return Vehicle" element={<Return_Form/>}/>
        </Routes>
      </Drawer>
    </BrowserRouter>
    </>
  )
}

export default App
