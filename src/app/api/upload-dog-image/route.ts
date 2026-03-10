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

    // Convert base64 to buffer for upload
    const buffer = Buffer.from(base64Data, 'base64')
    const blob = new Blob([buffer], { type: imageMime })

    const uploaded = await client.files.upload({
      file: blob,
      config: {
        displayName: 'dog-grooming-input',
        mimeType: imageMime,
      },
    })

    if (!uploaded.uri) {
      return NextResponse.json({ error: 'Upload failed - no URI returned' }, { status: 500 })
    }

    return NextResponse.json({
      fileUri: uploaded.uri,
      mimeType: uploaded.mimeType || imageMime,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('File upload error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
