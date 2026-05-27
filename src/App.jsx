import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Drawer } from './drawer'
import { Rentals } from './rentals'
import { VehiclePickup } from './vehicle_pickup'
import { Return_Form } from './return_form'
import { Vehicle_Management_Page } from './vehicles_management'
import { Users } from './users'
import { History } from './history'

function App() {

  return (
    <>
    <BrowserRouter>
      <Drawer>
        <Routes>
          <Route path="/" element={<Rentals/>}/>
          <Route path="/Vehicle Pickup" element={<VehiclePickup/>}/>
          <Route path="/Return Vehicle" element={<Return_Form/>}/>
          <Route path="/Manage Vehicles" element={<Vehicle_Management_Page/>}/>
          <Route path="/Users" element={<Users/>}/>
          <Route path="/History" element={<History/>}/>
        </Routes>
      </Drawer>
    </BrowserRouter>
    </>
  )
}

export default App
