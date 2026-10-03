import { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'

// ดึง API URL จาก Environment Variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// --- 1. หน้าสมัครสมาชิก ---
function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/api/register`, { username, password })
      alert('สมัครสมาชิกสำเร็จ!')
      navigate('/login')
    } catch (err) {
      alert(err.response?.data?.message || 'สมัครไม่สำเร็จ')
    }
  }

  return (
    <div className="max-w-xs mx-auto py-32 px-4">
      <h2 className="text-xl font-light mb-8 tracking-[0.3em] text-center">CREATE ACCOUNT</h2>
      <form onSubmit={handleRegister} className="flex flex-col gap-6">
        <input className="border-b border-gray-200 p-2 outline-none focus:border-black transition" placeholder="Username" onChange={e => setUsername(e.target.value)} required />
        <input className="border-b border-gray-200 p-2 outline-none focus:border-black transition" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
        <button className="bg-black text-white p-3 text-xs tracking-widest uppercase hover:bg-gray-800 transition">Register</button>
        <Link to="/login" className="text-[10px] text-center text-gray-400 uppercase tracking-widest hover:text-black">Back to Login</Link>
      </form>
    </div>
  )
}

// --- 2. หน้า Login ---
function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API_URL}/api/login`, { username, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      navigate('/')
    } catch (err) { 
      alert(err.response?.data?.message || 'Login Failed!') 
    }
  }

  return (
    <div className="max-w-xs mx-auto py-32 px-4">
      <h2 className="text-xl font-light mb-8 tracking-[0.3em] text-center">ACCESS</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <input className="border-b border-gray-200 p-2 outline-none focus:border-black transition" placeholder="Username" onChange={e => setUsername(e.target.value)} required />
        <input className="border-b border-gray-200 p-2 outline-none focus:border-black transition" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
        <button className="bg-black text-white p-3 text-xs tracking-widest uppercase hover:bg-gray-800 transition">Login</button>
        <div className="flex flex-col gap-2">
            <Link to="/register" className="text-[10px] text-center text-gray-400 uppercase tracking-widest hover:text-black">Create an Account</Link>
        </div>
      </form>
    </div>
  )
}

// --- 3. หน้า PostDetail ---
function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  useEffect(() => {
    axios.get(`${API_URL}/api/posts`).then(res => {
      setPost(res.data.find(p => p._id === id))
    })
  }, [id])
  if (!post) return <div className="p-10 text-center font-light text-gray-400 uppercase tracking-widest">Loading...</div>
  return (
    <div className="max-w-2xl mx-auto p-10 font-serif leading-relaxed">
      <Link to="/" className="text-gray-300 hover:text-black mb-12 block transition text-xs tracking-[0.2em]">← BACK</Link>
      <h1 className="text-4xl font-bold mb-8 text-gray-900 leading-tight">{post.title}</h1>
      <p className="text-lg text-gray-600 whitespace-pre-line font-light">{post.content}</p>
    </div>
  )
}

// --- 4. หน้า Home ---
function Home() {
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  const fetchPosts = () => axios.get(`${API_URL}/api/posts`).then(res => setPosts(res.data))
  useEffect(() => { fetchPosts() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    // หาก Backend ต้องการ 'Bearer ' ให้แก้เป็น: `Bearer ${token}`
    const config = { headers: { Authorization: token } }
    try {
      await axios.post(`${API_URL}/api/posts`, { title, content }, config)
      setTitle(''); setContent(''); fetchPosts()
    } catch (err) { alert('Unauthorized') }
  }

  return (
    <div className="max-w-xl mx-auto py-20 px-6 font-sans antialiased">
      <div className="flex justify-between items-baseline mb-24">
        <h1 className="text-3xl font-light tracking-[0.3em]">JOURNAL</h1>
        <div className="flex gap-6">
          {token ? (
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-[10px] uppercase tracking-widest text-red-300 hover:text-red-500 transition">Logout</button>
          ) : (
            <Link to="/login" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition">Login</Link>
          )}
        </div>
      </div>

      {role === 'admin' && (
        <form onSubmit={handleSubmit} className="mb-24 space-y-6 animate-in fade-in duration-700">
          <input className="w-full p-2 text-2xl font-medium outline-none border-b border-gray-100 focus:border-black transition" placeholder="Post Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <textarea className="w-full p-2 text-gray-500 outline-none border-b border-gray-100 focus:border-black h-32 resize-none transition font-light" placeholder="Write your story..." value={content} onChange={e => setContent(e.target.value)} required />
          <button className="text-[10px] uppercase font-bold tracking-[0.2em] bg-black text-white px-10 py-4 hover:bg-gray-800 transition">Publish</button>
        </form>
      )}

      <div className="space-y-24">
        {posts.map(post => (
          <div key={post._id} className="group border-b border-gray-50 pb-16">
            <Link to={`/post/${post._id}`} className="block">
              <h2 className="text-2xl font-medium mb-4 group-hover:text-gray-400 transition-all duration-500">{post.title}</h2>
              <p className="text-gray-400 leading-7 line-clamp-2 font-light text-sm italic">{post.content}</p>
            </Link>
            <div className="mt-8 text-[9px] uppercase tracking-[0.25em] text-gray-300 flex justify-between items-center">
              <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              {role === 'admin' && (
                <button onClick={async () => { if(window.confirm('Delete?')) { await axios.delete(`${API_URL}/api/posts/${post._id}`, { headers: { Authorization: token } }); fetchPosts(); } }} className="hover:text-red-400 transition">Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Main App Router ---
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}