import { useState } from 'react';
import Profile from './Profile';

interface HomeProps {
  email?: string | undefined;
  onLogout: () => void;
}

export default function Home({ email, onLogout }: Readonly<HomeProps>) {
  const [showProfile, setShowProfile] = useState(false);

  if (showProfile) {
    return (
      <Profile
        email={email}
        onBack={() => {
          setShowProfile(false);
        }}
      />
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-superficie-2 p-6">
      <div className="w-full max-w-md rounded-lg border border-borde bg-superficie p-6 shadow-sm">
        <h1 className="mb-3 text-3xl font-bold text-marca-700">Bienvenido</h1>
        <p>Has iniciado sesión como: {email}</p>
        <div className="mt-6 flex gap-3">
          <button
            id="show-profile"
            aria-label="Mostrar mi perfil"
            className="rounded border border-marca-600 px-4 py-2 font-medium text-marca-700"
            type="button"
            onClick={() => {
              setShowProfile(true);
            }}
          >
            Mi perfil
          </button>
          <button
            id="sign-out"
            aria-label="Cerrar sesión"
            className="rounded bg-marca-600 px-4 py-2 font-medium text-white"
            type="button"
            onClick={onLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </main>
  );
}
