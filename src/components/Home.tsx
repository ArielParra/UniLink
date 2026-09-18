type HomeProps = {
  email?: string
  onLogout: () => void
}

export default function Home({ email, onLogout }: HomeProps) {
  return (
    <div>
      <h1>Welcome!</h1>
      <p>You are logged in as: {email}</p>
      <button onClick={onLogout}>Sign Out</button>
    </div>
  )
}
