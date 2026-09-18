import { useState, type SyntheticEvent } from 'react'
import Home from './Home'
import Signup from './Signup'

interface LoginProps {
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
}: Readonly<LoginProps>) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignin = (event: SyntheticEvent<HTMLFormElement>) => {
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
    <main className="flex min-h-dvh items-center justify-center bg-superficie-2 p-6">
      <div className="w-full max-w-md rounded-lg border border-borde bg-superficie p-6 shadow-sm">
      <h1 className="mb-6 text-3xl font-bold text-marca-700">UniLink</h1>
      <div className="mb-6 flex gap-3">
      <button className="rounded bg-marca-600 px-4 py-2 font-medium text-white" type="button" onClick={() => { setMode('signup') }}>
        Sign up
      </button>
      <button className="rounded border border-borde px-4 py-2 font-medium text-texto" type="button" onClick={() => { setMode('signin') }}>
        Sign in
      </button>
      </div>
      {mode === 'signup' ? (
        <Signup loading={loading} onSignup={onSignup} />
      ) : (
        <form className="space-y-4" onSubmit={handleSignin}>
          <h2 className="text-xl font-semibold text-texto">Sign in</h2>
          <label>
            Email
            <input className="mt-1 block w-full rounded border border-borde p-2" 
              type="email"
              placeholder="al123456@edu.uaa.mx"
              value={email}
              required={true}
              pattern="al[0-9]{6}@edu[.]uaa[.]mx"
              title="Use your student email: alXXXXXX@edu.uaa.mx"
              onChange={(event) => { setEmail(event.target.value) }}
            />
          </label>
          <label>
            Password
            <input className="mt-1 block w-full rounded border border-borde p-2"
              type="password"
              value={password}
              required={true}
              onChange={(event) => { setPassword(event.target.value) }}
            />
          </label>
          <button className="rounded bg-marca-600 px-4 py-2 font-medium text-white disabled:opacity-50" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      )}
      </div>
    </main>
  )
}
