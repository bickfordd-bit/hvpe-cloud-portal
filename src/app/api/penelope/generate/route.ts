import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  CINEMA_STORYLINES,
  CONTENT_TEMPLATES,
  VISUAL_PRESETS,
  AUDIO_TEMPLATES,
} from '@/lib/penelope/contentTemplates';

export const runtime = 'nodejs';

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.HVPE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey });
};

/**
 * Penelope Content Generation API
 *
 * Cinema-quality content creation with professional templates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      templateId,
      storylineId,
      targetLength = 'medium',
      visualPreset,
      audioStyle,
      additionalContext,
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Get template and storyline
    const template = CONTENT_TEMPLATES.find((t) => t.id === templateId) || CONTENT_TEMPLATES[0];
    const storyline = CINEMA_STORYLINES.find((s) => s.id === storylineId) || template.storyline;
    const visual =
      VISUAL_PRESETS[visualPreset as keyof typeof VISUAL_PRESETS] || VISUAL_PRESETS.CINEMATIC_DRAMA;
    const audio =
      AUDIO_TEMPLATES[audioStyle as keyof typeof AUDIO_TEMPLATES] ||
      AUDIO_TEMPLATES.EPIC_ORCHESTRAL;

    // Build comprehensive creative brief
    const systemPrompt = `You are PENELOPE, a cinema-quality content creation AI developed by Bickford Technologies.

You specialize in generating detailed creative treatments, shot lists, and production plans for professional video content.

TEMPLATE: ${template.name}
CATEGORY: ${template.category}
STORYLINE: ${storyline.title} (${storyline.genre})
TARGET LENGTH: ${storyline.targetLength[targetLength as keyof typeof storyline.targetLength]}

STORY STRUCTURE:
${storyline.structure.map((s, i) => `${i + 1}. ${s}`).join('\n')}

STORY BEATS:
${storyline.beats
  .map(
    (beat) => `
Beat ${beat.position}: ${beat.name}
- Purpose: ${beat.purpose}
- Duration: ${beat.duration}
- Visual Cues: ${beat.visualCues.join(', ')}
- Audio: ${beat.audioSuggestions.join(', ')}
`
  )
  .join('\n')}

VISUAL STYLE:
- Cinematography: ${storyline.visualStyle.cinematography.join(', ')}
- Color Palette: ${storyline.visualStyle.colorPalette.join(', ')}
- Lighting: ${storyline.visualStyle.lighting}
- Camera Movement: ${storyline.visualStyle.cameraMovement.join(', ')}
- Framing: ${storyline.visualStyle.framingPreferences.join(', ')}

COLOR GRADING:
- LUT: ${visual.lut}
- Contrast: ${visual.contrast}
- Saturation: ${visual.saturation}
- Temperature: ${visual.temperature}
- Grain: ${visual.grain}

AUDIO/MUSIC:
- Style: ${audio.style}
- Tempo: ${audio.tempo}
- Dynamics: ${audio.dynamics}
- Instrumentation: ${audio.instruments.join(', ')}
- Mood: ${audio.mood}

TECHNICAL SPECS:
- Aspect Ratio: ${template.technicalSpecs.aspectRatio}
- Resolution: ${template.technicalSpecs.resolution}
- Frame Rate: ${template.technicalSpecs.frameRate}
- Color Space: ${template.technicalSpecs.colorSpace}
- Audio Format: ${template.technicalSpecs.audioFormat}

Generate a professional creative treatment including:
1. CONCEPT SUMMARY (2-3 sentences)
2. DETAILED SHOT LIST (scene-by-scene breakdown)
3. VISUAL TREATMENT (specific camera, lighting, color notes)
4. AUDIO/MUSIC DIRECTION
5. POST-PRODUCTION NOTES
6. KEY CREATIVE DECISIONS

Make it production-ready and cinema-quality. Be specific with shot types, camera movements, lighting setups, and editing rhythm.`;

    let content: string;

    try {
      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Create a cinema-quality content treatment for: ${prompt}${additionalContext ? `\n\nAdditional Context: ${additionalContext}` : ''}`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      content = completion.choices[0]?.message?.content || 'Content generation failed';
    } catch (openaiError: unknown) {
      // Fallback to structured template response
      if (openaiError.message?.includes('API key')) {
        content = generateFallbackTreatment(prompt, template, storyline, targetLength);
      } else {
        throw openaiError;
      }
    }

    return NextResponse.json({
      treatment: content,
      metadata: {
        template: template.name,
        storyline: storyline.title,
        targetLength: storyline.targetLength[targetLength as keyof typeof storyline.targetLength],
        technicalSpecs: template.technicalSpecs,
        visualPreset: visualPreset || 'CINEMATIC_DRAMA',
        audioStyle: audioStyle || 'EPIC_ORCHESTRAL',
        timestamp: new Date().toISOString(),
        _penelope_version: '1.0.0',
      },
      production: {
        shots: storyline.beats.map((beat) => ({
          beatName: beat.name,
          duration: beat.duration,
          visualCues: beat.visualCues,
          audioSuggestions: beat.audioSuggestions,
        })),
        colorGrading: visual,
        audioDirection: audio,
      },
    });
  } catch (error: unknown) {
    console.error('Penelope API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Content generation failed' },
      { status: 500 }
    );
  }
}

function generateFallbackTreatment(
  prompt: string,
  template: unknown,
  storyline: unknown,
  targetLength: string
): string {
  return `# PENELOPE CREATIVE TREATMENT

## Concept: ${prompt}

### Overview
A ${targetLength}-form ${template.category} piece using the ${storyline.title} structure.

### Visual Approach
- Cinematography: ${storyline.visualStyle.cinematography.join(', ')}
- Color Palette: ${storyline.visualStyle.colorPalette.join(', ')}
- Lighting: ${storyline.visualStyle.lighting}

### Shot List
${storyline.beats
  .map(
    (beat: unknown, i: number) => `
**Shot ${i + 1}: ${beat.name}** (${beat.duration})
- Purpose: ${beat.purpose}
- Visual: ${beat.visualCues.join(', ')}
- Audio: ${beat.audioSuggestions.join(', ')}
`
  )
  .join('\n')}

### Audio Direction
${template.category === 'commercial' ? 'Bold, energetic score building to climax' : 'Atmospheric and emotional with purposeful silence'}

### Post-Production
- Color grade: ${template.category === 'cinematic' ? 'Filmic with rich contrast' : 'Clean and professional'}
- Pacing: ${targetLength === 'short' ? 'Quick cuts, high energy' : 'Measured, intentional rhythm'}
- Sound design: Immersive and detailed

---
*Generated by Penelope - Bickford Technologies*
`;
}

export async function GET() {
  return NextResponse.json({
    message: 'Penelope Content Creation API',
    version: '1.0.0',
    endpoints: {
      generate: 'POST /api/penelope/generate',
    },
    availableTemplates: CONTENT_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
    })),
    availableStorylines: CINEMA_STORYLINES.map((s) => ({
      id: s.id,
      title: s.title,
      genre: s.genre,
    })),
    visualPresets: Object.keys(VISUAL_PRESETS),
    audioStyles: Object.keys(AUDIO_TEMPLATES),
  });
}
