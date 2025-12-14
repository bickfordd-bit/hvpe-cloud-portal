/**
 * Penelope Content Creation Engine
 * 
 * Copyright (c) 2025 Bickford Technologies LLC
 * All Rights Reserved. Patent Pending.
 * 
 * Cinema-quality content templates and storyline frameworks
 * for professional-grade creative content generation.
 */

export interface StorylineTemplate {
  id: string;
  title: string;
  genre: string;
  structure: string[];
  beats: StoryBeat[];
  visualStyle: VisualStyle;
  targetLength: {
    short: string;  // 30s-2min
    medium: string; // 2-5min
    feature: string; // 5-30min
  };
  keywords: string[];
}

export interface StoryBeat {
  position: number;
  name: string;
  purpose: string;
  duration: string;
  visualCues: string[];
  audioSuggestions: string[];
}

export interface VisualStyle {
  cinematography: string[];
  colorPalette: string[];
  lighting: string;
  cameraMovement: string[];
  framingPreferences: string[];
}

export interface ContentTemplate {
  id: string;
  name: string;
  category: 'commercial' | 'narrative' | 'documentary' | 'explainer' | 'social' | 'cinematic';
  description: string;
  storyline: StorylineTemplate;
  technicalSpecs: TechnicalSpecs;
  examples: string[];
}

export interface TechnicalSpecs {
  aspectRatio: string;
  resolution: string;
  frameRate: string;
  colorSpace: string;
  audioFormat: string;
}

// ====================
// CINEMA STORYLINES
// ====================

export const CINEMA_STORYLINES: StorylineTemplate[] = [
  {
    id: "heroes-journey",
    title: "The Hero's Journey",
    genre: "Epic/Adventure",
    structure: [
      "Ordinary World",
      "Call to Adventure",
      "Refusal of the Call",
      "Meeting the Mentor",
      "Crossing the Threshold",
      "Tests & Allies",
      "Approach to Inmost Cave",
      "Ordeal",
      "Reward",
      "The Road Back",
      "Resurrection",
      "Return with Elixir"
    ],
    beats: [
      {
        position: 1,
        name: "Opening Image",
        purpose: "Establish protagonist's world before transformation",
        duration: "10-15s",
        visualCues: ["Wide establishing shot", "Character in routine", "Visual contrast to ending"],
        audioSuggestions: ["Ambient sound", "Subtle music", "Character's inner voice"]
      },
      {
        position: 2,
        name: "Call to Adventure",
        purpose: "Present the challenge that will change everything",
        duration: "20-30s",
        visualCues: ["Close-up on catalyst", "Reaction shot", "Environmental shift"],
        audioSuggestions: ["Music crescendo", "Sound design punctuation", "Dialogue revelation"]
      },
      {
        position: 3,
        name: "Transformation Montage",
        purpose: "Show the journey of change",
        duration: "45-60s",
        visualCues: ["Quick cuts", "Visual progression", "Lighting evolution", "Growing confidence"],
        audioSuggestions: ["Building soundtrack", "Rhythmic editing", "Voice-over option"]
      },
      {
        position: 4,
        name: "Climax",
        purpose: "The ultimate test and revelation",
        duration: "30-45s",
        visualCues: ["Tight framing", "High contrast", "Dynamic camera", "Peak emotion"],
        audioSuggestions: ["Full orchestration", "Silence before storm", "Cathartic release"]
      },
      {
        position: 5,
        name: "Resolution",
        purpose: "Show the new normal and transformation complete",
        duration: "15-20s",
        visualCues: ["Mirror of opening", "Visual callback", "Character elevated"],
        audioSuggestions: ["Thematic reprise", "Peaceful resolution", "Hopeful tone"]
      }
    ],
    visualStyle: {
      cinematography: ["Anamorphic lenses", "Shallow depth of field", "Motivated lighting"],
      colorPalette: ["Warm gold", "Deep shadows", "Rich saturation", "Evolving palette"],
      lighting: "Dramatic three-point with motivated sources",
      cameraMovement: ["Steadicam flow", "Dolly push-ins", "Crane for revelation", "Handheld for intensity"],
      framingPreferences: ["Rule of thirds", "Leading lines", "Depth through layers", "Symmetry for power"]
    },
    targetLength: {
      short: "2-3 minutes (key beats only)",
      medium: "5-8 minutes (full emotional arc)",
      feature: "12-20 minutes (complete hero's journey)"
    },
    keywords: ["transformation", "journey", "hero", "challenge", "triumph", "growth"]
  },
  {
    id: "three-act-structure",
    title: "Classic Three-Act Structure",
    genre: "Universal/Versatile",
    structure: ["Setup", "Confrontation", "Resolution"],
    beats: [
      {
        position: 1,
        name: "Hook",
        purpose: "Grab attention immediately",
        duration: "5-10s",
        visualCues: ["Bold opening image", "Intriguing action", "Visual question"],
        audioSuggestions: ["Impactful sound", "Music hook", "Compelling dialogue"]
      },
      {
        position: 2,
        name: "Setup",
        purpose: "Establish world, characters, stakes",
        duration: "20-30s",
        visualCues: ["Environment establishment", "Character introduction", "Normal world"],
        audioSuggestions: ["Scene-setting score", "Natural ambience", "Character theme"]
      },
      {
        position: 3,
        name: "Inciting Incident",
        purpose: "The event that changes everything",
        duration: "10-15s",
        visualCues: ["Sharp visual change", "Character reaction", "Stakes revealed"],
        audioSuggestions: ["Musical shift", "Sound punctuation", "Tonal change"]
      },
      {
        position: 4,
        name: "Rising Action",
        purpose: "Complications and obstacles build",
        duration: "40-60s",
        visualCues: ["Escalating visuals", "Faster pacing", "Growing tension"],
        audioSuggestions: ["Building score", "Intensifying rhythm", "Layered sound design"]
      },
      {
        position: 5,
        name: "Midpoint",
        purpose: "False victory or defeat shifts perspective",
        duration: "15-20s",
        visualCues: ["Revelation moment", "Perspective shift", "Stakes heightened"],
        audioSuggestions: ["Music breakdown", "Silence for impact", "New thematic element"]
      },
      {
        position: 6,
        name: "Dark Moment",
        purpose: "All seems lost",
        duration: "15-25s",
        visualCues: ["Low-key lighting", "Isolation framing", "Defeated posture"],
        audioSuggestions: ["Minimal score", "Emotional restraint", "Silent beats"]
      },
      {
        position: 7,
        name: "Climax",
        purpose: "Final confrontation and decision",
        duration: "25-35s",
        visualCues: ["Peak visual intensity", "Fast cutting", "High contrast"],
        audioSuggestions: ["Full orchestral", "Rhythmic precision", "Emotional release"]
      },
      {
        position: 8,
        name: "Resolution & Denouement",
        purpose: "New equilibrium established",
        duration: "15-20s",
        visualCues: ["Peaceful imagery", "Visual callbacks", "Character transformed"],
        audioSuggestions: ["Thematic resolution", "Gentle fade", "Hope and completion"]
      }
    ],
    visualStyle: {
      cinematography: ["Varied shot sizes", "Motivated movement", "Visual progression"],
      colorPalette: ["Naturalistic with intent", "Emotional color shifts", "Cohesive overall"],
      lighting: "Naturalistic with dramatic moments",
      cameraMovement: ["Purposeful motivation", "Static for emotion", "Dynamic for action"],
      framingPreferences: ["Classical composition", "Psychological framing", "Visual metaphor"]
    },
    targetLength: {
      short: "90 seconds (compressed three acts)",
      medium: "3-5 minutes (standard commercial length)",
      feature: "8-15 minutes (full storytelling)"
    },
    keywords: ["structure", "narrative", "arc", "tension", "resolution", "classic"]
  },
  {
    id: "visual-poem",
    title: "Visual Poem / Atmospheric",
    genre: "Artistic/Experimental",
    structure: ["Visual Theme", "Variations", "Crescendo", "Reflection"],
    beats: [
      {
        position: 1,
        name: "Visual Thesis",
        purpose: "Introduce the central visual/emotional idea",
        duration: "15-20s",
        visualCues: ["Striking imagery", "Metaphorical visuals", "Mood establishment"],
        audioSuggestions: ["Atmospheric pad", "Minimal melody", "Found sounds"]
      },
      {
        position: 2,
        name: "Variation 1 - Intimate",
        purpose: "Close examination of theme",
        duration: "20-30s",
        visualCues: ["Macro details", "Texture focus", "Intimate framing"],
        audioSuggestions: ["Delicate instrumentation", "Natural sounds", "Whispered elements"]
      },
      {
        position: 3,
        name: "Variation 2 - Expansive",
        purpose: "Broaden the perspective",
        duration: "20-30s",
        visualCues: ["Wide vistas", "Movement through space", "Scale contrast"],
        audioSuggestions: ["Swelling strings", "Ambient layers", "Spatial audio"]
      },
      {
        position: 4,
        name: "Crescendo - Unity",
        purpose: "All elements converge",
        duration: "25-35s",
        visualCues: ["Rapid montage", "Visual rhythm", "Thematic collision"],
        audioSuggestions: ["Full arrangement", "Rhythmic build", "Harmonic convergence"]
      },
      {
        position: 5,
        name: "Reflection - Quietude",
        purpose: "Return to contemplation with new understanding",
        duration: "10-15s",
        visualCues: ["Single powerful image", "Stillness", "Visual poetry"],
        audioSuggestions: ["Gentle resolution", "Silence as power", "Final breath"]
      }
    ],
    visualStyle: {
      cinematography: ["Artistic composition", "Unconventional angles", "Texture focus", "Dreamlike quality"],
      colorPalette: ["Monochromatic options", "Complementary contrasts", "Desaturated beauty", "Bold accent colors"],
      lighting: "Painterly and sculptural",
      cameraMovement: ["Floating steadicam", "Slow deliberate dollies", "Time-lapse elements", "Still contemplation"],
      framingPreferences: ["Artistic composition", "Negative space", "Visual balance", "Abstract possibilities"]
    },
    targetLength: {
      short: "60-90 seconds (pure essence)",
      medium: "2-4 minutes (meditative pace)",
      feature: "5-10 minutes (extended contemplation)"
    },
    keywords: ["artistic", "atmospheric", "contemplative", "visual", "poetic", "experimental"]
  }
];

// ====================
// CONTENT TEMPLATES
// ====================

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: "brand-manifesto",
    name: "Brand Manifesto",
    category: "commercial",
    description: "Bold, inspirational brand story that defines purpose and values",
    storyline: CINEMA_STORYLINES[0], // Hero's Journey
    technicalSpecs: {
      aspectRatio: "16:9 or 2.39:1 (cinematic)",
      resolution: "4K (3840x2160) minimum",
      frameRate: "24fps (cinematic) or 30fps (broadcast)",
      colorSpace: "Rec. 709 or DCI-P3",
      audioFormat: "Stereo or 5.1 surround"
    },
    examples: [
      "Nike - 'Dream Crazy'",
      "Apple - 'Think Different'",
      "Patagonia - environmental stories",
      "Dove - 'Real Beauty'"
    ]
  },
  {
    id: "product-launch",
    name: "Product Launch Cinematic",
    category: "commercial",
    description: "High-energy reveal of new product with cinematic flair",
    storyline: CINEMA_STORYLINES[1], // Three-Act
    technicalSpecs: {
      aspectRatio: "16:9 or 1:1 (social)",
      resolution: "4K",
      frameRate: "60fps for slow-mo, 24fps for cinema feel",
      colorSpace: "Rec. 2020 for HDR",
      audioFormat: "Stereo with impact sound design"
    },
    examples: [
      "Apple iPhone reveals",
      "Tesla product launches",
      "Supreme drop videos",
      "Nike shoe launches"
    ]
  },
  {
    id: "founder-story",
    name: "Founder's Journey",
    category: "documentary",
    description: "Authentic documentary-style founder origin story",
    storyline: CINEMA_STORYLINES[0], // Hero's Journey
    technicalSpecs: {
      aspectRatio: "16:9",
      resolution: "4K with film grain",
      frameRate: "24fps (documentary feel)",
      colorSpace: "Rec. 709 with slight desaturation",
      audioFormat: "Stereo with natural ambience"
    },
    examples: [
      "Startup documentary intros",
      "TED talk openings",
      "Y Combinator founder stories",
      "Shark Tank pitches"
    ]
  },
  {
    id: "social-impact",
    name: "Social Impact Campaign",
    category: "narrative",
    description: "Emotionally resonant story about making a difference",
    storyline: CINEMA_STORYLINES[1], // Three-Act
    technicalSpecs: {
      aspectRatio: "16:9 or vertical 9:16",
      resolution: "4K",
      frameRate: "24fps or 30fps",
      colorSpace: "Rec. 709 with warm grade",
      audioFormat: "Stereo with emotional score"
    },
    examples: [
      "Charity: Water campaigns",
      "TOMS shoe stories",
      "UNICEF appeals",
      "Environmental advocacy"
    ]
  },
  {
    id: "explainer-cinematic",
    name: "Cinematic Explainer",
    category: "explainer",
    description: "Complex idea explained through beautiful visuals and narrative",
    storyline: CINEMA_STORYLINES[1], // Three-Act
    technicalSpecs: {
      aspectRatio: "16:9",
      resolution: "4K",
      frameRate: "30fps with animation at 24fps",
      colorSpace: "Rec. 709",
      audioFormat: "Stereo with clear voiceover"
    },
    examples: [
      "Kurzgesagt videos",
      "RSA Animate series",
      "TED-Ed animations",
      "Vox explainers"
    ]
  },
  {
    id: "artistic-showcase",
    name: "Artistic Brand Film",
    category: "cinematic",
    description: "Pure visual storytelling with minimal dialogue",
    storyline: CINEMA_STORYLINES[2], // Visual Poem
    technicalSpecs: {
      aspectRatio: "2.39:1 (ultra-wide cinematic)",
      resolution: "6K or 8K for detail",
      frameRate: "24fps for cinema, 120fps for slow-mo",
      colorSpace: "DCI-P3 or Rec. 2020",
      audioFormat: "5.1 surround"
    },
    examples: [
      "Luxury brand films",
      "Fashion week reels",
      "Architectural showcases",
      "Fine art installations"
    ]
  }
];

// ====================
// VISUAL PRESETS
// ====================

export const VISUAL_PRESETS = {
  CINEMATIC_DRAMA: {
    lut: "Kodak 2383",
    contrast: "High with crushed blacks",
    saturation: "Rich but controlled",
    temperature: "Warm midtones, cool shadows",
    grain: "Fine 35mm film grain"
  },
  DOCUMENTARY_NATURAL: {
    lut: "Rec. 709",
    contrast: "Medium with detail in shadows",
    saturation: "Slightly desaturated",
    temperature: "Neutral with slight warmth",
    grain: "Minimal digital grain"
  },
  COMMERCIAL_BOLD: {
    lut: "Custom vibrant",
    contrast: "High with preserved highlights",
    saturation: "Punchy and energetic",
    temperature: "Cool highlights, warm shadows",
    grain: "Clean digital"
  },
  ARTISTIC_MONOCHROME: {
    lut: "Black and white with tonal range",
    contrast: "High dynamic range",
    saturation: "N/A (B&W)",
    temperature: "Cool tones",
    grain: "Heavy film grain"
  },
  TECH_FUTURISTIC: {
    lut: "Cyberpunk blue-teal",
    contrast: "Very high with neon pops",
    saturation: "Neon accents, desaturated base",
    temperature: "Cool with warm accents",
    grain: "None (ultra clean)"
  }
};

// ====================
// MUSIC/AUDIO TEMPLATES
// ====================

export const AUDIO_TEMPLATES = {
  EPIC_ORCHESTRAL: {
    style: "Full orchestra with choir",
    tempo: "Building from 80 to 140 BPM",
    dynamics: "Crescendo from pp to fff",
    instruments: ["Strings", "Brass", "Percussion", "Choir"],
    mood: "Inspirational, powerful, triumphant"
  },
  INTIMATE_PIANO: {
    style: "Solo piano with ambient pad",
    tempo: "60-80 BPM",
    dynamics: "Gentle with emotional swells",
    instruments: ["Piano", "Strings (soft)", "Ambient pad"],
    mood: "Emotional, reflective, hopeful"
  },
  ELECTRONIC_MODERN: {
    style: "Electronic with organic elements",
    tempo: "100-128 BPM",
    dynamics: "Building layers",
    instruments: ["Synths", "Electronic drums", "Bass", "Organic samples"],
    mood: "Modern, energetic, forward-thinking"
  },
  MINIMALIST_AMBIENT: {
    style: "Sparse with space",
    tempo: "Variable (time-stretched)",
    dynamics: "Subtle throughout",
    instruments: ["Pads", "Textures", "Found sounds", "Minimal melody"],
    mood: "Contemplative, atmospheric, open"
  }
};

// ====================
// EXPORT ALL
// ====================

export const PENELOPE_LIBRARY = {
  storylines: CINEMA_STORYLINES,
  templates: CONTENT_TEMPLATES,
  visualPresets: VISUAL_PRESETS,
  audioTemplates: AUDIO_TEMPLATES
};
