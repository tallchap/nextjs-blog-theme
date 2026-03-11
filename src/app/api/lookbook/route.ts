import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { BigQuery } from '@google-cloud/bigquery'

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

function getBigQueryClient() {
  const keyJson = process.env.GCP_SERVICE_ACCOUNT_KEY
  if (!keyJson) throw new Error('GCP_SERVICE_ACCOUNT_KEY not configured')
  const credentials = JSON.parse(keyJson)
  return new BigQuery({ projectId: credentials.project_id, credentials })
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

const MAX_RETRIES = 2

export async function POST(req: NextRequest) {
  try {
    const { breed, changes } = await req.json()

    if (!breed || !changes || changes.length === 0) {
      return NextResponse.json({ error: 'Breed and at least one style change required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    // Fetch ungroomed base image from BigQuery
    const bq = getBigQueryClient()
    const [rows] = await bq.query({
      query: 'SELECT image_base64 FROM `segment-446404.PawStyle.breed_lookbook` WHERE breed = @breed AND style = @style LIMIT 1',
      params: { breed, style: 'ungroomed' },
    })

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: `No lookbook image found for breed: ${breed}` }, { status: 404 })
    }

    const baseImageBase64 = rows[0].image_base64

    const changeDescriptions = changes.map((c: { area: string; style: string }) => {
      return `${c.area}: ${getStyleDescription(c.area, c.style)}`
    }).join('\n')

    const prompt = `You are an expert dog grooming visualizer. Edit this photo of a ${breed} to show ONLY the following grooming changes.

CRITICAL RULES:
- The dog must look EXACTLY the same - same breed, same face, same eyes, same expression, same coloring, same markings, same body position, same background
- Maintain the EXACT body outline, proportions, silhouette, and pose
- Preserve the exact background, lighting, and scene - do not change or remove the background
- Only modify the fur length and texture in the specified areas - do not reshape any body part
- The dog's skeleton, musculature, and joint positions must remain identical to the input photo
- ONLY modify the specific body parts listed below with the exact grooming style requested
- Do NOT change anything else about the dog or the image
- The result should look like a realistic "after grooming" photo
- Keep the same camera angle, lighting, and background

GROOMING CHANGES TO APPLY:
${changeDescriptions}

Generate the edited image showing only these grooming changes applied to this exact dog.`

    const imagePart = {
      inlineData: {
        mimeType: 'image/png',
        data: baseImageBase64,
      },
    }

    let lastError = ''
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await client.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
          config: { responseModalities: ['IMAGE'] },
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
        if ((msg.includes('500') || msg.includes('INTERNAL')) && attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
          continue
        }
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
          return NextResponse.json({ error: 'Rate limited - please try again in a moment' }, { status: 429 })
        }
        break
      }
    }

    console.error('Lookbook preview failed after retries:', lastError)
    return NextResponse.json({ error: lastError || 'No image generated' }, { status: 500 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Lookbook error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
