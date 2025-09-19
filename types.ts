export type Page = 'generator' | 'history' | 'settings' | 'account' | 'manual' | 'image_generator';
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'id';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AppContextType {
  currentPage: Page;
  setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  addToast: (message: string, type?: Toast['type']) => void;
}

// Types for script generation
export type VisualStrategy = 'user_generated' | 'cinematic' | 'animation' | 'product_demo' | 'testimonial';
export type ModelStrategy = 'none' | 'faceless' | 'character';
export type WritingStyle = 'formal' | 'casual' | 'humorous' | 'storytelling' | 'direct_response';

export interface ProductImage {
  name: string;
  type: string;
  data: string; // base64 encoded string
}

export interface CharacterDetails {
    identity: {
        name: string;
        gender: string;
        age: string;
        ethnicity: string;
    };
    facialFeatures: {
        faceShape: string;
        eyeColor: string;
        hairStyle: string;
        customHairStyle?: string; // Added for custom input
        hairColor: string;
    };
    physique: {
        skinTone: string;
        bodyShape: string;
        height: string;
    };
    styleAndAesthetics: {
        clothingStyle: string;
        dominantColor: string;
    };
    personality: {
        dominantAura: string;
        additionalNotes: string;
    };
}


export interface GenerationInput {
  productName: string;
  productType: string;
  productCategory: string;
  productDescription: string;
  targetAudience: string;
  brandVoice: string;
  
  platform: string;
  contentMode: string;
  visualStrategy: string;
  modelStrategy: ModelStrategy;
  writingStyle: string;
  tone: string;
  hookType: string;
  ctaType: string;
  duration: number;
  aspectRatio: string;
  useTrendAnalysis: boolean;

  character: CharacterDetails;
  aiPersonaId: string; // ID of the selected AI persona
  
  productImages: ProductImage[];
  referenceVideo: ProductImage | null;
  numberOfScripts: number;
}

export interface ProductAnalysisResult {
  productName: string;
  productDescription: string;
  productCategory: string;
  targetAudience: string;
}

export interface VisualIdea {
  id: string;
  description: string;
  image_prompt: string;
  video_prompt: string;
}

export interface ScriptPart {
  scene: number;
  visual_ideas: VisualIdea[];
  dialogue: string;
  sound_effect: string;
}

export interface Hashtags {
    general: string[];
    platform_specific: string[];
    trending_suggestions: string[];
}

export interface MarketingAssets {
    titles: string[];
    hashtags: Hashtags;
    thumbnail_text_ideas: string[];
}

export interface Script {
  id: string;
  title: string;
  score: number;
  isBestOption: boolean;
  hook: ScriptPart;
  content: ScriptPart[];
  cta: ScriptPart;
  generatedAt: string; // ISO string
  inputSnapshot: GenerationInput;
  assets?: MarketingAssets;
  image?: string; // base64 string
  voiceover?: string; // base64 string or URL
  storyboard?: { [visualIdeaId: string]: string };
  generatedVideoClips?: string[]; // Array of URLs for the generated video clips
}

// For Voice Over Generation
export interface VoiceOverLine {
    dialogue: string;
    direction: string;
    rate?: number; // TTS speech rate
    pitch?: number; // TTS speech pitch
}

export interface VoiceOverDirections {
    title: string;
    overallDirection: string;
    lines: VoiceOverLine[];
}

// For Preset Management
export interface GeneralPreset {
  id: string;
  name: string;
  settings: Omit<GenerationInput, 'productName' | 'productType' | 'productDescription' | 'productImages' | 'character' | 'numberOfScripts' | 'referenceVideo'>;
}

export interface CharacterPreset {
  id: string;
  name: string;
  character: CharacterDetails;
}

// For AI Persona Management
export interface AIPersona {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
}