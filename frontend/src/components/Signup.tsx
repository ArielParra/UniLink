import { useEffect, useState, type SyntheticEvent } from 'react';
import {
  centrosUniversitarios,
  categoriasGustos,
  type CategoriaGustoDef,
  type GustoItem,
} from '../lib/catalogos';
import {
  obtenerGenerosMusica,
  obtenerIntereses,
  type GeneroMusica,
  type InteresCatalogo,
} from '../lib/intereses';
import AvatarPicker from './AvatarPicker';

export interface PerfilInicial {
  nombre: string;
  centroUniversitario: string;
  fotoArchivo: File | null;
  gustos: GustoItem[];
}

interface SignupProps {
  loading: boolean;
  onSignup: (email: string, password: string, perfil: PerfilInicial) => void;
}

export default function Signup({ loading, onSignup }: Readonly<SignupProps>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [centroUniversitario, setCentroUniversitario] = useState('');
  const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);

  // Gustos seleccionados y estado de categoría activa
  const [gustos, setGustos] = useState<GustoItem[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaGustoDef['id']>('movies');
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<InteresCatalogo[]>([]);
  const [cargandoIntereses, setCargandoIntereses] = useState(false);
  const [generosMusica, setGenerosMusica] = useState<GeneroMusica[]>([]);
  const [generosSeleccionados, setGenerosSeleccionados] = useState<string[]>([]);

  const [passwordError, setPasswordError] = useState('');
  const [gustosError, setGustosError] = useState('');

  const gustosDeCategoria = gustos.filter((g) => g.categoriaId === categoriaActiva);

  useEffect(() => {
    let isCurrent = true;
    setCargandoIntereses(true);
    setResultados([]);
    setBusqueda('');
    setGenerosSeleccionados([]);

    const cargarIntereses =
      categoriaActiva === 'music'
        ? obtenerGenerosMusica().then((generos) => {
            if (isCurrent) setGenerosMusica(generos);
          })
        : obtenerIntereses(categoriaActiva, 'popular').then((intereses) => {
            if (isCurrent) setResultados(intereses);
          });

    void cargarIntereses
      .catch(() => {
        if (isCurrent) setGustosError('No fue posible cargar los intereses populares.');
      })
      .finally(() => {
        if (isCurrent) setCargandoIntereses(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [categoriaActiva]);

  const agregarGusto = (interes: InteresCatalogo) => {
    const nombreLimpio = interes.nombre.trim();
    if (!nombreLimpio) return;

    const actuales = gustos.filter((g) => g.categoriaId === categoriaActiva);
    if (actuales.length >= 3) {
      setGustosError(`Ya tienes 3 gustos en esta categoría.`);
      return;
    }

    const yaExiste = actuales.some((g) => g.nombre.toLowerCase() === nombreLimpio.toLowerCase());
    if (yaExiste) {
      setGustosError('Este gusto ya está agregado.');
      return;
    }

    setGustosError('');
    setGustos((prev) => [
      ...prev,
      {
        categoriaId: categoriaActiva,
        nombre: nombreLimpio,
        idExterno: interes.externalId,
        generos: interes.generos,
        ...(interes.imagenUrl ? { imagenUrl: interes.imagenUrl } : {}),
      },
    ]);
  };

  const buscarIntereses = () => {
    if (!busqueda.trim()) return;

    if (categoriaActiva === 'music' && generosSeleccionados.length !== 3) {
      setGustosError('Selecciona 3 géneros antes de buscar artistas.');
      return;
    }

    setCargandoIntereses(true);
    void obtenerIntereses(
      categoriaActiva,
      'search',
      busqueda,
      categoriaActiva === 'music' ? generosSeleccionados : undefined,
    )
      .then((intereses) => {
        setResultados(intereses);
        setGustosError('');
      })
      .catch(() => {
        setGustosError('No fue posible buscar intereses.');
      })
      .finally(() => {
        setCargandoIntereses(false);
      });
  };

  const alternarGeneroMusica = (generoId: string) => {
    const yaSeleccionado = generosSeleccionados.includes(generoId);
    const siguientes = yaSeleccionado
      ? generosSeleccionados.filter((id) => id !== generoId)
      : [...generosSeleccionados, generoId];

    if (siguientes.length > 3) return;
    setGenerosSeleccionados(siguientes);
    setResultados([]);
    setGustosError('');

    if (siguientes.length === 3) {
      setCargandoIntereses(true);
      void obtenerIntereses('music', 'artists', undefined, siguientes)
        .then((intereses) => {
          setResultados(intereses);
        })
        .catch(() => {
          setGustosError('No fue posible cargar artistas para esos géneros.');
        })
        .finally(() => {
          setCargandoIntereses(false);
        });
    }
  };

  const quitarGusto = (categoriaId: string, nombreGusto: string) => {
    setGustos((prev) =>
      prev.filter((g) => !(g.categoriaId === categoriaId && g.nombre === nombreGusto)),
    );
    setGustosError('');
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    if (gustos.length === 0) {
      setGustosError('Selecciona al menos un gusto para crear tu perfil.');
      return;
    }
    setPasswordError('');
    setGustosError('');
    onSignup(email, password, {
      nombre,
      centroUniversitario,
      fotoArchivo,
      gustos,
    });
  };

  const categoriaActualDef: CategoriaGustoDef = categoriasGustos.find(
    (c) => c.id === categoriaActiva,
  ) ?? {
    id: 'movies',
    nombre: 'Cine y Series',
    descripcion: 'Películas, series y directores',
    ejemplos: ['Inception', 'Interstellar'],
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-texto">Crea tu cuenta</h2>
      <p className="text-sm text-texto-suave">
        Conecta con estudiantes de la UAA a partir de tus intereses en común.
      </p>

      <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
        {/* Nombre */}
        <label htmlFor="signup-nombre" className="block text-sm font-medium">
          Nombre completo
          <input
            id="signup-nombre"
            aria-label="Nombre completo"
            className="mt-1 block w-full rounded border border-borde p-2"
            type="text"
            value={nombre}
            required={true}
            minLength={2}
            placeholder="Ej. Andrea Gómez"
            onChange={(event) => {
              setNombre(event.target.value);
            }}
          />
        </label>

        <AvatarPicker file={fotoArchivo} onChange={setFotoArchivo} disabled={loading} />

        {/* Centro Universitario */}
        <label htmlFor="signup-centro" className="block text-sm font-medium">
          Centro universitario
          <select
            id="signup-centro"
            aria-label="Centro universitario"
            className="mt-1 block w-full rounded border border-borde p-2"
            value={centroUniversitario}
            required={true}
            onChange={(event) => {
              setCentroUniversitario(event.target.value);
            }}
          >
            <option value="">Selecciona tu centro</option>
            {centrosUniversitarios.map((centro) => (
              <option key={centro.valor} value={centro.valor}>
                {centro.etiqueta}
              </option>
            ))}
          </select>
        </label>

        {/* Gustos y Categorías (5 principales, hasta 3 por categoría) */}
        <fieldset className="rounded border border-borde p-3">
          <legend className="px-1 text-sm font-semibold">
            Tus gustos e intereses (máximo 3 por categoría)
          </legend>

          {/* Pestañas de las 5 categorías */}
          <div className="mt-2 flex flex-wrap gap-1">
            {categoriasGustos.map((cat) => {
              const cantidad = gustos.filter((g) => g.categoriaId === cat.id).length;
              const isActive = categoriaActiva === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  aria-label={`Categoría ${cat.nombre}`}
                  type="button"
                  onClick={() => {
                    setCategoriaActiva(cat.id);
                    setGustosError('');
                  }}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-marca-600 text-white'
                      : 'bg-superficie-2 text-texto border border-borde hover:bg-marca-50'
                  }`}
                >
                  {cat.nombre} ({cantidad}/3)
                </button>
              );
            })}
          </div>

          {/* Área de la categoría seleccionada */}
          <div className="mt-3 rounded bg-superficie-2 p-2.5">
            <p className="text-xs text-texto-suave mb-2">
              {categoriaActualDef.descripcion} —{' '}
              <span className="font-semibold text-texto">
                {gustosDeCategoria.length}/3 agregados
              </span>
            </p>

            {categoriaActiva === 'music' && (
              <div className="mb-3 rounded border border-borde bg-superficie p-2">
                <p className="text-xs font-semibold text-texto">
                  Elige 3 géneros musicales ({generosSeleccionados.length}/3)
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {generosMusica.map((genero) => {
                    const isSelected = generosSeleccionados.includes(genero.id);
                    return (
                      <button
                        key={genero.id}
                        id={`genero-musica-${genero.id}`}
                        aria-label={`Seleccionar género ${genero.nombre}`}
                        type="button"
                        aria-pressed={isSelected}
                        className={`rounded border px-2 py-1 text-xs ${
                          isSelected
                            ? 'border-marca-600 bg-marca-600 text-white'
                            : 'border-borde bg-superficie text-texto hover:border-marca-500'
                        }`}
                        onClick={() => {
                          alternarGeneroMusica(genero.id);
                        }}
                      >
                        {genero.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chips de gustos actualmente elegidos */}
            {gustosDeCategoria.length > 0 ? (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {gustosDeCategoria.map((g) => (
                  <span
                    key={g.nombre}
                    className="inline-flex items-center gap-1 rounded-full bg-marca-50 border border-marca-500 px-2.5 py-0.5 text-xs text-marca-700"
                  >
                    {g.nombre}
                    <button
                      id={`quitar-gusto-${g.categoriaId}-${g.nombre}`}
                      aria-label={`Eliminar ${g.nombre}`}
                      type="button"
                      className="ml-1 text-xs font-bold text-marca-700 hover:text-error"
                      onClick={() => {
                        quitarGusto(g.categoriaId, g.nombre);
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mb-2 text-xs italic text-texto-suave">
                Busca tu favorito si no aparece abajo.
              </p>
            )}

            {gustosDeCategoria.length < 3 && (
              <div className="flex gap-2">
                <input
                  id={`buscar-interes-${categoriaActiva}`}
                  aria-label={`Buscar ${categoriaActualDef.nombre}`}
                  type="text"
                  placeholder={`Ej. ${categoriaActualDef.ejemplos[0] ?? ''}`}
                  value={busqueda}
                  className="flex-1 rounded border border-borde bg-superficie px-2 py-1 text-xs"
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      buscarIntereses();
                    }
                  }}
                />
                <button
                  id={`btn-buscar-interes-${categoriaActiva}`}
                  aria-label={`Buscar intereses de ${categoriaActualDef.nombre}`}
                  type="button"
                  disabled={cargandoIntereses || !busqueda.trim()}
                  className="rounded bg-marca-600 px-3 py-1 text-xs font-medium text-white hover:bg-marca-700"
                  onClick={buscarIntereses}
                >
                  Buscar
                </button>
              </div>
            )}

            {gustosDeCategoria.length < 3 && (
              <div className="mt-2.5">
                <span className="text-[11px] text-texto-suave">
                  {cargandoIntereses ? 'Cargando intereses...' : 'Intereses populares:'}
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {resultados.map((interes) => {
                    const yaEsta = gustosDeCategoria.some(
                      (g) => g.idExterno === interes.externalId,
                    );
                    return (
                      <button
                        key={interes.externalId}
                        id={`interes-${categoriaActiva}-${interes.externalId}`}
                        aria-label={`Añadir ${interes.nombre}`}
                        type="button"
                        disabled={yaEsta}
                        className={`flex min-h-12 items-center gap-1.5 rounded border px-1 py-1 text-left text-[11px] ${
                          yaEsta
                            ? 'border-borde bg-superficie text-texto-suave opacity-50 cursor-not-allowed'
                            : 'border-borde bg-superficie text-texto hover:border-marca-500 hover:text-marca-700'
                        }`}
                        onClick={() => {
                          agregarGusto(interes);
                        }}
                      >
                        {interes.imagenUrl ? (
                          <img
                            src={interes.imagenUrl}
                            alt=""
                            aria-hidden="true"
                            className="h-12 w-12 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-superficie-2 text-[10px] text-texto-suave"
                          >
                            Sin imagen
                          </span>
                        )}
                        <span>+ {interes.nombre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {gustosError && (
            <p className="mt-2 text-xs text-error" role="alert">
              {gustosError}
            </p>
          )}
        </fieldset>

        {/* Correo institucional */}
        <label htmlFor="signup-email" className="block text-sm font-medium">
          Correo institucional
          <input
            id="signup-email"
            aria-label="Correo institucional"
            className="mt-1 block w-full rounded border border-borde p-2"
            type="email"
            placeholder="al123456@edu.uaa.mx"
            value={email}
            required={true}
            pattern="al[0-9]{6}@edu[.]uaa[.]mx"
            title="Usa tu correo institucional: alXXXXXX@edu.uaa.mx"
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        </label>

        {/* Contraseñas */}
        <label htmlFor="signup-password" className="block text-sm font-medium">
          Contraseña
          <input
            id="signup-password"
            aria-label="Contraseña"
            className="mt-1 block w-full rounded border border-borde p-2"
            type="password"
            value={password}
            required={true}
            minLength={6}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </label>

        <label htmlFor="signup-confirm-password" className="block text-sm font-medium">
          Confirmar contraseña
          <input
            id="signup-confirm-password"
            aria-label="Confirmar contraseña"
            className="mt-1 block w-full rounded border border-borde p-2"
            type="password"
            value={confirmPassword}
            required={true}
            minLength={6}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
          />
        </label>

        {passwordError && (
          <p className="text-xs text-error" role="alert">
            {passwordError}
          </p>
        )}

        <button
          id="signup-submit"
          aria-label="Crear cuenta"
          className="w-full rounded bg-marca-600 px-4 py-2.5 font-medium text-white disabled:opacity-50 hover:bg-marca-700"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}
