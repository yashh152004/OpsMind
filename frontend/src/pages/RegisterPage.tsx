import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { toast } from 'sonner'

const RegisterPage: React.FC = () => {
  const { register, isRegisterLoading, registerError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organizationName: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.organizationName) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    register({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      firstName: formData.firstName,
      lastName: formData.lastName,
      organizationName: formData.organizationName,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Create Account</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-purple-100">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-purple-300 backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="John"
            disabled={isRegisterLoading}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-purple-100">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-purple-300 backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Doe"
            disabled={isRegisterLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-purple-100">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-purple-300 backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="you@example.com"
          disabled={isRegisterLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-purple-100">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-purple-300 backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="••••••••"
          disabled={isRegisterLoading}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-100">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-purple-300 backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="••••••••"
          disabled={isRegisterLoading}
        />
      </div>

      <div>
        <label htmlFor="organizationName" className="block text-sm font-medium text-purple-100">
          Organization Name
        </label>
        <input
          id="organizationName"
          name="organizationName"
          type="text"
          value={formData.organizationName}
          onChange={handleChange}
          className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-purple-300 backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Acme Corp"
          disabled={isRegisterLoading}
        />
      </div>

      {registerError && (
        <div className="rounded-lg bg-red-500/10 p-4 text-red-200">
          {(registerError as any)?.response?.data?.message || 
           (registerError as any)?.message || 
           'Registration failed. Please try again.'}
        </div>
      )}

      <button
        type="submit"
        disabled={isRegisterLoading}
        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 py-2 font-semibold text-white transition hover:from-purple-700 hover:to-purple-800 disabled:opacity-50"
      >
        {isRegisterLoading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="text-center text-sm">
        <span className="text-purple-200">Already have an account? </span>
        <Link to="/login" className="font-semibold text-purple-300 hover:text-purple-200">
          Sign In
        </Link>
      </div>
    </form>
  )
}

export default RegisterPage
