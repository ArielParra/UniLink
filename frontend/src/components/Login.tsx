import { useState, type SyntheticEvent } from 'react';
import Home from './Home';
import Signup, { type PerfilInicial } from './Signup';

interface LoginProps {
  claims: { email?: string } | null;
  verifying: boolean;
  authError: string | null;
  authSuccess: boolean;
  confirmationComplete: boolean;
  signupEmail: string;
  loading: boolean;
  onSignup: (email: string, password: string, perfil: PerfilInicial) => void;
  onSignin: (email: string, password: string) => void;
  onResendSignupEmail: (email: string) => Promise<string | null>;
  onShowSignin: () => void;
  onLogout: () => void;
  onClearError: () => void;
}

export default function Login({
  claims,
  verifying,
  authError,
  authSuccess,
  confirmationComplete,
  signupEmail,
  loading,
  onSignup,
  onSignin,
  onResendSignupEmail,
  onShowSignin,
  onLogout,
  onClearError,
}: Readonly<LoginProps>) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleSignin = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSignin(email, password);
  };

  if (verifying) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-superficie-2 p-6">
        <div className="w-full max-w-md rounded-lg border border-borde bg-superficie p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-texto">Confirma tu correo</h1>
          <p className="mt-2 text-texto-suave">Estamos preparando tu cuenta.</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-superficie-2 p-6">
        <div className="w-full max-w-md rounded-lg border border-borde bg-superficie p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-texto">No pudimos completar el registro</h1>
          <p>{authError}</p>
          <button
            id="auth-error-return"
            aria-label="Volver al registro"
            className="mt-4 rounded bg-marca-600 px-4 py-2 font-medium text-white"
            type="button"
            onClick={onClearError}
          >
            Volver al registro
          </button>
        </div>
      </div>
    );
  }

  if (authSuccess && !claims) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-superficie-2 p-6">
        <div className="w-full max-w-md rounded-lg border border-borde bg-superficie p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-texto">Check your email</h1>
          <p className="mt-2 text-texto-suave">
            An email has been sent to <strong>{signupEmail}</strong>. Verify your email to continue.
          </p>
          <button
            id="resend-signup-email"
            aria-label="Reenviar correo de verificación"
            className="mt-5 rounded border border-borde px-4 py-2 text-sm font-medium text-texto disabled:opacity-50"
            type="button"
            disabled={resending || !signupEmail}
            onClick={() => {
              setResending(true);
              setResendMessage('');
              void onResendSignupEmail(signupEmail).then((error) => {
                setResendMessage(error ?? 'Verification email resent.');
                setResending(false);
              });
            }}
          >
            {resending ? 'Sending...' : 'Resend email'}
          </button>
          {resendMessage && <p className="mt-2 text-sm text-texto-suave">{resendMessage}</p>}
          <button
            id="show-signin-after-signup"
            aria-label="Ir al inicio de sesión"
            className="mt-3 rounded bg-marca-600 px-4 py-2 text-sm font-medium text-white"
            type="button"
            onClick={() => {
              onShowSignin();
              setMode('signin');
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (confirmationComplete) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-superficie-2 p-6">
        <div className="w-full max-w-md rounded-lg border border-borde bg-superficie p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-texto">Your account is ready</h1>
          <p className="mt-2 text-texto-suave">
            Your email has been verified. Sign in to continue to your profile.
          </p>
          <button
            id="show-signin-after-confirmation"
            aria-label="Ir al inicio de sesión"
            className="mt-5 rounded bg-marca-600 px-4 py-2 font-medium text-white"
            type="button"
            onClick={() => {
              onShowSignin();
              setMode('signin');
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (claims) {
    return <Home email={claims.email} onLogout={onLogout} />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-superficie-2 p-6">
      <div className="w-full max-w-md rounded-lg border border-borde bg-superficie p-6 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold text-marca-700">UniLink</h1>
        <div className="mb-6 flex gap-3">
          <button
            id="show-signup"
            aria-label="Mostrar registro"
            className="rounded bg-marca-600 px-4 py-2 font-medium text-white"
            type="button"
            onClick={() => {
              setMode('signup');
            }}
          >
            Sign up
          </button>
          <button
            id="show-signin"
            aria-label="Mostrar inicio de sesión"
            className="rounded bg-marca-600 px-4 py-2 font-medium text-white"
            type="button"
            onClick={() => {
              setMode('signin');
            }}
          >
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
              <input
                className="mt-1 block w-full rounded border border-borde p-2"
                type="email"
                placeholder="al123456@edu.uaa.mx"
                value={email}
                required={true}
                pattern="al[0-9]{6}@edu[.]uaa[.]mx"
                title="Use your student email: alXXXXXX@edu.uaa.mx"
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
              />
            </label>
            <label>
              Password
              <input
                className="mt-1 block w-full rounded border border-borde p-2"
                type="password"
                value={password}
                required={true}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
            </label>
            <button
              className="rounded bg-marca-600 px-4 py-2 font-medium text-white disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
