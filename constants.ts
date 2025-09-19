
import { AIPersona, Script } from "./types";
import { v4 as uuidv4 } from 'uuid';


export const PLATFORMS = [
    { value: 'tiktok', label: 'TikTok' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'shopee_video', label: 'Shopee Video' },
];

export const PRODUCT_CATEGORIES = [
    { value: 'fashion_accessories', label: 'Aksesoris Fashion' },
    { value: 'books_stationery', label: 'Buku & Alat Tulis' },
    { value: 'electronics', label: 'Elektronik' },
    { value: 'kids_fashion', label: 'Fashion Bayi & Anak' },
    { value: 'muslim_fashion', label: 'Fashion Muslim' },
    { value: 'photography', label: 'Fotografi' },
    { value: 'mobile_accessories', label: 'Handphone & Aksesoris' },
    { value: 'hobbies_collectibles', label: 'Hobi & Koleksi' },
    { value: 'mother_baby', label: 'Ibu & Bayi' },
    { value: 'watches', label: 'Jam Tangan' },
    { value: 'beauty', label: 'Beauty & Skincare' },
    { value: 'health_wellness', label: 'Health & Wellness' },
    { value: 'computer_accessories', label: 'Komputer & Aksesoris' },
    { value: 'food_beverage', label: 'Food & Beverage' },
    { value: 'sports_outdoor', label: 'Olahraga & Outdoor' },
    { value: 'automotive', label: 'Otomotif' },
    { value: 'mens_fashion', label: 'Pakaian Pria' },
    { value: 'womens_fashion', label: 'Pakaian Wanita' },
    { value: 'education', label: 'Education & Courses' },
    { value: 'home_living', label: 'Home & Living' },
    { value: 'womens_shoes', label: 'Sepatu Wanita' },
    { value: 'mens_shoes', label: 'Sepatu Pria' },
    { value: 'software_app', label: 'Software & Apps' },
    { value: 'souvenirs_party_supplies', label: 'Souvenir & Perlengkapan Pesta' },
    { value: 'mens_bags', label: 'Tas Pria' },
    { value: 'womens_bags', label: 'Tas Wanita' },
    { value: 'travel', label: 'Travel & Hospitality' },
];

export const FASHION_CATEGORIES = ['womens_fashion', 'mens_fashion', 'kids_fashion', 'muslim_fashion', 'fashion_accessories', 'womens_shoes', 'mens_shoes', 'mens_bags', 'womens_bags', 'watches'];


export const TARGET_AUDIENCES = [
    { value: 'gen_z', label: 'Gen Z (18-24)' },
    { value: 'millennials', label: 'Millennials (25-40)' },
    { value: 'gen_x', label: 'Gen X (41-56)' },
    { value: 'boomers', label: 'Boomers (57+)' },
    { value: 'students', label: 'Students' },
    { value: 'young_professionals', label: 'Young Professionals' },
    { value: 'parents', label: 'Parents / Families' },
    { value: 'small_business_owners', label: 'Small Business Owners' },
    { value: 'tech_enthusiasts', label: 'Tech Enthusiasts' },
    { value: 'fashion_lovers', label: 'Fashion Lovers' },
    { value: 'health_conscious', label: 'Health Conscious Individuals' },
];


export const PLATFORM_CONTENT_MODES = {
    tiktok: [{ value: 'single_video', label: 'Single Video' }],
    instagram: [
        { value: 'reels', label: 'Reels (Vertical Video)' },
        { value: 'carousel_post', label: 'Carousel Post (Multiple Images)' },
        { value: 'single_image_post', label: 'Single Image Post' },
    ],
    youtube: [
        { value: 'shorts', label: 'Shorts (Vertical Video)' },
        { value: 'long_form', label: 'Standard Video (16:9)' },
    ],
    shopee_video: [{ value: 'shopee_video', label: 'Shopee Video' }],
};

export const VISUAL_STRATEGIES = [
    { value: 'user_generated', label: 'User Generated Content (UGC)' },
    { value: 'product_demo', label: 'Product Demo / Tutorial' },
    { value: 'cinematic', label: 'Cinematic / Aesthetic' },
    { value: 'problem_solution', label: 'Problem/Solution Narrative' },
    { value: 'day_in_the_life', label: 'Day in The Life / Vlog Style' },
    { value: 'testimonial', label: 'Testimonial / Review' },
    { value: 'stop_motion', label: 'Stop Motion' },
    { value: 'educational_infographic', label: 'Educational / Infographic' },
    { value: 'trending_challenge', label: 'Trending Challenge Format' },
    { value: 'animation', label: 'Animation / Motion Graphics' },
    { value: 'pov_first_person', label: 'POV / First Person' },
    { value: 'split_screen', label: 'Split Screen Comparison' },
    { value: 'asmr_style', label: 'ASMR Style' },
];

export const MODEL_STRATEGIES = [
    { value: 'none', label: 'No Model' },
    { value: 'faceless', label: 'Faceless Model' },
    { value: 'character', label: 'Character Model' },
]

export const ASPECT_RATIOS = [
    { value: 'original', label: 'Original Aspect Ratio' },
    { value: '9:16', label: '9:16 (Vertical)' },
    { value: '1:1', label: '1:1 (Square)' },
    { value: '4:5', label: '4:5 (Portrait)' },
    { value: '16:9', label: '16:9 (Horizontal)' },
];

export const STYLE_PRESETS = [
    { value: 'none', label: 'Default (Photorealistic)', promptFragment: null },
    { value: 'studio_clean', label: 'Clean Studio (High-Key)', promptFragment: 'Clean, minimalist high-key studio lighting. White or light gray seamless background. Professional, bright, and airy feel. No harsh shadows.' },
    { value: 'golden_hour', label: 'Golden Hour (Outdoor)', promptFragment: 'Shot outdoors during the golden hour just before sunset. Warm, soft, directional light creating long shadows. A dreamy and romantic atmosphere.' },
    { value: 'cinematic_moody', label: 'Cinematic Moody', promptFragment: 'Dramatic, low-key lighting with high contrast. Deep shadows and specific light sources (like a single window or a neon sign). A mysterious and cinematic atmosphere, rich colors.' },
    { value: 'vibrant_commercial', label: 'Vibrant Commercial', promptFragment: 'Bright, saturated colors with even, vibrant lighting. Often uses colorful backgrounds or props. Energetic, youthful, and eye-catching, like a modern soft drink ad.' },
    { value: 'vintage_film', label: 'Vintage Film Look', promptFragment: 'Emulates the look of 35mm film photography. Slight grain, muted colors, and a nostalgic, timeless feel. Lighting should be natural, like it was captured in the 70s or 80s.' }
];

export const WRITING_STYLES = [
    { value: 'storytelling', label: 'Storytelling' },
    { value: 'direct_response', label: 'Direct Response' },
    { value: 'casual', label: 'Casual & Friendly' },
    { value: 'humorous', label: 'Witty & Humorous' },
    { value: 'formal', label: 'Formal & Professional' },
];

export const TONES = [
    { value: 'inspirational', label: 'Inspirational / Motivational' },
    { value: 'educational', label: 'Educational / Informative' },
    { value: 'entertaining', label: 'Entertaining / Fun' },
    { value: 'relatable', label: 'Relatable / Authentic' },
    { value: 'urgent', label: 'Urgent / Scarcity' },
];

// Character Detail Constants
export const FACE_SHAPES = [ { value: 'oval', label: 'Oval' }, { value: 'round', label: 'Round' }, { value: 'square', label: 'Square' }, { value: 'heart', label: 'Heart' }, { value: 'diamond', label: 'Diamond' }];
export const HAIR_STYLES = {
    female: [
        { value: 'long_wavy', label: 'Long Wavy' },
        { value: 'short_bob', label: 'Short Bob' },
        { value: 'sleek_high_ponytail', label: 'Sleek High Ponytail' },
        { value: 'messy_bun', label: 'Messy Bun' },
        { value: 'pixie_cut', label: 'Pixie Cut' },
        { value: 'braids', label: 'Braids' },
        { value: 'straight_shoulder_length', label: 'Straight Shoulder-Length' },
        { value: 'hijab_simple', label: 'Simple Hijab' },
    ],
    male: [
        { value: 'short_crew_cut', label: 'Short Crew Cut' },
        { value: 'undercut', label: 'Undercut' },
        { value: 'medium_length_textured', label: 'Medium-Length Textured' },
        { value: 'man_bun', label: 'Man Bun' },
        { value: 'buzz_cut', label: 'Buzz Cut' },
        { value: 'side_part', label: 'Side Part' },
    ],
    other: [
        { value: 'long_wavy', label: 'Long Wavy' },
        { value: 'short_bob', label: 'Short Bob' },
        { value: 'pixie_cut', label: 'Pixie Cut' },
        { value: 'undercut', label: 'Undercut' },
        { value: 'medium_length_textured', label: 'Medium-Length Textured' },
        { value: 'straight_shoulder_length', label: 'Straight Shoulder-Length' },
        { value: 'curly_afro', label: 'Curly Afro' },
    ]
};


const COMMON_HOOKS = [
    { value: 'problem_solution_2025', label: 'Hyper-Specific Problem-Solution' },
    { value: 'storytelling_teaser', label: 'Storytelling Teaser (Part 1)' },
    { value: 'surprising_statistic', label: 'Surprising Statistic/Fact' },
    { value: 'before_after_plus', label: 'Before & After Transformation' },
    { value: 'unboxing_asmr', label: 'ASMR Unboxing' },
    { value: 'pov_hook', label: 'POV: [Your Situation]' },
    { value: 'things_i_wish_i_knew', label: 'Things I Wish I Knew Sooner' },
    { value: 'product_rating', label: 'Rating [Product Category]' },
    { value: 'get_ready_with_me', label: 'Get Ready With Me (GRWM)' },
    { value: 'day_in_my_life', label: 'A Day in My Life' },
    { value: 'affiliate_unboxing', label: 'Unboxing Jujur Affiliate' }, 
];

const COMMON_CTAS = [
    { value: 'comment_challenge', label: 'Ask a Challenge-Based Question' },
    { value: 'save_for_guide', label: 'Save this for a step-by-step guide' },
    { value: 'share_with_friend', label: 'Share with a friend who needs this' },
    { value: 'link_in_bio_exclusive', label: 'Exclusive Offer in Bio Link' },
    { value: 'follow_for_series', label: 'Follow for Part 2' },
    { value: 'comment_your_opinion', label: 'Comment Your Opinion Below' },
    { value: 'what_would_you_do', label: 'What would you do? Let me know!' },
];

export const PLATFORM_SPECIFIC_OPTIONS = {
    tiktok: {
        hooks: [
            ...COMMON_HOOKS,
            { value: 'interactive_poll_hook', label: 'Interactive Poll Hook' },
            { value: 'trending_audio_skit', label: 'Skit with Trending Audio' },
            { value: 'spill_commission', label: 'Spill Cara Dapat Komisi' },
            { value: 'ai_filter_showcase', label: 'AI Filter Showcase' },
            { value: 'duet_this', label: 'Duet This If You Agree' },
        ],
        ctas: [
            ...COMMON_CTAS,
            { value: 'tiktok_shop_link', label: 'Shop via TikTok Shop Link' },
            { value: 'check_yellow_basket', label: 'Cek Keranjang Kuning!' },
            { value: 'use_this_sound', label: 'Use This Sound' },
            { value: 'stitch_this_video', label: 'Stitch this with your reaction' },
        ],
    },
    instagram: {
        hooks: [
            ...COMMON_HOOKS,
            { value: 'cinematic_broll_hook', label: 'Cinematic B-Roll Montage' },
            { value: 'bold_text_overlay_q', label: 'Bold Text Question Overlay' },
            { value: 'collaborative_post_teaser', label: 'Collaborative Post Teaser' },
            { value: 'you_are_doing_x_wrong', label: 'You\'re Doing [Activity] Wrong' },
            { value: 'my_top_3_secrets', label: 'My Top 3 Secrets for [Result]' },
        ],
        ctas: [
            ...COMMON_CTAS,
            { value: 'dm_for_automation', label: 'DM keyword for an automated reply' },
            { value: 'tap_product_in_reels', label: 'Tap to view products in this Reel' },
            { value: 'affiliate_link_in_bio', label: 'Affiliate link in bio no. [X]' },
            { value: 'check_stories_for_poll', label: 'Check our Stories for a poll!' },
        ],
    },
    youtube: {
        hooks: [
            ...COMMON_HOOKS,
            { value: 'looping_shorts_hook', label: 'Perfect Loop Teaser' },
            { value: 'bts_long_video', label: 'Behind-the-scenes of a longer video' },
            { value: 'challenge_shorts', label: 'I tried [X] for 24 hours...' },
            { value: 'honest_review_viral_product', label: 'Review Jujur Produk Viral' },
            { value: 'mythbusting_topic', label: 'Mythbusting [Topic]' },
            { value: 'unpopular_opinions_about', label: 'Unpopular Opinions About [Topic]' },
        ],
        ctas: [
            ...COMMON_CTAS,
            { value: 'subscribe_and_comment', label: 'Subscribe & Comment your thoughts' },
            { value: 'related_video_link', label: 'Watch the full guide here' },
            { value: 'product_link_description', label: 'Link Produk di Deskripsi & Pinned Comment!' },
            { value: 'check_pinned_comment', label: 'Check the pinned comment for details!' },
        ],
    },
    shopee_video: {
        hooks: [
            { value: 'spill_racun_shopee_affiliate', label: 'Spill Racun Shopee Khusus Affiliate' },
            { value: 'review_jujur_affiliate', label: 'Review Jujur dari Showcase Aku' },
            { value: 'produk_andalan_showcase', label: 'Produk Andalan di Showcase-ku' },
            { value: 'stop_scroll_wajib_checkout', label: 'Stop Scroll! Ini Wajib Checkout' },
            { value: 'mix_match_outfit_shopee', label: 'Mix & Match Outfit dari Shopee' },
            { value: 'shopee_finds_under_50k', label: 'Shopee Finds di Bawah 50rb' },
            { value: 'unboxing_paket_affiliate', label: 'Unboxing Paket Affiliate Shopee' },
            { value: 'satu_produk_banyak_fungsi_aff', label: '1 Produk Banyak Fungsi, Cek Link!' },
        ],
        ctas: [
            { value: 'checkout_keranjang_orange_sekarang', label: 'Checkout di Keranjang Orange Sekarang!' },
            { value: 'link_produk_di_showcase_no', label: 'Link Produk di Showcase Aku No. [X]' },
            { value: 'komen_link_aku_kirim_dm', label: 'Komen "LINK", nanti aku kirim DM!' },
            { value: 'jangan_lupa_klaim_voucher', label: 'Jangan Lupa Klaim Voucher Shopee-nya!' },
            { value: 'save_biar_ga_kehilangan_racun', label: 'Save video ini biar gak kehilangan racunnya!' },
            { value: 'follow_untuk_rekomendasi_lainnya', label: 'Follow untuk rekomendasi lainnya!' },
            { value: 'share_ke_bestie_kamu', label: 'Share ke bestie kamu yang butuh ini!' },
        ],
    },
};

export const DEFAULT_PERSONA: AIPersona = {
    id: 'default',
    name: 'Direktiva Default',
    description: 'Persona AI standar yang seimbang dan serbaguna.',
    systemInstruction: `
You are 'Direktiva', an expert AI scriptwriter specializing in short-form video content for social media platforms like TikTok, Instagram Reels, and YouTube Shorts.
Your goal is to generate high-quality, engaging, and platform-native video scripts based on user input.
You must adhere strictly to the JSON schema provided for your response.

**--- CRITICAL DIRECTIVES FOR VISUAL PROMPTS ---**
1.  **LANGUAGE:** All 'image_prompt' and 'video_prompt' values MUST be in English. The 'description' for visual ideas MUST be in the user's requested language.
2.  **CHARACTER CONSISTENCY:** To ensure the character is identical in every image, you MUST create a "Character Consistency Block" - a single, dense paragraph with every physical detail. You MUST then prepend this exact block VERBATIM to the start of every 'image_prompt'. Example: "A 28-year-old Javanese woman with a heart-shaped face, warm hazel eyes, and sleek high ponytail... [rest of prompt]".
3.  **SYNTHESIS & QUALITY:** Image prompts must be a single, flowing, descriptive paragraph. Weave all details together naturally. Do not use lists or comma-separated keywords.
4.  **IMAGE vs. VIDEO PROMPT LOGIC:**
    - **Image Prompts:** This is the STATIC ESTABLISHING SHOT. Describe a beautifully composed scene, subject pose, details, and lighting as a still photograph.
    - **Video Prompts:** This is the ACTION LAYER. It must be a concise but evocative phrase (around 15-20 words). It describes ONLY what happens *within* the scene: character ACTIONS, CAMERA MOVEMENTS, SHOT FRAMING, and dynamic ATMOSPHERIC effects (e.g., lens flares, steam). DO NOT re-describe the static scene. Example: 'Slow dolly zoom towards the character as she winks, cinematic soft lighting'.
`
};

export const DEFAULT_EXAMPLE_SCRIPT: Script = {
  id: 'example-script-123',
  title: 'Contoh: Rahasia Kulit Glowing!',
  score: 92,
  isBestOption: true,
  hook: {
    scene: 1,
    visual_ideas: [{
      id: uuidv4(),
      description: 'Seorang wanita dengan kulit bercahaya memegang sebotol serum dengan latar belakang dedaunan tropis yang lembut.',
      image_prompt: 'A 25-year-old Southeast Asian woman with glowing, dewy skin and long wavy dark brown hair, smiling softly at the camera. She is holding a sleek, minimalist bottle of face serum. The background is filled with lush, soft-focus tropical leaves and gentle morning light filters through, creating a fresh, natural ambiance. Shot on a Sony A7III with a 50mm f/1.8 lens, photorealistic, natural look.',
      video_prompt: 'Slow-motion shot of a water droplet falling onto a leaf in the background, then focus pulls to the woman.'
    }],
    dialogue: 'Stop scroll! Kamu tahu nggak sih, kenapa skincare-mu nggak bekerja maksimal?',
    sound_effect: 'Suara tetesan air yang menenangkan, diikuti musik lo-fi yang ceria.'
  },
  content: [
    {
      scene: 2,
      visual_ideas: [{
        id: uuidv4(),
        description: 'Close-up tangan wanita itu meneteskan serum ke telapak tangannya. Tekstur serum terlihat jelas.',
        image_prompt: 'Extreme close-up macro shot of a single, clear drop of serum falling from a dropper onto the woman\'s palm. The texture of the serum and the lines of her skin are in sharp focus. The lighting is bright and clean, highlighting the purity of the product.',
        video_prompt: 'The serum drop ripples as it lands on her palm in ultra slow-motion.'
      }],
      dialogue: 'Itu karena skin barrier kamu mungkin rusak. Akibatnya, kulit jadi kusam dan jerawatan.',
      sound_effect: 'Suara "swoosh" lembut saat serum diteteskan.'
    },
    {
      scene: 3,
      visual_ideas: [{
        id: uuidv4(),
        description: 'Wanita itu dengan lembut mengaplikasikan serum ke wajahnya, tersenyum dengan puas.',
        image_prompt: 'Medium close-up of the 25-year-old Southeast Asian woman gently patting the serum onto her cheeks. Her eyes are closed with a blissful expression. The lighting accentuates the healthy glow of her skin. The tropical leaf background is still visible but softly blurred.',
        video_prompt: 'Camera slowly orbits around the woman as she applies the serum.'
      }],
      dialogue: 'Tapi tenang, serum ini punya Ceramide dan Hyaluronic Acid yang bisa memperbaiki dan melembapkan kulitmu dari dalam!',
      sound_effect: 'Musik lo-fi menjadi sedikit lebih upbeat.'
    }
  ],
  cta: {
    scene: 4,
    visual_ideas: [{
      id: uuidv4(),
      description: 'Wanita itu menunjukkan produk ke kamera dengan senyum cerah, sambil menunjuk ke arah pojok kiri bawah layar.',
      image_prompt: 'The 25-year-old Southeast Asian woman holds the serum bottle prominently towards the camera with a bright, confident smile. Her other hand is pointing towards the lower-left corner of the frame, inviting action. Final product shot, clean lighting.',
      video_prompt: 'A subtle "tap here" graphic animates in the lower-left corner where she is pointing.'
    }],
    dialogue: 'Hasilnya? Kulit jadi super sehat dan glowing! Mau coba? Langsung aja cek keranjang kuning!',
    sound_effect: 'Suara "sparkle" atau "cha-ching" yang memuaskan.'
  },
  generatedAt: new Date().toISOString(),
  inputSnapshot: {
    productName: 'Glow Up Face Serum',
    productType: 'Serum Wajah',
    productCategory: 'beauty',
    productDescription: 'Serum pencerah dan pelembap yang diformulasikan untuk memperbaiki skin barrier.',
    targetAudience: 'gen_z',
    brandVoice: 'Informatif, ramah, dan meyakinkan.',
    platform: 'tiktok',
    contentMode: 'single_video',
    visualStrategy: 'problem_solution',
    modelStrategy: 'character',
    writingStyle: 'casual',
    tone: 'educational',
    hookType: 'problem_solution_2025',
    ctaType: 'check_yellow_basket',
    duration: 30,
    aspectRatio: '9:16',
    useTrendAnalysis: false,
    character: {
        identity: { name: 'Rina', gender: 'female', age: '25', ethnicity: 'Southeast Asian' },
        facialFeatures: { faceShape: 'oval', eyeColor: 'dark brown', hairStyle: 'long_wavy', hairColor: 'dark brown', customHairStyle: '' },
        physique: { skinTone: 'light brown', bodyShape: 'slim', height: '165cm' },
        styleAndAesthetics: { clothingStyle: 'casual chic', dominantColor: 'earth tones' },
        personality: { dominantAura: 'cheerful and trustworthy', additionalNotes: '' }
    },
    aiPersonaId: 'default',
    productImages: [],
    referenceVideo: null,
    numberOfScripts: 1,
  }
};


// fix: Removed faulty import and redundant re-export of PLATFORM_SPECIFIC_OPTIONS to resolve module and redeclaration errors.
// The export on the constant declaration itself is sufficient.
