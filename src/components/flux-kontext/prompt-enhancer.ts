const AI_OPTIMIZED_PROMPTS = [
  "A photorealistic portrait of a wise elderly wizard with flowing silver beard, intricate robes, magical aura, studio lighting, highly detailed",
  "Modern minimalist architecture, clean lines, glass and steel, natural lighting, professional photography, architectural digest style",
  "Vibrant street art mural, urban setting, colorful graffiti, dynamic composition, street photography, high contrast",
  "Serene Japanese garden, cherry blossoms, koi pond, traditional architecture, soft morning light, zen atmosphere",
  "Futuristic cyberpunk cityscape, neon lights, rain-soaked streets, flying vehicles, blade runner aesthetic, cinematic lighting",
];

const ENHANCEMENT_SUFFIXES = [
  ", professional photography, highly detailed, 8K resolution, award-winning composition",
  ", cinematic lighting, photorealistic, ultra-detailed, masterpiece quality",
  ", studio lighting, sharp focus, vibrant colors, professional grade",
  ", dramatic lighting, high contrast, artistic composition, gallery quality",
  ", natural lighting, crisp details, professional photography, magazine quality",
  ", soft lighting, elegant composition, fine art photography, museum quality",
];

const ENHANCEMENT_PREFIXES = [
  "Professional photo of ",
  "High-quality image of ",
  "Artistic rendering of ",
  "Detailed photograph of ",
  "Masterpiece depicting ",
  "Premium quality ",
];

function pickRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getEnhancedPrompt(currentPrompt: string): string {
  if (!currentPrompt.trim()) {
    return pickRandomItem(AI_OPTIMIZED_PROMPTS);
  }

  const suffix = pickRandomItem(ENHANCEMENT_SUFFIXES);

  if (Math.random() > 0.5) {
    return `${pickRandomItem(ENHANCEMENT_PREFIXES)}${currentPrompt}${suffix}`;
  }

  return `${currentPrompt}${suffix}`;
}
