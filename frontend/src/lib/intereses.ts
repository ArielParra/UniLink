import { supabase } from './supabase';

export type CategoriaInteres = 'movies' | 'games' | 'books' | 'music';
export type AccionInteres = 'genres' | 'artists' | 'popular' | 'search';

export interface GeneroMusica {
  id: string;
  nombre: string;
}

export interface InteresCatalogo {
  id: string;
  nombre: string;
  categoria: CategoriaInteres;
  generos: string[];
  imagenUrl: string | null;
  externalId: string;
}

type FuncionInteresResponse = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value : null;

const getExternalId = (value: unknown): string | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return getString(value);
};

const getImageUrl = (item: Record<string, unknown>): string | null =>
  getString(item.imageUrl) ??
  getString(item.image_url) ??
  getString(item.posterUrl) ??
  getString(item.coverUrl) ??
  getString(item.thumbnail) ??
  getString(item.thumbnailUrl);

const getName = (item: Record<string, unknown>): string | null =>
  getString(item.title) ?? getString(item.name) ?? getString(item.artist) ?? getString(item.label);

const getGenres = (item: Record<string, unknown>): string[] => {
  const rawGenres = item.genres ?? item.genre ?? item.tags ?? item.themes ?? item.categories;
  if (!Array.isArray(rawGenres)) return [];

  return rawGenres.flatMap((rawGenre): string[] => {
    if (typeof rawGenre === 'string' && rawGenre.trim()) return [rawGenre.trim()];
    if (!isRecord(rawGenre)) return [];
    const name = getString(rawGenre.name) ?? getString(rawGenre.label) ?? getString(rawGenre.title);
    return name ? [name.trim()] : [];
  });
};

const parseIntereses = (
  response: FuncionInteresResponse,
  categoria: CategoriaInteres,
): InteresCatalogo[] => {
  const nestedData = isRecord(response.data) ? response.data : null;
  const rawItems =
    response[categoria] ??
    response.artists ??
    response.books ??
    response.items ??
    response.results ??
    nestedData?.[categoria] ??
    nestedData?.artists ??
    nestedData?.books ??
    nestedData?.items ??
    nestedData?.results;
  if (!Array.isArray(rawItems)) return [];

  return rawItems.flatMap((rawItem): InteresCatalogo[] => {
    if (!isRecord(rawItem)) return [];
    const externalId = getExternalId(rawItem.id);
    const nombre = getName(rawItem);
    if (!externalId || !nombre) return [];

    return [
      {
        id: externalId,
        externalId,
        nombre,
        categoria,
        generos: getGenres(rawItem),
        imagenUrl: getImageUrl(rawItem),
      },
    ];
  });
};

export async function obtenerIntereses(
  categoria: CategoriaInteres,
  action: AccionInteres,
  query?: string,
  genres?: string[],
): Promise<InteresCatalogo[]> {
  const result = await supabase.functions.invoke<FuncionInteresResponse>(categoria, {
    body: {
      action,
      ...(query?.trim() ? { query: query.trim() } : {}),
      ...(genres?.length ? { genres } : {}),
    },
  });
  const data = result.data as unknown;
  const error = result.error as unknown;

  if (error) throw new Error(`No fue posible cargar ${categoria}.`);
  if (!isRecord(data)) throw new Error('La respuesta de intereses no tiene el formato esperado.');

  return parseIntereses(data, categoria);
}

export async function obtenerGenerosMusica(): Promise<GeneroMusica[]> {
  const result = await supabase.functions.invoke<FuncionInteresResponse>('music', {
    body: { action: 'genres' },
  });
  const data = result.data as unknown;
  const error = result.error as unknown;

  if (error) throw new Error('No fue posible cargar los géneros musicales.');
  if (!isRecord(data) || !Array.isArray(data.genres)) {
    throw new Error('La respuesta de géneros musicales no tiene el formato esperado.');
  }

  return data.genres.flatMap((rawGenre): GeneroMusica[] => {
    if (!isRecord(rawGenre)) return [];
    const id = getString(rawGenre.id);
    const nombre = getString(rawGenre.name);
    if (!id || !nombre) return [];
    return [{ id, nombre }];
  });
}
