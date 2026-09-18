import './index.css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Login from './components/Login'

type AuthClaims = {
  email?: string
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function App() {
  const [loading, setLoading] = useState(false)
  const [claims, setClaims] = useState<AuthClaims | null>(null)

  // Check URL params on initial render
  const params = new URLSearchParams(window.location.search)
  const hasTokenHash = params.get('token_hash')

  const [verifying, setVerifying] = useState(!!hasTokenHash)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState(false)

  useEffect(() => {
    // Check if we have token_hash in URL (magic link callback)
    const params = new URLSearchParams(window.location.search)
    const token_hash = params.get('token_hash')

    if (token_hash) {
      // Verify the OTP token
      supabase.auth
        .verifyOtp({
          token_hash,
          type: 'signup',
        })
        .then(({ error }) => {
          if (error) {
            setAuthError(error.message)
          } else {
            setAuthSuccess(true)
            // Clear URL params
            window.history.replaceState({}, document.title, '/')
          }
          setVerifying(false)
        })
    }

    // Check for existing session using getClaims
    supabase.auth.getClaims().then(({ data }) => {
      setClaims(data?.claims ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getClaims().then(({ data }) => {
        setClaims(data?.claims ?? null)
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignup = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) {
      alert(error.message)
    } else if (!data.session) {
      alert('Account created. Check your email to confirm your account!')
    } else {
      alert('Account created successfully!')
    }
    setLoading(false)
  }

  const handleSignin = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setClaims(null)
  }

  return (
    <Login
      claims={claims}
      verifying={verifying}
      authError={authError}
      authSuccess={authSuccess}
      loading={loading}
      onSignup={handleSignup}
      onSignin={handleSignin}
      onLogout={handleLogout}
      onClearError={() => {
        setAuthError(null)
        window.history.replaceState({}, document.title, '/')
      }}
    />
  )
}