import React, { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/services/api'
import { toast } from 'sonner'
import { Loader2, ShieldCheck } from 'lucide-react'

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()
  const runOnce = useRef(false)

  useEffect(() => {
    // Avoid double execution in React 18 strict mode
    if (runOnce.current) return
    runOnce.current = true

    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (!accessToken) {
      toast.error('Identity parsing failed. OAuth token missing.')
      navigate('/login', { replace: true })
      return
    }

    const processAuth = async () => {
      try {
        // 1. Temporarily store credentials to authenticate subsequent requests
        setAuth({
          accessToken,
          refreshToken: refreshToken || 'fake-refresh-token',
          user: null as any, // Temporary
        })

        // 2. Fetch authenticated profile details from backend
        const userDetails = await apiClient.getCurrentUser()

        // 3. Commit profile and authentication status to store
        setAuth({
          accessToken,
          refreshToken: refreshToken || 'fake-refresh-token',
          user: userDetails,
        })

        toast.success(`Welcome back SRE, ${userDetails.firstName || 'Operator'}`)
        navigate('/dashboard', { replace: true })
      } catch (err: any) {
        console.error('OAuth profile retrieval failed:', err)
        toast.error('Identity sync error. Unable to load profile details.')
        useAuthStore.getState().logout()
        navigate('/login', { replace: true })
      }
    }

    processAuth()
  }, [searchParams, setAuth, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm text-center space-y-6 animate-fade-in">
        <div className="relative mx-auto h-16 w-16 bg-secondary border border-border rounded-lg flex items-center justify-center shadow-lg shadow-black/5">
          <ShieldCheck className="h-8 w-8 text-primary animate-pulse" />
          <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 animate-spin text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">Synchronizing Node</h2>
          <p className="text-muted-foreground text-xs uppercase tracking-widest leading-relaxed">
            Verifying credential signatures and downloading tenant profile. Please wait...
          </p>
        </div>
      </div>
    </div>
  )
}

export default OAuthCallbackPage
