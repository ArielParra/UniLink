interface HomeProps {
  email?: string | undefined
  onLogout: () => void
}

export default function Home({ email, onLogout }: Readonly<HomeProps>) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-superficie-2 p-6">
      <div className="w-full max-w-md rounded-lg border border-borde bg-superficie p-6 shadow-sm">
      <h1 className="mb-3 text-3xl font-bold text-marca-700">Welcome!</h1>
      <p>You are logged in as: {email}</p>
      <button className="mt-6 rounded bg-marca-600 px-4 py-2 font-medium text-white" onClick={onLogout}>Sign Out</button>
      </div>
    </main>
  )
}
