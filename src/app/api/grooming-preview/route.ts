import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

const MAX_RETRIES = 2

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, breed, changes } = await req.json()

    if (!imageBase64 || !changes || changes.length === 0) {
      return NextResponse.json({ error: 'Image and at least one style change required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const changeDescriptions = changes.map((c: { area: string; style: string }) => {
      return `${c.area}: ${getStyleDescription(c.area, c.style)}`
    }).join('\n')

    const prompt = `You are an expert dog grooming visualizer. Edit this photo of a ${breed || 'dog'} to show ONLY the following grooming changes.

CRITICAL RULES:
- The dog must look EXACTLY the same - same breed, same face, same eyes, same expression, same coloring, same markings, same body position, same background
- ONLY modify the specific body parts listed below with the exact grooming style requested
- Do NOT change anything else about the dog or the image
- The result should look like a realistic "after grooming" photo of THIS EXACT dog
- Keep the same camera angle, lighting, and background

GROOMING CHANGES TO APPLY:
${changeDescriptions}

Generate the edited image showing only these grooming changes applied to this exact dog.`

    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
    const imageMime = mimeType || 'image/jpeg'

    // Retry loop for transient 500s
    let lastError: string = ''
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await client.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: imageMime,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['IMAGE'],
            imageConfig: {
              aspectRatio: '1:1',
            },
          },
        })

        const candidates = response.candidates
        if (candidates && candidates[0]?.content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData?.data) {
              return NextResponse.json({
                image: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
              })
            }
          }
        }

        lastError = 'No image in response'
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        lastError = msg

        // Retry on 500/INTERNAL errors
        if ((msg.includes('500') || msg.includes('INTERNAL')) && attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
          continue
        }

        // Rate limit
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
          return NextResponse.json({ error: 'Rate limited - please try again in a moment' }, { status: 429 })
        }

        break
      }
    }

    console.error('Grooming preview failed after retries:', lastError)
    return NextResponse.json({ error: lastError || 'No image generated' }, { status: 500 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Grooming preview error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function getStyleDescription(area: string, style: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    ears: {
      poofy: 'Full, fluffy, voluminous ears with lots of fur puffed out',
      rounded: 'Ears trimmed into soft, rounded shapes',
      trimmed: 'Ears neatly and closely trimmed short',
    },
    tail: {
      bob: 'Tail fur trimmed into a short, rounded bob shape',
      pom: 'Tail with a fluffy pom-pom ball of fur at the end',
      flag: 'Tail with long, flowing, feathered fur like a flag',
    },
    body: {
      smooth: 'Body fur clipped short and smooth all over',
      teddy: 'Body fur left fluffy and even all over like a teddy bear',
      lion: 'Lion cut - fur left long around chest/head like a mane, body clipped short',
    },
    face: {
      round: 'Face fur trimmed into a round, circular shape',
      clean: 'Face fur trimmed very short and neat',
      mustache: 'Face trimmed but with longer fur kept around the muzzle like a mustache',
    },
    legs: {
      fluffy: 'Leg fur left full and fluffy',
      trimmed: 'Leg fur neatly trimmed short',
      poodle: 'Poodle-style leg puffs - shaved with round puffs at the ankles',
    },
  }
  return descriptions[area]?.[style] || style
}
