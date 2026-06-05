import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white">OpsMind</h1>
            <p className="mt-2 text-purple-200">AI-Powered Observability & Incident Intelligence</p>
          </div>

          <div className="rounded-lg bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            <Outlet />
          </div>

          <p className="mt-8 text-center text-sm text-purple-200">
            © 2024 OpsMind. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
