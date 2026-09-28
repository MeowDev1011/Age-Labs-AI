export interface StyleFilter {
  id: string;
  name: string;
  shortDesc: string;
  promptModifier: string;
  color: string;
  gradient: string;
}

export const STYLE_FILTERS: StyleFilter[] = [
  {
    id: 'realista',
    name: 'Ultra Realista',
    shortDesc: 'Fotografía fotorrealista de alta definición',
    promptModifier:
      'Estilo fotográfico ultra realista, textura de piel humana natural y detallada, iluminación fotográfica cinematográfica de estudio en alta resolución 8K.',
    color: 'sky',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    id: 'ceramica',
    name: 'Obra de Cerámica',
    shortDesc: 'Porcelana vidriada y barro artesanal',
    promptModifier:
      'Estilo artístico de estatua o figura de cerámica y porcelana fina esmaltada hecha a mano por un maestro artesano. Superficie lustrosa y vidriada, sutil craquelado cerámico tradicional, reflejos de porcelana pulida y textura de arcilla horneada, preservando la fisonomía de la persona.',
    color: 'amber',
    gradient: 'from-amber-600 to-orange-700',
  },
  {
    id: 'cabana',
    name: 'Estilo Cabaña',
    shortDesc: 'Madera rústica y ambiente de bosque',
    promptModifier:
      'Estilo rústico de cabaña acogedora en el bosque. Tallas de madera noble, fondo de troncos rústicos, chimenea encendida con cálida luz dorada, texturas naturales de lana, lino y madera envejecida, integrando a la persona en una atmósfera acogedora de cabaña alpina.',
    color: 'emerald',
    gradient: 'from-amber-700 via-orange-800 to-yellow-900',
  },
  {
    id: 'robotico',
    name: 'Robótico / Cyborg',
    shortDesc: 'Androide futurista con titanio y circuitos',
    promptModifier:
      'Estilo robótico futurista y cibernético de alta tecnología. Placas de titanio y cromo pulido, uniones mecánicas precisas, finos filamentos de circuitos luminiscentes y sutiles luces LED integradas en la estructura facial y cuello, manteniendo la identidad humana fusionada con un androide cyborg de última generación.',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'oleo',
    name: 'Pintura al Óleo',
    shortDesc: 'Cuadro renacentista con textura de lienzo',
    promptModifier:
      'Estilo de pintura al óleo clásica de museo histórico, con pinceladas ricas en empaste visible, iluminación dramática de claroscuro estilo Rembrandt, rica textura de lienzo de lino antiguo y paleta de tonos nobles.',
    color: 'yellow',
    gradient: 'from-yellow-600 to-amber-700',
  },
  {
    id: 'anime',
    name: 'Anime Ghibli',
    shortDesc: 'Animación tradicional mágica dibujada a mano',
    promptModifier:
      'Estilo de animación cinematográfica japonesa dibujada a mano por Studio Ghibli. Fondos pintados con gouache y acuarela, colores ricos y luminosos, iluminación mágica, trazos limpios, cálidos y expresivos.',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'marmol',
    name: 'Escultura de Mármol',
    shortDesc: 'Estatua clásica grecorromana tallada',
    promptModifier:
      'Estilo de escultura clásica tallada en mármol blanco pulido de Carrara. Textura de piedra cincelada, sombras arquitectónicas, estética de estatua grecorromana noble y atemporal conservando la fisonomía exacta de la persona.',
    color: 'slate',
    gradient: 'from-slate-400 to-zinc-600',
  },
  {
    id: 'noir',
    name: 'Cine Noir Vintage',
    shortDesc: 'Blanco y negro cinematográfico años 40',
    promptModifier:
      'Estilo cinematográfico de cine noir de los años 40 en blanco y negro analógico. Contrastes dramáticos en claroscuro, iluminación dura con sombras de persiana, suave grano fotográfico de película de 35mm y elegancia misteriosa.',
    color: 'zinc',
    gradient: 'from-zinc-600 to-neutral-900',
  },
  {
    id: 'acuarela',
    name: 'Acuarela Etérea',
    shortDesc: 'Manchas de pigmento fluido y papel de algodón',
    promptModifier:
      'Estilo de pintura en acuarela húmeda artística sobre papel de algodón texturizado. Manchas de pigmento fluido traslúcido, sutiles salpicaduras y degradados suaves, atmósfera soñadora, etérea y poética.',
    color: 'teal',
    gradient: 'from-teal-400 to-emerald-600',
  },
  {
    id: 'neon',
    name: 'Neón Holográfico 3D',
    shortDesc: 'Cyberpunk con luces holográficas brillantes',
    promptModifier:
      'Estilo 3D holográfico con intensa iluminación de neón cyberpunk en tonos cian, violeta y fucsia. Resplandores volumétricos, reflejos luminosos futuristas y estética digital moderna de render en alta definición.',
    color: 'purple',
    gradient: 'from-purple-600 via-fuchsia-500 to-indigo-600',
  },
];

export const getStyleFilterById = (id?: string | null): StyleFilter => {
  return STYLE_FILTERS.find((s) => s.id === id) || STYLE_FILTERS[0];
};
