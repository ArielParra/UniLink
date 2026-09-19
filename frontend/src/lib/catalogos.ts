export const centrosUniversitarios = [
  { valor: 'ciencias_agropecuarias', etiqueta: 'Ciencias Agropecuarias' },
  { valor: 'ciencias_basicas', etiqueta: 'Ciencias Básicas' },
  { valor: 'ciencias_de_la_salud', etiqueta: 'Ciencias de la Salud' },
  {
    valor: 'ciencias_economicas_y_administrativas',
    etiqueta: 'Ciencias Económicas y Administrativas',
  },
  { valor: 'ciencias_empresariales', etiqueta: 'Ciencias Empresariales' },
  { valor: 'ciencias_sociales_y_humanidades', etiqueta: 'Ciencias Sociales y Humanidades' },
  { valor: 'ingenieria', etiqueta: 'Ingeniería' },
  { valor: 'artes_y_cultura', etiqueta: 'Artes y Cultura' },
] as const;

export interface CategoriaGustoDef {
  id: 'movies' | 'games' | 'books' | 'music';
  nombre: string;
  descripcion: string;
  ejemplos: readonly string[];
}

export const categoriasGustos: readonly CategoriaGustoDef[] = [
  {
    id: 'movies',
    nombre: 'Cine y Series',
    descripcion: 'Películas, series y directores',
    ejemplos: ['Inception', 'Interstellar', 'Breaking Bad', 'Spider-Man', 'Parasite'],
  },
  {
    id: 'music',
    nombre: 'Música',
    descripcion: 'Artistas, bandas y géneros',
    ejemplos: ['Daft Punk', 'Coldplay', 'Taylor Swift', 'Bad Bunny', 'Radiohead'],
  },
  {
    id: 'games',
    nombre: 'Videojuegos',
    descripcion: 'Consola, PC y móvil',
    ejemplos: ['Zelda', 'Minecraft', 'Valorant', 'Elden Ring', 'FIFA'],
  },
  {
    id: 'books',
    nombre: 'Libros y Lectura',
    descripcion: 'Autores, sagas y novelas',
    ejemplos: ['Cien años de soledad', 'Harry Potter', 'Dune', '1984', 'El Hobbit'],
  },
] as const;

export interface GustoItem {
  categoriaId: CategoriaGustoDef['id'];
  nombre: string;
  idExterno: string;
  generos: string[];
  imagenUrl?: string;
}
