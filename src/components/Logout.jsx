import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Logout() {
    const navigate=useNavigate()
    const {logout}=useAuth()
    useEffect(()=>{
logout()
navigate("/login")
    },[])
  return null
}

export default Logout