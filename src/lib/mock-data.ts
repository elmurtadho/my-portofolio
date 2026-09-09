export interface ProfileData {
  displayName: string;
  role?: string;
  roles: string[];
  greeting: string;
  photoUrl: string;
  tagline: string;
}

export interface AboutData {
  bio: string;
  imageUrl: string;
  experienceYears: number;
  completedProjects: number;
  satisfiedClients: number;
  highlightPoints: string[];
}

export interface SkillItem {
  id: number;
  name: string;
  level: number;
  category: string;
  icon?: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface ProjectItem {
  id: number;
  title: string;
  description: string;
  categorySlug: string;
  mediaType: "image" | "video" | "model3d";
  mediaUrl: string;
  thumbnailUrl: string;
  featured?: boolean;
  tags: string[];
  modelKey?: "packaging-box" | "cyber-helmet" | "beverage-can";
  client?: string;
  year?: string;
  software?: string[];
  dimensions?: string;
  materialSpecs?: string;
  polyCount?: string;
  conceptDetails?: string;
}

export interface ContactData {
  email: string;
  phone: string;
  location: string;
  socials: {
    platform: string;
    url: string;
  }[];
}

export const initialProfile: ProfileData = {
  displayName: "Ahmad Elmurtadho",
  roles: [
    "Multidisciplinary Designer",
    "UI/UX Specialist",
    "Video Motion Artist",
    "3D Visual Creator",
  ],
  greeting: "Halo, saya siap mewujudkan ide kreatif Anda.",
  tagline: "Memadukan estetika visual mutakhir, interaktivitas hidup, dan pengalaman digital berkelas tinggi.",
  photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
};

export const initialAbout: AboutData = {
  bio: "Saya adalah desainer multidisiplin dan pengembang kreatif dengan gairah besar dalam merancang pengalaman digital yang memikat dan berkarakter. Berpengalaman dalam menciptakan identitas visual grafis, prototipe antarmuka UI/UX yang intuitif, visual motion video sinematik, hingga model 3D interaktif real-time di web.",
  imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  experienceYears: 4,
  completedProjects: 48,
  satisfiedClients: 35,
  highlightPoints: [
    "Fokus pada estetika clean dark-mode dengan aksen mint futuristik",
    "Sentuhan micro-interaction dan visual interaktif 3D di browser",
    "Pendekatan human-centered design untuk solusi bisnis yang presisi",
  ],
};

export const initialCategories: CategoryItem[] = [
  { id: 1, name: "Graphic Design", slug: "graphic-design", description: "Identitas visual, branding, dan materi promosi visual berkualitas." },
  { id: 2, name: "UI/UX", slug: "ui-ux", description: "Desain sistem, antarmuka web/mobile, dan user flow yang nyaman digunakan." },
  { id: 3, name: "Video Editor", slug: "video-editor", description: "Motion graphics, video showcase sinematik, dan visual reels dinamis." },
  { id: 4, name: "3D Modeling", slug: "3d-modeling", description: "Aset 3D interaktif yang dapat dieksplorasi secara 360 derajat di browser." },
];

export const initialSkills: SkillItem[] = [
  { id: 1, name: "Figma & UI Design", level: 95, category: "UI/UX", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
  { id: 2, name: "Prototyping & Wireframing", level: 90, category: "UI/UX", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
  { id: 3, name: "Adobe Photoshop & Illustrator", level: 92, category: "Design", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg" },
  { id: 4, name: "Brand Identity Design", level: 88, category: "Design", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg" },
  { id: 5, name: "Blender 3D Modeling", level: 85, category: "3D", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/blender/blender-original.svg" },
  { id: 6, name: "Three.js & WebGL Visuals", level: 80, category: "3D", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg" },
  { id: 7, name: "Adobe Premiere & After Effects", level: 86, category: "Video", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/premierepro/premierepro-plain.svg" },
  { id: 8, name: "Motion Graphic Animation", level: 84, category: "Video", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/aftereffects/aftereffects-plain.svg" },
  { id: 9, name: "Tailwind CSS & Frontend", level: 88, category: "Tech", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
];

export const initialProjects: ProjectItem[] = [
  {
    id: 1,
    title: "Neon Mint Banking App",
    description: "Aplikasi perbankan generasi baru dengan antarmuka dark-mode intuitif dan grafik alur kas real-time.",
    categorySlug: "ui-ux",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    featured: true,
    tags: ["Mobile App", "Figma", "Fintech"],
  },
  {
    id: 2,
    title: "Cyberpunk Geometric Brand Identity",
    description: "Desain identitas brand futuristik mencakup logo vektor, brand guidelines, dan merchandise pack.",
    categorySlug: "graphic-design",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=600&q=80",
    featured: true,
    tags: ["Branding", "Vector", "Identity"],
  },
  {
    id: 3,
    title: "Emerald Kinetic Motion Reel",
    description: "Video motion grafik berdurasi 45 detik untuk peluncuran produk hardware teknologi tinggi.",
    categorySlug: "video-editor",
    mediaType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80",
    featured: true,
    tags: ["After Effects", "Commercial", "Motion"],
  },
  {
    id: 4,
    title: "Luxury Cosmetic Packaging Box 3D",
    description: "Desain kemasan box produk mewah dengan struktur lipatan custom, finishing soft-touch matte & gold foil, serta visualisasi 3D unboxing interaktif yang bisa dibongkar pasang.",
    categorySlug: "3d-modeling",
    mediaType: "model3d",
    mediaUrl: "packaging-box",
    modelKey: "packaging-box",
    thumbnailUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    featured: true,
    tags: ["Packaging Design", "Bisa Dibongkar", "Blender 3D", "Unboxing"],
    client: "Élixir Botanique Paris",
    year: "2024",
    software: ["Blender 4.2 LTS", "Substance 3D Painter", "Three.js WebGL"],
    dimensions: "105mm × 80mm × 195mm",
    materialSpecs: "Art Carton 360gsm, Soft-Touch Matte Laminate, Spot UV Gold Foil",
    polyCount: "18,420 Tris • 9,350 Vertices",
    conceptDetails: "Dirancang dengan prinsip unboxing ergonomis di mana tutup atas membuka dengan mulus, flap pelindung samping terurai ke arah luar, dan wadah produk utama terangkat secara elegan.",
  },
  {
    id: 5,
    title: "EcoSmart Dashboard System",
    description: "Sistem dashboard analitik IoT untuk efisiensi energi bangunan pintar dengan tema dark mint.",
    categorySlug: "ui-ux",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
    featured: false,
    tags: ["Dashboard", "UI/UX", "Data Viz"],
  },
  {
    id: 6,
    title: "Cybernetic Helmet & Modular Visor Rig 3D",
    description: "Model helm sci-fi futuristik dengan shader mint metallic dinamis, visor magnetik, dan struktur perakitan modular terurai (exploded view).",
    categorySlug: "3d-modeling",
    mediaType: "model3d",
    mediaUrl: "cyber-helmet",
    modelKey: "cyber-helmet",
    thumbnailUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
    featured: true,
    tags: ["Hard Surface", "Bisa Dibongkar", "Cyberpunk", "Procedural"],
    client: "Aegis Cybernetics Tech",
    year: "2024",
    software: ["Blender 4.2 LTS", "ZBrush", "Three.js"],
    dimensions: "320mm × 260mm × 290mm",
    materialSpecs: "Carbon Fiber Composite, Anodized Titanium Mint, Nanotech Glass Visor",
    polyCount: "34,800 Tris • 17,920 Vertices",
    conceptDetails: "Struktur helm modular terbagi menjadi tempurung luar aerodinamis, visor optik ganda, pelindung rahang bawah, modul audio samping, dan bantalan shock-absorber internal.",
  },
  {
    id: 7,
    title: "Minimalist Beverage Can & Label Packaging 3D",
    description: "Konsep kemasan kaleng minuman energi organik dengan detail material aluminium brushed, tab opener terpisah, dan label silinder 360 derajat yang dapat dibongkar.",
    categorySlug: "3d-modeling",
    mediaType: "model3d",
    mediaUrl: "beverage-can",
    modelKey: "beverage-can",
    thumbnailUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    featured: false,
    tags: ["Packaging 3D", "Bisa Dibongkar", "Can Mockup", "Aluminium"],
    client: "MintPulse Energy Co.",
    year: "2024",
    software: ["Blender 4.2 LTS", "Adobe Illustrator", "Three.js"],
    dimensions: "Diameter 66mm × Tinggi 155mm (330ml)",
    materialSpecs: "Recyclable Matte Brushed Aluminium, Embossed Pull Tab, Tactile Ink Label",
    polyCount: "14,200 Tris • 7,140 Vertices",
    conceptDetails: "Eksplorasi kemasan kaleng ramping modern dengan sistem uncoupling antara penutup atas, ring pembuka, sleeve label printed, dan silinder aluminium primer.",
  },
];

export const initialContact: ContactData = {
  email: "murtadho.portfolio@example.com",
  phone: "+62 812-3456-7890",
  location: "Jakarta, Indonesia",
  socials: [
    { platform: "GitHub", url: "https://github.com" },
    { platform: "LinkedIn", url: "https://linkedin.com" },
    { platform: "Instagram", url: "https://instagram.com" },
    { platform: "Dribbble", url: "https://dribbble.com" },
  ],
};
