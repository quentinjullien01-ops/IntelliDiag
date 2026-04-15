// ═══ AI SERVICE ═══
// Handles communication with Claude API

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

/**
 * Convert a File to base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsDataURL(file);
  });
}

/**
 * Analyze one or more photos and return a fiche JSON
 * @param {File[]} files - Array of image files
 * @param {string} systemPrompt - The system prompt
 * @param {string} apiKey - Anthropic API key
 * @returns {object} Parsed fiche JSON
 */
export async function analyzePhotos(files, systemPrompt, apiKey) {
  // Build image content array
  const content = [];

  for (const file of files) {
    const base64 = await fileToBase64(file);
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: file.type || 'image/jpeg',
        data: base64,
      },
    });
  }

  content.push({
    type: 'text',
    text: `${files.length} photo(s) du même constat/zone. Analyse complète de tous les désordres visibles. Retourne le JSON.`,
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  // Add API key if provided
  if (apiKey) {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'Erreur API');
  }

  const text = data.content
    ?.map((c) => c.text || '')
    .join('')
    .trim();

  if (!text) throw new Error('Réponse vide de l\'API');

  // Clean and parse JSON
  const cleaned = text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  const parsed = JSON.parse(cleaned);
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

/**
 * Generate mission synthesis
 */
export async function generateSynthesis(systemPrompt, missionName, contexte, fichesData, apiKey) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Mission : ${missionName}\n${contexte ? `Contexte de l'ouvrage : ${contexte}\n` : ''}Données des fiches :\n${JSON.stringify(fichesData, null, 2)}`,
      }],
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'Erreur API');
  }

  return data.content
    ?.map((c) => c.text || '')
    .join('')
    .trim() || '';
}
