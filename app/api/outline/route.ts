import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const file = searchParams.get('file')

  ensureDataDir()

  if (!file) {
    // Return list of .json files
    const entries = fs.readdirSync(dataDir)
    const files = entries
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace(/\.json$/, ''))
    return NextResponse.json({ files })
  }

  // Return specific file
  const filePath = path.join(dataDir, `${file}.json`)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(content)
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const file = searchParams.get('file')

  if (!file) {
    return NextResponse.json({ error: 'file parameter required' }, { status: 400 })
  }

  ensureDataDir()

  const filePath = path.join(dataDir, `${file}.json`)
  const body = await request.json()
  fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8')

  return NextResponse.json({ ok: true })
}
