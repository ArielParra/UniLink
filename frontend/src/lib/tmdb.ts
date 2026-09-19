export interface GustoCatalogo {
  id: number
  nombre: string
  categoria: 'cine'
  fuente: 'tmdb'
}

interface GeneroTmdb {
  id: number
  name: string
}

const tmdbBaseUrl = 'https://api.themoviedb.org/3'

const isGeneroTmdb = (value: unknown): value is GeneroTmdb => {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as { id?: unknown; name?: unknown }
  return typeof candidate.id === 'number' && typeof candidate.name === 'string'
}

export async function obtenerGustosDeCine(): Promise<GustoCatalogo[]> {
  const environment = import.meta.env as Record<string, unknown>
  const apiKeyValue = environment.VITE_TMDB_API_KEY
  const apiKey = typeof apiKeyValue === 'string' ? apiKeyValue : ''
  if (!apiKey) {
    throw new Error('Falta configurar VITE_TMDB_API_KEY para cargar los gustos de cine.')
  }

  const response = await fetch(`${tmdbBaseUrl}/genre/movie/list?api_key=${encodeURIComponent(apiKey)}&language=es-MX`)
  if (!response.ok) throw new Error('No fue posible cargar los gustos de cine.')

  const data = (await response.json()) as unknown
  if (typeof data !== 'object' || data === null) {
    throw new Error('La respuesta de TMDB no tiene el formato esperado.')
  }

  const genres = (data as { genres?: unknown }).genres
  if (!Array.isArray(genres) || !genres.every(isGeneroTmdb)) {
    throw new Error('La respuesta de TMDB no tiene el formato esperado.')
  }

  return genres.map((genre) => ({
    id: genre.id,
    nombre: genre.name,
    categoria: 'cine' as const,
    fuente: 'tmdb' as const,
  }))
}