import { useState, type SyntheticEvent } from 'react'

interface SignupProps {
  loading: boolean
  onSignup: (email: string, password: string) => void
}

export default function Signup({ loading, onSignup }: Readonly<SignupProps>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordError('')
    onSignup(email, password)
  }

  return (
    <div>
      <h1>Create an account</h1>
      <p>Sign up with your UAA student email</p>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
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
          <input
            type="password"
            value={password}
            required={true}
            minLength={6}
            onChange={(event) => { setPassword(event.target.value) }}
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            required={true}
            minLength={6}
            onChange={(event) => { setConfirmPassword(event.target.value) }}
          />
        </label>

        {passwordError && <p>{passwordError}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </div>
  )
}