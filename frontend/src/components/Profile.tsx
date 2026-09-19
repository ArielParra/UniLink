import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ProfileData {
  name: string | null;
  university_center: string | null;
  picture_url: string | null;
}

interface InterestData {
  name: string;
  category: string;
  genres: string[];
}

interface ProfileProps {
  email?: string | undefined;
  onBack: () => void;
}

export default function Profile({ email, onBack }: Readonly<ProfileProps>) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [interests, setInterests] = useState<InterestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const loadProfile = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        if (isCurrent) {
          setError('No fue posible cargar tu perfil.');
          setLoading(false);
        }
        return;
      }

      const [profileResult, interestsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('name, university_center, picture_url')
          .eq('id', userData.user.id)
          .maybeSingle(),
        supabase
          .from('profiles_interests')
          .select('name, category, genres')
          .eq('profile_id', userData.user.id),
      ]);

      if (!isCurrent) return;

      if (profileResult.error || interestsResult.error) {
        setError('No fue posible cargar tu perfil.');
      } else {
        setProfile(profileResult.data);
        setInterests(interestsResult.data);
      }
      setLoading(false);
    };

    void loadProfile();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-superficie-2 p-6">
      <div className="w-full max-w-md rounded-lg border border-borde bg-superficie p-6 shadow-sm">
        <button
          id="profile-back"
          aria-label="Volver al inicio"
          className="text-sm font-medium text-marca-700 hover:underline"
          type="button"
          onClick={onBack}
        >
          Volver
        </button>
        <h1 className="mt-4 text-3xl font-bold text-marca-700">Mi perfil</h1>

        {loading && <p className="mt-4 text-texto-suave">Cargando perfil...</p>}
        {error && (
          <p className="mt-4 text-error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="mt-5 space-y-5">
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-semibold text-texto-suave">Correo</dt>
                <dd>{email ?? 'No disponible'}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-texto-suave">Nombre</dt>
                <dd>{profile?.name ?? 'No disponible'}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-texto-suave">Centro universitario</dt>
                <dd>{profile?.university_center ?? 'No disponible'}</dd>
              </div>
            </dl>

            <section>
              <h2 className="text-lg font-semibold text-texto">Mis intereses</h2>
              {interests.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {interests.map((interest) => (
                    <li
                      key={`${interest.category}-${interest.name}`}
                      className="rounded border border-borde p-2"
                    >
                      <p className="font-medium">{interest.name}</p>
                      <p className="text-sm text-texto-suave">{interest.category}</p>
                      {interest.genres.length > 0 && (
                        <p className="text-sm text-texto-suave">{interest.genres.join(', ')}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-texto-suave">
                  Aún no tienes intereses registrados.
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
