export interface Product {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  description: string | null;
  rental_type: 'rentable' | 'consumable' | 'service';
  status: 'active' | 'archived' | 'draft';
  image_url?: string;
  price: number;
  available: boolean;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  code: string;
}

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-cameras-111', name: 'Cameras', code: 'CAM' },
  { id: 'cat-audio-222', name: 'Audio', code: 'AUD' },
  { id: 'cat-lighting-333', name: 'Lighting', code: 'LGT' },
  { id: 'cat-lenses-444', name: 'Lenses', code: 'LNS' },
  { id: 'cat-tripods-555', name: 'Tripods & Supports', code: 'TRP' },
  { id: 'cat-video-666', name: 'Video Equipment', code: 'VID' },
  { id: 'cat-drones-777', name: 'Drones', code: 'DRN' },
  { id: 'cat-projectors-888', name: 'Projectors', code: 'PRJ' }
];

export const MOCK_PRODUCTS: Product[] = [
  // 1. Cameras
  {
    id: 'prod-camera-111',
    category_id: 'cat-cameras-111',
    name: 'Professional Cinema Camera Kit',
    sku: 'PROD-CAM-01',
    description: 'High-end cinema camera package with external RAW recorder, rig cage, and battery plate.',
    rental_type: 'rentable',
    status: 'active',
    price: 299,
    available: true,
    rating: 4.9
  },
  {
    id: 'prod-camera-222',
    category_id: 'cat-cameras-111',
    name: 'Full-Frame Mirrorless Vlog Camera',
    sku: 'PROD-CAM-02',
    description: 'Ultra-compact full-frame mirrorless camera optimized for content creators and high-end vlogging.',
    rental_type: 'rentable',
    status: 'active',
    price: 89,
    available: true,
    rating: 4.7
  },
  {
    id: 'prod-camera-333',
    category_id: 'cat-cameras-111',
    name: 'Waterproof 4K Action Camera',
    sku: 'PROD-CAM-03',
    description: 'Rugged, pocket-sized action camera with hypersmooth stabilization and deep-water housing.',
    rental_type: 'rentable',
    status: 'active',
    price: 39,
    available: true,
    rating: 4.5
  },
  {
    id: 'prod-camera-444',
    category_id: 'cat-cameras-111',
    name: 'Studio DSLR Camera Body',
    sku: 'PROD-CAM-04',
    description: 'High-megapixel DSLR body perfect for commercial studio portraits and product photography.',
    rental_type: 'rentable',
    status: 'active',
    price: 149,
    available: false,
    rating: 4.8
  },

  // 2. Audio
  {
    id: 'prod-audio-222',
    category_id: 'cat-audio-222',
    name: 'Wireless Lavalier Microphone',
    sku: 'PROD-AUD-01',
    description: 'Dual-channel wireless mic kit with noise-canceling technology, charging case, and adapters.',
    rental_type: 'rentable',
    status: 'active',
    price: 49,
    available: true,
    rating: 4.6
  },
  {
    id: 'prod-audio-223',
    category_id: 'cat-audio-222',
    name: 'Podcast Studio Audio Mixer',
    sku: 'PROD-AUD-02',
    description: 'All-in-one production mixer with smart sound pads, high-gain preamps, and Bluetooth integration.',
    rental_type: 'rentable',
    status: 'active',
    price: 79,
    available: true,
    rating: 4.8
  },
  {
    id: 'prod-audio-224',
    category_id: 'cat-audio-222',
    name: 'Closed-Back Studio Headphones',
    sku: 'PROD-AUD-03',
    description: 'Professional reference monitoring headphones designed for mixing, tracking, and critical listening.',
    rental_type: 'rentable',
    status: 'active',
    price: 19,
    available: true,
    rating: 4.4
  },
  {
    id: 'prod-audio-225',
    category_id: 'cat-audio-222',
    name: 'Directional Shotgun Microphone',
    sku: 'PROD-AUD-04',
    description: 'Supercardioid condenser shotgun mic with boom pole, shockmount, and fuzzy windscreen.',
    rental_type: 'rentable',
    status: 'active',
    price: 35,
    available: true,
    rating: 4.6
  },

  // 3. Lighting
  {
    id: 'prod-lighting-333',
    category_id: 'cat-lighting-333',
    name: 'LED Studio Panel Light',
    sku: 'PROD-LGT-01',
    description: 'Bi-color dimmable LED light panel for studio and field production with built-in barndoors.',
    rental_type: 'rentable',
    status: 'active',
    price: 59,
    available: true,
    rating: 4.7
  },
  {
    id: 'prod-lighting-334',
    category_id: 'cat-lighting-333',
    name: '18-inch RGB Ring Light Kit',
    sku: 'PROD-LGT-02',
    description: 'Adjustable RGB color temperature ring light with stand and smartphone tripod mount.',
    rental_type: 'rentable',
    status: 'active',
    price: 25,
    available: true,
    rating: 4.3
  },
  {
    id: 'prod-lighting-335',
    category_id: 'cat-lighting-333',
    name: 'Softbox Studio Strobe Set',
    sku: 'PROD-LGT-03',
    description: 'High-power studio strobes with rectangular softboxes, honeycomb grids, and heavy-duty C-stands.',
    rental_type: 'rentable',
    status: 'active',
    price: 99,
    available: true,
    rating: 4.8
  },
  {
    id: 'prod-lighting-336',
    category_id: 'cat-lighting-333',
    name: 'COB High-Power Spot Video Light',
    sku: 'PROD-LGT-04',
    description: 'Continuous daylight spotlight with Bowens mount, wireless remote control, and soft diffuser dome.',
    rental_type: 'rentable',
    status: 'active',
    price: 129,
    available: true,
    rating: 4.9
  },

  // 4. Lenses
  {
    id: 'prod-lenses-444',
    category_id: 'cat-lenses-444',
    name: 'Cinema Prime Lens Kit',
    sku: 'PROD-LNS-01',
    description: 'F1.4 prime lens set (24mm, 35mm, 50mm, 85mm) with focus gears and carry case.',
    rental_type: 'rentable',
    status: 'active',
    price: 199,
    available: true,
    rating: 4.9
  },
  {
    id: 'prod-lenses-445',
    category_id: 'cat-lenses-444',
    name: '24-70mm f/2.8 Standard Zoom Lens',
    sku: 'PROD-LNS-02',
    description: 'Fast constant-aperture standard zoom lens with advanced optical stabilization.',
    rental_type: 'rentable',
    status: 'active',
    price: 79,
    available: true,
    rating: 4.7
  },
  {
    id: 'prod-lenses-446',
    category_id: 'cat-lenses-444',
    name: '70-200mm f/2.8 Telephoto Zoom Lens',
    sku: 'PROD-LNS-03',
    description: 'Professional telephoto zoom lens with superior clarity, ideal for sports and events.',
    rental_type: 'rentable',
    status: 'active',
    price: 119,
    available: true,
    rating: 4.8
  },
  {
    id: 'prod-lenses-447',
    category_id: 'cat-lenses-444',
    name: '50mm f/1.8 Compact Prime Lens',
    sku: 'PROD-LNS-04',
    description: 'Fast, compact normal prime lens offering superb image quality and bokeh.',
    rental_type: 'rentable',
    status: 'active',
    price: 29,
    available: true,
    rating: 4.6
  },

  // 5. Tripods & Supports
  {
    id: 'prod-tripods-555',
    category_id: 'cat-tripods-555',
    name: 'Carbon Fiber Tripod System',
    sku: 'PROD-TRP-01',
    description: 'Ultra-lightweight carbon fiber legs with professional fluid head and mid-level spreader.',
    rental_type: 'rentable',
    status: 'active',
    price: 45,
    available: true,
    rating: 4.7
  },
  {
    id: 'prod-tripods-556',
    category_id: 'cat-tripods-555',
    name: 'Motorized Video Camera Slider',
    sku: 'PROD-TRP-02',
    description: 'Carbon fiber camera slider with programmable app control for time-lapses and smooth pans.',
    rental_type: 'rentable',
    status: 'active',
    price: 39,
    available: true,
    rating: 4.5
  },
  {
    id: 'prod-tripods-557',
    category_id: 'cat-tripods-555',
    name: '3-Axis Handheld Gimbal Stabilizer',
    sku: 'PROD-TRP-03',
    description: 'Active motorized gimbal stabilizer for DSLR/mirrorless cameras with creative capture modes.',
    rental_type: 'rentable',
    status: 'active',
    price: 69,
    available: true,
    rating: 4.8
  },
  {
    id: 'prod-tripods-558',
    category_id: 'cat-tripods-555',
    name: 'Heavy Duty Fluid Head Monopod',
    sku: 'PROD-TRP-04',
    description: 'Professional aluminum monopod featuring a fluid head and folding base feet.',
    rental_type: 'rentable',
    status: 'active',
    price: 19,
    available: true,
    rating: 4.4
  },

  // 6. Video Equipment
  {
    id: 'prod-video-666',
    category_id: 'cat-video-666',
    name: 'HDMI/SDI Wireless Video Link',
    sku: 'PROD-VID-01',
    description: 'Wireless video transmitter and receiver kit with 500ft range and low latency transmission.',
    rental_type: 'rentable',
    status: 'active',
    price: 89,
    available: true,
    rating: 4.6
  },
  {
    id: 'prod-video-667',
    category_id: 'cat-video-666',
    name: '4K HDMI Video Capture Card',
    sku: 'PROD-VID-02',
    description: 'Plug-and-play USB capture card for recording and streaming high-definition camera feeds.',
    rental_type: 'rentable',
    status: 'active',
    price: 29,
    available: true,
    rating: 4.5
  },
  {
    id: 'prod-video-668',
    category_id: 'cat-video-666',
    name: '7-inch High-Bright Camera Monitor',
    sku: 'PROD-VID-03',
    description: 'Touchscreen field monitor with HDR waveforms, LUT loading support, and sunhood.',
    rental_type: 'rentable',
    status: 'active',
    price: 49,
    available: true,
    rating: 4.7
  },
  {
    id: 'prod-video-669',
    category_id: 'cat-video-666',
    name: 'iPad-compatible Teleprompter Kit',
    sku: 'PROD-VID-04',
    description: 'Professional standard beam splitter glass teleprompter kit for prompt dialogue scripts.',
    rental_type: 'rentable',
    status: 'active',
    price: 59,
    available: true,
    rating: 4.3
  },

  // 7. Drones
  {
    id: 'prod-drones-777',
    category_id: 'cat-drones-777',
    name: 'GPS 4K Camera Drone',
    sku: 'PROD-DRN-01',
    description: 'Foldable quadcopter drone with 3-axis gimbal camera, smart tracking, and safety sensors.',
    rental_type: 'rentable',
    status: 'active',
    price: 159,
    available: true,
    rating: 4.8
  },
  {
    id: 'prod-drones-778',
    category_id: 'cat-drones-777',
    name: 'FPV Micro Racing Drone Kit',
    sku: 'PROD-DRN-02',
    description: 'Mini FPV racing drone with analog goggles, radio controller, and batteries included.',
    rental_type: 'rentable',
    status: 'active',
    price: 99,
    available: true,
    rating: 4.4
  },
  {
    id: 'prod-drones-779',
    category_id: 'cat-drones-777',
    name: 'CineWhoop Indoor FPV Drone',
    sku: 'PROD-DRN-03',
    description: 'Duct-protected FPV drone optimized for cinematic indoor fly-through video sequences.',
    rental_type: 'rentable',
    status: 'active',
    price: 129,
    available: true,
    rating: 4.7
  },
  {
    id: 'prod-drones-780',
    category_id: 'cat-drones-777',
    name: 'Industrial Heavy Lift Octocopter',
    sku: 'PROD-DRN-04',
    description: 'Heavy-duty drone capable of lifting cinema cameras or mapping payloads.',
    rental_type: 'rentable',
    status: 'active',
    price: 499,
    available: false,
    rating: 4.9
  },

  // 8. Projectors
  {
    id: 'prod-projectors-888',
    category_id: 'cat-projectors-888',
    name: '4K Laser Ultra Short Throw Projector',
    sku: 'PROD-PRJ-01',
    description: 'High-brightness laser projector for indoor cinema screens and home theaters.',
    rental_type: 'rentable',
    status: 'active',
    price: 249,
    available: true,
    rating: 4.8
  },
  {
    id: 'prod-projectors-889',
    category_id: 'cat-projectors-888',
    name: 'Portable Smart Mini Projector',
    sku: 'PROD-PRJ-02',
    description: 'Battery-powered smart projector with built-in speaker and streaming apps.',
    rental_type: 'rentable',
    status: 'active',
    price: 39,
    available: true,
    rating: 4.3
  },
  {
    id: 'prod-projectors-890',
    category_id: 'cat-projectors-888',
    name: '120-inch Outdoor Cinema Screen',
    sku: 'PROD-PRJ-03',
    description: 'Inflatable high-reflectance screen with blower for backyard movie nights.',
    rental_type: 'rentable',
    status: 'active',
    price: 69,
    available: true,
    rating: 4.6
  },
  {
    id: 'prod-projectors-891',
    category_id: 'cat-projectors-888',
    name: 'High-Lumen Venue Laser Projector',
    sku: 'PROD-PRJ-04',
    description: 'Super bright professional laser projector for conventions, stages, and installations.',
    rental_type: 'rentable',
    status: 'active',
    price: 399,
    available: true,
    rating: 4.9
  }
];

export const MOCK_VARIANTS: Record<string, any[]> = {
  'prod-camera-111': [{ id: 'var-camera-std-111', name: 'Cinema Kit — Standard', sku: 'VAR-CAM-STD' }],
  'prod-camera-222': [{ id: 'var-camera-vlog-222', name: 'Vlog Kit — Basic', sku: 'VAR-CAM-VLOG' }],
  'prod-camera-333': [{ id: 'var-camera-act-333', name: 'Action Kit — Adventure', sku: 'VAR-CAM-ACT' }],
  'prod-camera-444': [{ id: 'var-camera-dslr-444', name: 'DSLR Kit — Studio', sku: 'VAR-CAM-DSLR' }],

  'prod-audio-222': [{ id: 'var-audio-std-222', name: 'Lavalier Mic — Dual Channel', sku: 'VAR-AUD-STD' }],
  'prod-audio-223': [{ id: 'var-audio-mix-223', name: 'Mixer Console', sku: 'VAR-AUD-MIX' }],
  'prod-audio-224': [{ id: 'var-audio-hdp-224', name: 'Studio Headphones', sku: 'VAR-AUD-HDP' }],
  'prod-audio-225': [{ id: 'var-audio-sht-225', name: 'Shotgun Mic Set', sku: 'VAR-AUD-SHT' }],

  'prod-lighting-333': [{ id: 'var-lighting-std-333', name: 'LED Studio Panel — 100W', sku: 'VAR-LGT-STD' }],
  'prod-lighting-334': [{ id: 'var-lighting-rng-334', name: 'Ring Light — 18"', sku: 'VAR-LGT-RNG' }],
  'prod-lighting-335': [{ id: 'var-lighting-stb-335', name: 'Softbox Kit — Dual Strobes', sku: 'VAR-LGT-STB' }],
  'prod-lighting-336': [{ id: 'var-lighting-cob-336', name: 'COB Video Light', sku: 'VAR-LGT-COB' }],

  'prod-lenses-444': [{ id: 'var-lenses-std-444', name: 'Prime Lens Set — Full Frame', sku: 'VAR-LNS-STD' }],
  'prod-lenses-445': [{ id: 'var-lenses-zm-445', name: '24-70mm Zoom Lens', sku: 'VAR-LNS-ZM' }],
  'prod-lenses-446': [{ id: 'var-lenses-tel-446', name: '70-200mm Zoom Lens', sku: 'VAR-LNS-TEL' }],
  'prod-lenses-447': [{ id: 'var-lenses-50-447', name: '50mm Prime Lens', sku: 'VAR-LNS-50' }],

  'prod-tripods-555': [{ id: 'var-tripods-std-555', name: 'Carbon Tripod — 75mm Bowl', sku: 'VAR-TRP-STD' }],
  'prod-tripods-556': [{ id: 'var-tripods-sld-556', name: 'Motorized Slider — 80cm', sku: 'VAR-TRP-SLD' }],
  'prod-tripods-557': [{ id: 'var-tripods-gmb-557', name: 'Gimbal Stabilizer Pro', sku: 'VAR-TRP-GMB' }],
  'prod-tripods-558': [{ id: 'var-tripods-mnp-558', name: 'Fluid Head Monopod', sku: 'VAR-TRP-MNP' }],

  'prod-video-666': [{ id: 'var-video-std-666', name: 'Wireless Video Link — SDI/HDMI', sku: 'VAR-VID-STD' }],
  'prod-video-667': [{ id: 'var-video-cap-667', name: '4K Capture Card', sku: 'VAR-VID-CAP' }],
  'prod-video-668': [{ id: 'var-video-mon-668', name: '7" High-Bright Monitor', sku: 'VAR-VID-MON' }],
  'prod-video-669': [{ id: 'var-video-prm-669', name: 'iPad Teleprompter', sku: 'VAR-VID-PRM' }],

  'prod-drones-777': [{ id: 'var-drones-std-777', name: '4K Video Drone — Pro Bundle', sku: 'VAR-DRN-STD' }],
  'prod-drones-778': [{ id: 'var-drones-rc-778', name: 'FPV Racing Drone Starter', sku: 'VAR-DRN-RC' }],
  'prod-drones-779': [{ id: 'var-drones-cn-779', name: 'CineWhoop FPV Goggles Kit', sku: 'VAR-DRN-CN' }],
  'prod-drones-780': [{ id: 'var-drones-oct-780', name: 'Industrial Octocopter Base', sku: 'VAR-DRN-OCT' }],

  'prod-projectors-888': [{ id: 'var-projectors-std-888', name: '4K Laser Projector — 3000 Lumens', sku: 'VAR-PRJ-STD' }],
  'prod-projectors-889': [{ id: 'var-projectors-prt-889', name: 'Mini Portable Projector', sku: 'VAR-PRJ-PRT' }],
  'prod-projectors-890': [{ id: 'var-projectors-scr-890', name: '120" Inflatable Screen', sku: 'VAR-PRJ-SCR' }],
  'prod-projectors-891': [{ id: 'var-projectors-ven-891', name: 'High-Lumen Venue Projector', sku: 'VAR-PRJ-VEN' }]
};
