import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { toast } from 'sonner'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoginLoading, loginError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgIdentifier, setOrgIdentifier] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !orgIdentifier) {
      toast.error('Please fill in all fields')
      return
    }
    login({ email, password, organizationIdentifier: orgIdentifier })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Sign In</h2>

      <div>
        <label htmlFor="org" className="block text-sm font-medium text-purple-100">
          Organization ID or Slug
        </label>
        <input
          id="org"
          type="text"
          value={orgIdentifier}
          onChange={(e) => setOrgIdentifier(e.target.value)}
          className="mt-2 w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-purple-300 backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="your-org-slug"
          disabled={isLoginLoading}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-purple-100">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-purple-300 backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="you@example.com"
          disabled={isLoginLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-purple-100">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-purple-300 backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="••••••••"
          disabled={isLoginLoading}
        />
      </div>

      {loginError && (
        <div className="rounded-lg bg-red-500/10 p-4 text-red-200">
          {(loginError as any)?.response?.data?.message || 'Login failed. Please try again.'}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoginLoading}
        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 py-3 font-semibold text-white transition hover:from-purple-700 hover:to-purple-800 disabled:opacity-50"
      >
        {isLoginLoading ? 'Signing In...' : 'Sign In'}
      </button>

      <div className="text-center text-sm">
        <span className="text-purple-200">Don't have an account? </span>
        <Link to="/register" className="font-semibold text-purple-300 hover:text-purple-200">
          Register
        </Link>
      </div>
    </form>
  )
}

export default LoginPage
