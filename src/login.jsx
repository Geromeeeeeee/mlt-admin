import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from './config'

export function Login({logged, setLogged}) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [dispErr, setDispErr] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault();
        try{
            const response = await axios.post(`${API_BASE_URL}/back/login.php`, {
                action: 'login',
                email,
                password
            })

            if(response.data.error === false){
                localStorage.setItem('loggedIn', 'true')
                setLogged(true)
                navigate("/Rentals")
            }

        } catch {
            alert('Login failed. Please check your credentials and try again.');
        }
    }

    return(
        <>
        {dispErr && (
            <div className="w-screen h-screen bg-black/50 flex items-center justify-center">
                <div>
                    <h1> error </h1>
                </div>
            </div>
        )}
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-2">MLT Admin</h2>
                <h2 className="text-3xl font-bold text-center mb-2">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter your email" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter your password" />
                    </div>
                    <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-300">Sign In</button>
                </form>
            </div>
        </div>
        </>
    )
}