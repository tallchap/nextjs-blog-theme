import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
    const imageMime = mimeType || 'image/jpeg'

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Identify the dog breed in this photo. Respond with ONLY the breed name, nothing else. If it's a mix, give the most likely primary breed or say "Mixed Breed". If you can identify a specific designer breed (like Goldendoodle, Labradoodle, Cockapoo, etc.), use that name. Be specific and accurate.`,
            },
            {
              inlineData: {
                mimeType: imageMime,
                data: base64Data,
              },
            },
          ],
        },
      ],
    })

    const breed = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Mixed Breed'

    return NextResponse.json({ breed })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Breed detection error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
