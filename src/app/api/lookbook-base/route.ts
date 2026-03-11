import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'

function getBigQueryClient() {
  const keyJson = process.env.GCP_SERVICE_ACCOUNT_KEY
  if (!keyJson) throw new Error('GCP_SERVICE_ACCOUNT_KEY not configured')
  const credentials = JSON.parse(keyJson)
  return new BigQuery({ projectId: credentials.project_id, credentials })
}

export async function GET(req: NextRequest) {
  try {
    const breed = req.nextUrl.searchParams.get('breed')
    if (!breed) {
      return NextResponse.json({ error: 'breed parameter required' }, { status: 400 })
    }

    const bq = getBigQueryClient()
    const [rows] = await bq.query({
      query: 'SELECT image_base64 FROM `segment-446404.PawStyle.breed_lookbook` WHERE breed = @breed AND style = @style LIMIT 1',
      params: { breed, style: 'ungroomed' },
    })

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: `No lookbook image found for breed: ${breed}` }, { status: 404 })
    }

    return NextResponse.json({
      image: `data:image/png;base64,${rows[0].image_base64}`,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Lookbook base error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
