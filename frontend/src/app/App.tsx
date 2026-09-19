import { useState, useEffect, useRef } from 'react';
import Login from '../components/Login';
import type { PerfilInicial } from '../components/Signup';
import { uploadAvatar } from '../lib/avatar';
import {
  clearPendingProfile,
  getPendingProfile,
  savePendingProfile as storePendingProfile,
} from '../lib/pending-profile';
import { supabase } from '../lib/supabase';

interface AuthClaims {
  email?: string;
}

export function App() {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<AuthClaims | null>(null);

  // Check URL params on initial render
  const params = new URLSearchParams(window.location.search);
  const hasTokenHash = params.get('token_hash');

  const [verifying, setVerifying] = useState(!!hasTokenHash);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [confirmationComplete, setConfirmationComplete] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const pendingProfileSaveRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const processPendingProfile = async () => {
      if (pendingProfileSaveRef.current) {
        await pendingProfileSaveRef.current;
        return;
      }

      const savePromise = (async () => {
        const pendingProfile = await getPendingProfile();
        if (!pendingProfile) return;

        try {
          const wasSaved = await saveProfile(pendingProfile);
          if (wasSaved) await clearPendingProfile();
        } catch {
          setAuthError('No fue posible recuperar los datos de tu perfil.');
        }
      })();

      pendingProfileSaveRef.current = savePromise;
      try {
        await savePromise;
      } finally {
        pendingProfileSaveRef.current = null;
      }
    };

    // Check if we have token_hash in URL (magic link callback)
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get('token_hash');

    if (token_hash) {
      // Verify the OTP token
      void supabase.auth
        .verifyOtp({
          token_hash,
          type: 'signup',
        })
        .then(async ({ error }) => {
          if (error) {
            setAuthError(error.message);
          } else {
            await processPendingProfile();
            await supabase.auth.signOut();
            setClaims(null);
            setConfirmationComplete(true);
            // Clear URL params
            window.history.replaceState({}, document.title, '/');
          }
          setVerifying(false);
        });
    }

    // Check for existing session using getClaims
    void supabase.auth.getClaims().then(async ({ data }) => {
      setClaims(data?.claims ?? null);
      if (data?.claims) await processPendingProfile();
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      void supabase.auth.getClaims().then(async ({ data }) => {
        setClaims(data?.claims ?? null);
        if (event === 'SIGNED_IN') await processPendingProfile();
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const saveProfile = async (perfil: PerfilInicial): Promise<boolean> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    let avatarUrl: string | null = null;

    // 1. Subir foto de perfil a Supabase Storage si el usuario eligió un archivo
    if (perfil.fotoArchivo) {
      try {
        const result = await uploadAvatar(perfil.fotoArchivo);
        avatarUrl = result.publicUrl;
      } catch (error) {
        setAuthError(
          error instanceof Error ? error.message : 'No se pudo subir la foto de perfil.',
        );
        return false;
      }
    }

    // 2. Guardar el perfil del estudiante
    const { error: perfilError } = await supabase.from('profiles').upsert({
      id: userData.user.id,
      name: perfil.nombre,
      university_center: perfil.centroUniversitario,
      picture_url: avatarUrl,
    });

    if (perfilError) {
      setAuthError(`Error al guardar perfil: ${perfilError.message}`);
      return false;
    }

    // 3. Guardar intereses estructurados en la tabla profiles_interests
    if (perfil.gustos.length > 0) {
      const interesesParaInsertar = perfil.gustos.map((g) => ({
        profile_id: userData.user.id,
        name: g.nombre,
        category: g.categoriaId,
        genres: g.generos,
        external_id: g.idExterno,
        image_url: g.imagenUrl ?? null,
      }));

      const { error: gustosError } = await supabase
        .from('profiles_interests')
        .upsert(interesesParaInsertar, {
          onConflict: 'profile_id,category,external_id',
        });

      if (gustosError) {
        setAuthError(`Error al guardar gustos: ${gustosError.message}`);
        return false;
      }
    }

    return true;
  };

  const handleSignup = async (email: string, password: string, perfil: PerfilInicial) => {
    setLoading(true);
    setAuthError(null);
    setSignupEmail(email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          perfil: {
            nombre: perfil.nombre,
            centroUniversitario: perfil.centroUniversitario,
          },
        },
      },
    });

    if (error) {
      setAuthError(error.message);
    } else if (!data.session) {
      await storePendingProfile(perfil);
      setAuthSuccess(true);
    } else {
      await saveProfile(perfil);
      setAuthSuccess(true);
    }
    setLoading(false);
  };

  const handleResendSignupEmail = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    return error?.message ?? null;
  };

  const handleSignin = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthError(error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setClaims(null);
  };

  return (
    <Login
      claims={claims}
      verifying={verifying}
      authError={authError}
      authSuccess={authSuccess}
      confirmationComplete={confirmationComplete}
      signupEmail={signupEmail}
      loading={loading}
      onSignup={(email, password, perfil) => {
        void handleSignup(email, password, perfil);
      }}
      onSignin={(email, password) => {
        void handleSignin(email, password);
      }}
      onResendSignupEmail={handleResendSignupEmail}
      onShowSignin={() => {
        setAuthSuccess(false);
        setConfirmationComplete(false);
      }}
      onLogout={() => {
        void handleLogout();
      }}
      onClearError={() => {
        setAuthError(null);
        window.history.replaceState({}, document.title, '/');
      }}
    />
  );
}
