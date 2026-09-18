import { useState, type FormEvent } from 'react'
import Home from './Home'
import Signup from './Signup'

type LoginProps = {
  claims: { email?: string } | null
  verifying: boolean
  authError: string | null
  authSuccess: boolean
  loading: boolean
  onSignup: (email: string, password: string) => void
  onSignin: (email: string, password: string) => void
  onLogout: () => void
  onClearError: () => void
}

export default function Login({
  claims,
  verifying,
  authError,
  authSuccess,
  loading,
  onSignup,
  onSignin,
  onLogout,
  onClearError,
}: LoginProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSignin(email, password)
  }

  if (verifying) {
    return (
      <div>
        <h1>Authentication</h1>
        <p>Confirming your magic link...</p>
        <p>Loading...</p>
      </div>
    )
  }

  if (authError) {
    return (
      <div>
        <h1>Authentication</h1>
        <p>Authentication failed</p>
        <p>{authError}</p>
        <button onClick={onClearError}>Return to login</button>
      </div>
    )
  }

  if (authSuccess && !claims) {
    return (
      <div>
        <h1>Authentication</h1>
        <p>Authentication successful!</p>
        <p>Loading your account...</p>
      </div>
    )
  }

  if (claims) {
    return <Home email={claims.email} onLogout={onLogout} />
  }

  return (
    <div>
      <h1>UniLink</h1>
      <button type="button" onClick={() => setMode('signup')}>
        Sign up
      </button>
      <button type="button" onClick={() => setMode('signin')}>
        Sign in
      </button>
      {mode === 'signup' ? (
        <Signup loading={loading} onSignup={onSignup} />
      ) : (
        <form onSubmit={handleSignin}>
          <h2>Sign in</h2>
          <label>
            Email
            <input
              type="email"
              placeholder="al123456@edu.uaa.mx"
              value={email}
              required={true}
              pattern="al[0-9]{6}@edu[.]uaa[.]mx"
              title="Use your student email: alXXXXXX@edu.uaa.mx"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              required={true}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      )}
    </div>
  )
}
