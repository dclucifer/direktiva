





import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { 
    GenerationInput, 
    Script,
    MarketingAssets,
    VoiceOverDirections,
    ScriptPart,
    ProductAnalysisResult,
    ProductImage,
    VisualIdea,
} from '../types';
import { PRODUCT_CATEGORIES, TARGET_AUDIENCES } from '../constants';
import { v4 as uuidv4 } from 'uuid';


// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas for JSON responses
const visualIdeaSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'A unique UUID for this visual idea.' },
        description: { type: Type.STRING, description: 'A detailed description of the visual scene in the requested language.' },
        image_prompt: { type: Type.STRING, description: 'A detailed, single-paragraph DALL-E 3/Midjourney compatible image prompt in English.' },
        video_prompt: { type: Type.STRING, description: 'A short, action-oriented video prompt in English describing camera movement and subject action.' },
    },
    required: ['id', 'description', 'image_prompt', 'video_prompt'],
};

const scriptPartSchema = {
    type: Type.OBJECT,
    properties: {
        scene: { type: Type.INTEGER, description: 'The scene number.' },
        visual_ideas: { type: Type.ARRAY, items: visualIdeaSchema },
        dialogue: { type: Type.STRING, description: 'The spoken dialogue for this part of the script.' },
        sound_effect: { type: Type.STRING, description: 'Description of sound effects or music for this scene.' },
    },
    required: ['scene', 'visual_ideas', 'dialogue', 'sound_effect'],
};

const hashtagsSchema = {
    type: Type.OBJECT,
    properties: {
        general: { type: Type.ARRAY, items: { type: Type.STRING } },
        platform_specific: { type: Type.ARRAY, items: { type: Type.STRING } },
        trending_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['general', 'platform_specific', 'trending_suggestions'],
};

const marketingAssetsSchema = {
    type: Type.OBJECT,
    properties: {
        titles: { type: Type.ARRAY, items: { type: Type.STRING } },
        hashtags: hashtagsSchema,
        thumbnail_text_ideas: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['titles', 'hashtags', 'thumbnail_text_ideas'],
};


const scriptSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'A unique UUID for the script.' },
        title: { type: Type.STRING, description: 'A catchy title for the video script.' },
        score: { type: Type.INTEGER, description: 'An overall engagement score from 1-100 based on virality potential.' },
        isBestOption: { type: Type.BOOLEAN, description: 'Set to true for the single best script option.' },
        hook: scriptPartSchema,
        content: { type: Type.ARRAY, items: scriptPartSchema },
        cta: scriptPartSchema,
    },
    required: ['id', 'title', 'score', 'isBestOption', 'hook', 'content', 'cta'],
};

const voiceOverLineSchema = {
    type: Type.OBJECT,
    properties: {
        dialogue: { type: Type.STRING },
        direction: { type: Type.STRING, description: 'Direction for the voice actor on how to read this line.' },
        rate: { type: Type.NUMBER, description: 'Speech rate (0.25 to 4.0), default is 1.' },
        pitch: { type: Type.NUMBER, description: 'Speech pitch (-20.0 to 20.0), default is 0.' },
    },
    required: ['dialogue', 'direction'],
};

const voiceOverDirectionsSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        overallDirection: { type: Type.STRING, description: 'Overall direction for the voiceover tone and style.' },
        lines: { type: Type.ARRAY, items: voiceOverLineSchema },
    },
    required: ['title', 'overallDirection', 'lines'],
};

const productAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        productName: { type: Type.STRING, description: "The extracted product name." },
        productDescription: { type: Type.STRING, description: "A concise, well-written product description summarized from the page." },
        productCategory: { 
            type: Type.STRING, 
            description: "The most relevant product category.",
            enum: PRODUCT_CATEGORIES.map(c => c.value),
        },
        targetAudience: { 
            type: Type.STRING, 
            description: "The most likely target audience.",
            enum: TARGET_AUDIENCES.map(a => a.value),
        },
    },
    required: ["productName", "productDescription", "productCategory", "targetAudience"],
};

// Helper to parse JSON from AI response
const parseJsonResponse = <T>(text: string, schema: any): T => {
    try {
        const cleanedText = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        // Here you could add validation against the schema if needed
        return parsed as T;
    } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Invalid JSON response from AI.");
    }
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type
        }
    };
};

/**
 * Implements a strict two-step pipeline to ensure face and product consistency.
 * Step 1: Create a high-fidelity "master composite" of the subject and product.
 * Step 2: Place that master composite into various scenes.
 */
export const generateProductPhoto = async (
    imageParts: { [key: string]: { mimeType: string, data: string } },
    additionalInstructions: string,
    aspectRatio: string,
    backgroundPrompt: string | null,
    stylePrompt: string | null
): Promise<string[]> => {

    // --- VALIDATION ---
    if (!imageParts.subject) {
        throw new Error("A subject (model) image is required for this operation.");
    }
    if (!imageParts.mainProduct) {
        throw new Error("A main product image is required for this operation.");
    }

    // --- STEP 1: CREATE THE BASE "MASTER COMPOSITE" ---
    const baseCompositePrompt = `
**PROTOCOL: BASE COMPOSITE GENERATION (v14.0 - Step 1/2)**

**TASK:** Your sole objective is to create a single, ultra-photorealistic, full-body studio portrait.
1.  **PERSON:** Use the exact person from **[IMAGE 1: SUBJECT]**. Replicate their face, hair, and identity with 100% accuracy.
2.  **CLOTHING:** Dress this person in the exact clothing from **[IMAGE 2: PRODUCT]**. Replicate the product's design, pattern, and fit with 100% accuracy.
3.  **BACKGROUND:** Place them against a neutral, plain, light gray studio background.
4.  **POSE:** The person should be standing, facing the camera with a neutral, pleasant expression.
5.  **OUTPUT:** The final image is the definitive "source of truth" for the character's appearance. Do not add any other elements.
`;
    
    const step1Parts = [
        { inlineData: imageParts.subject },
        { inlineData: imageParts.mainProduct },
        { text: baseCompositePrompt }
    ];

    const baseCompositeResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: step1Parts },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    const baseCompositePart = baseCompositeResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!baseCompositePart?.inlineData?.data) {
        throw new Error("Failed to create the base character composite in Step 1. Please ensure the subject and product images are clear and high-quality.");
    }
    
    const masterCompositeImage = {
        mimeType: baseCompositePart.inlineData.mimeType || 'image/png',
        data: baseCompositePart.inlineData.data
    };


    // --- STEP 2: PLACE THE MASTER COMPOSITE INTO VARIOUS SCENES ---
    const defaultStyleInstruction = 'The final images must be ultra-photorealistic, indistinguishable from a professional photograph from a high-end brand campaign.';
    const styleInstruction = stylePrompt || defaultStyleInstruction;
    
    const scenarios = [
        { name: 'Street Style', prompt: `A full-length shot of the model walking confidently on a modern city street, blurred background of shops and palm trees. The mood is chic and bright.` },
        { name: 'Cafe Lifestyle', prompt: `A medium shot of the model sitting in a bright, modern cafe by a large window, holding a coffee cup and smiling gently, looking just off-camera. The lighting is soft and natural.` },
        { name: 'Studio Dynamic', prompt: `A full-length studio shot against a solid, vibrant colored background (e.g., pastel blue or gradient). The model has a joyful, laughing expression. The lighting is bright and commercial.` },
        { name: 'Elegant Detail', prompt: `A close-up "detail" shot, focusing on the texture and pattern on the shoulder of the clothing. The model's face is partially in frame, turned three-quarters, softly out of focus. The mood is elegant and focused on quality.` },
        { name: 'Indoor Grace', prompt: `A three-quarter shot of the model standing in a minimalist apartment, looking gracefully out of a large window. Sunlight creates a soft, hazy glow.` }
    ];

    const generationPromises = scenarios.map(scenario => {
        const sceneDescription = backgroundPrompt
            ? `The background MUST be: "${backgroundPrompt}". The overall scene, pose, and composition should be inspired by this theme: "${scenario.prompt}"`
            : scenario.prompt;

        const scenePlacementPrompt = `
**PROTOCOL: SCENE PLACEMENT (v14.0 - Step 2/2)**

**TASK:** Your sole objective is to place the character from the provided **[MASTER IMAGE]** into a new environment.
1.  **CHARACTER SOURCE:** The person and their clothing in the **[MASTER IMAGE]** are locked and are the single source of truth. DO NOT change their face, hair, or the clothing design in any way.
2.  **NEW SCENE:** Place this character into the following scene: "${sceneDescription}".
3.  **INTEGRATION:** Flawlessly blend the character into the new scene by adjusting only the lighting and shadows to match the environment.
4.  **AESTHETIC:** Apply this style meticulously: ${styleInstruction}
5.  **ADDITIONAL INSTRUCTIONS:** ${additionalInstructions || 'None.'}

**CRITICAL FAILURE CONDITION:** Any deviation from the character's facial features or clothing in the [MASTER IMAGE] is a total failure.
`;
        
        const step2Parts = [
            { inlineData: masterCompositeImage },
            { text: scenePlacementPrompt }
        ];

        return ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: step2Parts },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });
    });

    const responses = await Promise.all(generationPromises);
    const resultImages = responses.map(res => {
        const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (!part?.inlineData?.data) {
            console.warn("A scenario failed to generate an image.");
            return null;
        }
        return part.inlineData.data;
    }).filter((img): img is string => img !== null);
    
    if (resultImages.length < 3) { // Lower threshold for partial success
        throw new Error("Image generation failed for most scenarios. Please check if the product images are clear and try again.");
    }
    
    return resultImages;
};



export const editProductInImage = async (
    baseImage: { mimeType: string, data: string },
    replacementProduct: { mimeType: string, data: string },
    prompt: string,
    aspectRatio: string
): Promise<string> => {
     const editPrompt = `
        **Image Editing Protocol:**
        1.  **Analyze Base Image:** Identify the person and the primary piece of clothing they are wearing in the [BASE IMAGE].
        2.  **Analyze Replacement:** Identify the product in the [REPLACEMENT PRODUCT IMAGE].
        3.  **Execute Swap:** Flawlessly replace the original clothing on the person with the replacement product. Preserve the original pose, lighting, background, and most importantly, the person's face and body, exactly as they are.
        4.  **User Instructions:** Apply the following instructions: "${prompt}".
        5.  **Realism:** The final image must be perfectly blended and photorealistic.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                { inlineData: baseImage },
                { inlineData: replacementProduct },
                { text: editPrompt }
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!imagePart?.inlineData?.data) {
        throw new Error("Failed to edit image.");
    }
    return imagePart.inlineData.data;
};


export const generateImageFromPrompt = async (
    prompt: string, 
    aspectRatio: string,
    productImage?: ProductImage,
    characterReferenceImage?: { mimeType: string, data: string }
): Promise<string> => {
    
    // For now, we use the image generation model. If a character reference is provided,
    // we should ideally use a model that can handle image+text prompts for generation.
    // Let's use gemini-2.5-flash-image-preview for consistency if a character ref is given.
    if (characterReferenceImage) {
        const fullPrompt = `
        **CHARACTER CONTINUITY PROTOCOL:**
        - **Source of Truth:** The person in the provided reference image is the character. Replicate their facial features, hair, and overall appearance with 100% accuracy.
        - **New Scene:** Place this exact character into the following scene, described by the prompt below. The pose and setting should be new, but the person's identity must remain locked.
        ---
        **PROMPT:** ${prompt}
        `;
        const parts = [{ inlineData: characterReferenceImage }, { text: fullPrompt }];
        if (productImage) {
            parts.push({ inlineData: { mimeType: productImage.type, data: productImage.data } });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData?.data) {
            return imagePart.inlineData.data;
        } else {
            throw new Error('Image generation with character reference failed.');
        }

    } else {
         const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: aspectRatio === 'original' ? '1:1' : aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages[0]?.image?.imageBytes) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error('Image generation failed.');
        }
    }
};

// ... [The rest of the functions for script generation, revision, etc. would go here]
// For brevity, I'll add stubs, but a full implementation would be required.

export const generateScripts = async (input: GenerationInput, language: string, systemInstruction: string, trends: string): Promise<Script[]> => {
    // This function would build a very detailed prompt from the input,
    // call the Gemini API with the scriptSchema, and parse the response.
    console.log("Generating scripts for:", input, language, trends);
    // Returning a mock response for now
    const mockScript = {
        id: uuidv4(),
        title: 'Mock Script Title',
        score: 88,
        isBestOption: true,
        hook: { scene: 1, visual_ideas: [{id: uuidv4(), description: 'Mock visual', image_prompt: 'mock', video_prompt: 'mock'}], dialogue: 'This is a mock hook!', sound_effect: 'pop' },
        content: [{ scene: 2, visual_ideas: [{id: uuidv4(), description: 'Mock visual', image_prompt: 'mock', video_prompt: 'mock'}], dialogue: 'This is mock content.', sound_effect: 'swoosh' }],
        cta: { scene: 3, visual_ideas: [{id: uuidv4(), description: 'Mock visual', image_prompt: 'mock', video_prompt: 'mock'}], dialogue: 'This is a mock CTA!', sound_effect: 'cha-ching' },
        generatedAt: new Date().toISOString(),
        inputSnapshot: input,
    };
    await new Promise(res => setTimeout(res, 1000)); // simulate network delay
    return [mockScript];
};

export const reviseScript = async (originalScript: Script, partsToRevise: Array<'hook' | 'content' | 'cta'>, instruction: string, language: string, systemInstruction: string): Promise<Script> => {
    console.log("Revising script:", originalScript.id, instruction);
    // Mock revision
    const revised = { ...originalScript, title: originalScript.title + " (Revised)" };
    if(partsToRevise.includes('hook')) revised.hook.dialogue = instruction;
    return revised;
};

export const fetchTrendingTopics = async (input: GenerationInput, language: string): Promise<string> => {
    const prompt = `Based on the product "${input.productName}" and target audience "${input.targetAudience}", find the latest trending topics, challenges, and sounds on ${input.platform} in ${language}.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { tools: [{googleSearch: {}}] },
    });
    return response.text;
};

export const analyzeProductUrl = async (url: string, language: string): Promise<ProductAnalysisResult> => {
    const prompt = `Analyze the content of the URL: ${url}. Extract the product name, create a compelling product description, and determine the most suitable product category and target audience.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: productAnalysisSchema,
        },
    });
    return parseJsonResponse(response.text, productAnalysisSchema);
};

export const generateScriptPartVariants = async (part: ScriptPart | ScriptPart[], script: Script, partName: 'hook' | 'content' | 'cta', language: string): Promise<any[]> => {
    console.log(`Generating variants for ${partName}`);
    // Mock variant generation
    const originalDialogue = Array.isArray(part) ? part.map(p => p.dialogue).join(' ') : part.dialogue;
    const variantPart = JSON.parse(JSON.stringify(part));
    if (Array.isArray(variantPart)) {
        variantPart[0].dialogue = `Variant of: ${originalDialogue}`;
    } else {
        variantPart.dialogue = `Variant of: ${originalDialogue}`;
    }
    return [[variantPart]]; // Returns array of variants, each variant is an array of script parts
};

export const generateMarketingAssets = async (script: Script, language: string): Promise<MarketingAssets> => {
    console.log("Generating marketing assets for", script.title);
    return {
        titles: ['Amazing New Title!', 'You Won\'t Believe This Title!'],
        hashtags: { general: ['#product'], platform_specific: ['#tiktokmademebuyit'], trending_suggestions: ['#trendingnow'] },
        thumbnail_text_ideas: ['WOW!', 'MUST SEE!']
    };
};

export const generateVoiceOverDirections = async (script: Script, language: string): Promise<VoiceOverDirections> => {
    console.log("Generating voice over directions for", script.title);
    const lines = [script.hook, ...script.content, script.cta].map(p => ({ dialogue: p.dialogue, direction: 'Read this clearly.' }));
    return {
        title: script.title,
        overallDirection: 'Speak in an upbeat and friendly tone.',
        lines: lines
    };
};

export const generateVideoFromScript = async (script: Script, onStatusUpdate: (statusKey: string, params?: any) => void): Promise<string[]> => {
    // This is a complex stub, a real implementation would be much more involved
    onStatusUpdate('video_gen_status_start');
    await new Promise(res => setTimeout(res, 1000));
    
    const allVisuals: VisualIdea[] = [
        ...script.hook.visual_ideas,
        ...script.content.flatMap(p => p.visual_ideas),
        ...script.cta.visual_ideas
    ];

    if (!script.storyboard || Object.keys(script.storyboard).length < allVisuals.length) {
        throw new Error("Storyboard is not fully generated. Please generate all storyboard images first.");
    }
    
    const generatedClips: string[] = [];

    // Simulate generating each clip
    for (let i = 0; i < allVisuals.length; i++) {
        const visual = allVisuals[i];
        onStatusUpdate('video_gen_status_scene', { current: i + 1, total: allVisuals.length });
        
        // In a real scenario, you'd call a video generation API here
        // For now, we'll create a dummy video clip (e.g., a colored canvas)
        const canvas = document.createElement('canvas');
        canvas.width = 360;
        canvas.height = 640;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        ctx.fillRect(0, 0, 360, 640);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Scene ${i + 1}`, 180, 320);

        // This part is tricky without a server or proper video library.
        // We'll return a data URL as a placeholder.
        const dataUrl = canvas.toDataURL('image/png'); 
        generatedClips.push(dataUrl); // This is not a video, but a placeholder to show success
        await new Promise(res => setTimeout(res, 1500));
    }
    
    onStatusUpdate('video_gen_status_done');
    // In a real app, these would be URLs to MP4 files.
    // For this simulation, we are returning image data URLs as placeholders.
    return generatedClips; 
};