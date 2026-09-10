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
  order?: number;
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
  photoUrl: "",
};

export const initialAbout: AboutData = {
  bio: "Saya adalah desainer multidisiplin dan pengembang kreatif dengan gairah besar dalam merancang pengalaman digital yang memikat dan berkarakter. Berpengalaman dalam menciptakan identitas visual grafis, prototipe antarmuka UI/UX yang intuitif, visual motion video sinematik, hingga model 3D interaktif real-time di web.",
  imageUrl: "",
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
  // --- UI / UX DESIGNS ---
  {
    id: 1,
    title: "Neon Mint Banking App",
    description: "Aplikasi perbankan generasi baru dengan antarmuka dark-mode intuitif, grafik alur kas real-time, dan micro-interaction responsif.",
    categorySlug: "ui-ux",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    featured: true,
    tags: ["Mobile App", "Figma", "Fintech", "Design System"],
    client: "Aura Digital Bank",
    year: "2024",
    software: ["Figma", "Design System", "ProtoPie", "Tailwind CSS"],
    conceptDetails: "Fokus pada kemudahan transaksi keuangan harian anak muda dengan palet warna dark mint yang menenangkan dan kartu analitik modular.",
  },
  {
    id: 8,
    title: "KlinikPintar — Telemedicine & Healthcare App",
    description: "Perancangan antarmuka & alur pengalaman pengguna aplikasi konsultasi dokter spesialis, rekam medis digital terenkripsi, dan pesan antar resep obat apotek instan.",
    categorySlug: "ui-ux",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
    featured: true,
    tags: ["Healthcare", "Mobile App", "UX Research", "Figma"],
    client: "Medika Nusantara Health",
    year: "2024",
    software: ["Figma", "FigJam", "ProtoPie", "User Testing"],
    conceptDetails: "Mengurangi waktu tunggu pasien dan kecemasan antrean dengan antarmuka yang empatik, kontras tinggi yang ramah aksesibilitas, dan panduan langkah dokter yang jelas.",
  },
  {
    id: 9,
    title: "ApexTrade — Multi-Asset Trading Terminal",
    description: "Platform terminal perdagangan aset kripto dan saham multi-pasar untuk web & tablet dengan visualisasi chart candlestick berkecepatan tinggi dan workspace modular.",
    categorySlug: "ui-ux",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=600&q=80",
    featured: false,
    tags: ["Fintech", "Trading Terminal", "Web App", "Dark Mode"],
    client: "Apex Global Capital",
    year: "2024",
    software: ["Figma", "React", "Tailwind CSS", "TradingView API"],
    conceptDetails: "Arsitektur antarmuka berkepadatan tinggi yang dioptimalkan untuk keputusan sepersekian detik para trader aktif tanpa membuat mata lelah.",
  },
  {
    id: 10,
    title: "NomadStay — Curated Eco-Villa Booking Platform",
    description: "Aplikasi kurasi dan reservasi vila privat bernuansa alam dengan navigasi peta spasial interaktif, tur virtual 360°, dan alur checkout nirgesek 3 langkah.",
    categorySlug: "ui-ux",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    featured: false,
    tags: ["Hospitality", "Mobile UX", "Booking Flow", "Micro-interaction"],
    client: "Nomad Hospitality Group",
    year: "2024",
    software: ["Figma", "ProtoPie", "After Effects"],
    conceptDetails: "Mengutamakan fotografi spasial imersif dengan transisi navigasi halus yang membangkitkan rasa ketenangan bagi pelancong sebelum tiba di destinasi.",
  },
  {
    id: 5,
    title: "EcoSmart Dashboard — IoT Energy Monitoring System",
    description: "Sistem dashboard analitik IoT untuk efisiensi energi bangunan pintar dengan tema dark mint, grafik beban real-time, dan manajemen anomali daya.",
    categorySlug: "ui-ux",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
    featured: false,
    tags: ["Dashboard", "UI/UX", "Data Viz", "SaaS"],
    client: "GreenBuilding Technologies",
    year: "2024",
    software: ["Figma", "Design System", "Data Viz", "React"],
    conceptDetails: "Mengorganisasi ribuan titik sensor gedung pencakar langit ke dalam visualisasi data hierarkis yang ramah teknisi lapangan.",
  },

  // --- GRAPHIC DESIGN ---
  {
    id: 2,
    title: "Cyberpunk Geometric Brand Identity",
    description: "Desain identitas brand futuristik mencakup logo vektor geometris, brand guidelines komprehensif, typography system, dan merchandise pack premium.",
    categorySlug: "graphic-design",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=600&q=80",
    featured: true,
    tags: ["Branding", "Vector", "Identity", "Logo Design"],
    client: "Kinetix Cybernetic Apparel",
    year: "2024",
    software: ["Adobe Illustrator", "Photoshop", "InDesign"],
    conceptDetails: "Eksplorasi garis isometrik dan warna neon mint di atas kanvas hitam pekat untuk mencerminkan ketegasan brand fesyen teknologi masa depan.",
  },
  {
    id: 11,
    title: "Aruna Artisan Coffee — Visual Identity & Packaging Suite",
    description: "Identitas visual holistik untuk roastery kopi artisan: logo monogram tipografi custom, label packaging kopi ramah lingkungan, kartu origin beans, dan tote bag merchandise.",
    categorySlug: "graphic-design",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=600&q=80",
    featured: true,
    tags: ["Brand Identity", "Packaging", "Typography", "Print Design"],
    client: "Aruna Specialty Coffee Roastery",
    year: "2024",
    software: ["Adobe Illustrator", "Photoshop", "InDesign"],
    conceptDetails: "Menggabungkan ornamen garis kontur perkebunan kopi pegunungan nusantara dengan tipografi serif modern bernuansa hangat dan otentik.",
  },
  {
    id: 12,
    title: "Nusantara Soundwave 2024 — Music Festival Poster Series",
    description: "Seri poster festival musik indie eksperimental dengan pendekatan tipografi kinetik kontemporer, teknik risograph duotone emerald-amber, dan set tiket hologram anti-pemalsuan.",
    categorySlug: "graphic-design",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    featured: false,
    tags: ["Poster Design", "Typography", "Key Visual", "Printmaking"],
    client: "Kolektif Soundwave Indonesia",
    year: "2024",
    software: ["Adobe Illustrator", "Photoshop"],
    conceptDetails: "Eksperimen tipografi swiss-style yang didekonstruksi untuk merefleksikan gelombang frekuensi audio dinamis dari para musisi indie alternatif.",
  },
  {
    id: 13,
    title: "Botanica Organics — Minimalist Skincare Box & Dieline",
    description: "Sistem desain kemasan kosmetik organik bersertifikat dengan struktur lipatan dieline presisi, teknik foil stamping emas minimalis di atas kertas katun daur ulang ramah lingkungan.",
    categorySlug: "graphic-design",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    featured: false,
    tags: ["Cosmetic Packaging", "Dieline", "Branding", "Luxury Print"],
    client: "Botanica Herbals Co.",
    year: "2024",
    software: ["Adobe Illustrator", "Photoshop", "Esko Studio"],
    conceptDetails: "Menyeimbangkan prinsip keberlanjutan lingkungan (biodegradable) dengan sentuhan kemewahan minimalis lewat tekstur emboss halus.",
  },
  {
    id: 14,
    title: "Metamorfosa: Antologi Puisi — Editorial & Book Cover Design",
    description: "Desain sampul buku hardcover bertekstur linen dengan debossing tipografi minimalis serta tata letak editorial grid buku antologi sastra bilingual 240 halaman.",
    categorySlug: "graphic-design",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    featured: false,
    tags: ["Editorial Design", "Book Cover", "Grid System", "Publication"],
    client: "Pustaka Aksara Press",
    year: "2024",
    software: ["Adobe InDesign", "Illustrator", "Photoshop"],
    conceptDetails: "Penerapan rasio emas (golden ratio) pada margin buku untuk memaksimalkan kenyamanan membaca puisi sastra kontemporer.",
  },

  // --- VIDEO EDITOR ---
  {
    id: 3,
    title: "Emerald Kinetic Motion Reel",
    description: "Video motion grafik berdurasi 45 detik untuk peluncuran produk hardware teknologi tinggi dengan transisi kamera 3D dinamis dan sound design imersif.",
    categorySlug: "video-editor",
    mediaType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80",
    featured: true,
    tags: ["After Effects", "Commercial", "Motion", "Premiere Pro"],
    client: "Nexus Hardware Labs",
    year: "2024",
    software: ["Adobe After Effects", "Premiere Pro", "Cinema 4D"],
    conceptDetails: "Rangkaian animasi kinetik tipografi dan pecahan partikel cahaya mint yang memukau untuk peluncuran produk hardware flagship.",
  },
  {
    id: 15,
    title: "HyperDrive Hypercar — 3D Commercial Motion Reel",
    description: "Showcase video komersial sinematik peluncuran hypercar elektrik masa depan dengan integrasi visual 3D CGI, sound design menggelegar, dan grading warna sinematik dinamis.",
    categorySlug: "video-editor",
    mediaType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80",
    featured: false,
    tags: ["3D Animation", "Commercial", "Color Grading", "Sound Design"],
    client: "Veloce Automotive",
    year: "2024",
    software: ["Premiere Pro", "DaVinci Resolve", "Blender"],
    conceptDetails: "Komposisi ritme visual berkecepatan tinggi yang memadukan raungan mesin elektrik bertenaga turbo dengan aksentuasi neon lintasan balap malam hari.",
  },

  // --- 3D MODELING (360° INTERACTIVE & EXPLODED VIEW) ---
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
