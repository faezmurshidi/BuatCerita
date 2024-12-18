import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import WebSocket from 'ws'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!process.env.ELEVEN_LABS_API_KEY) {
      throw new Error("Missing ELEVENLABS_API_KEY")
    }

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'audio')
    try {
      await fs.promises.access(outputDir, fs.constants.R_OK | fs.constants.W_OK)
    } catch (err) {
      await fs.promises.mkdir(outputDir, { recursive: true })
    }

    // Generate unique filename
    const filename = `speech-${Date.now()}.mp3`
    const filepath = path.join(outputDir, filename)
    const writeStream = fs.createWriteStream(filepath)

    // Initialize websocket connection
    const voiceId = "21m00Tcm4TlvDq8ikWAM"
    const model = "eleven_multilingual_v2"
    const uri = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}`
    
    const audioData: Buffer[] = []
    
    return new Promise((resolve, reject) => {
      const websocket = new WebSocket(uri, {
        headers: { "xi-api-key": process.env.ELEVEN_LABS_API_KEY }
      })

      websocket.on('open', () => {
        // Send initial configuration
        websocket.send(JSON.stringify({
          text: " ",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
          generation_config: { chunk_length_schedule: [120, 160, 250, 290] }
        }))

        // Send the text
        websocket.send(JSON.stringify({ text }))

        // Close the connection
        websocket.send(JSON.stringify({ text: "" }))
      })

      websocket.on('message', (event) => {
        const data = JSON.parse(event.toString())
        if (data.audio) {
          const audioBuffer = Buffer.from(data.audio, 'base64')
          audioData.push(audioBuffer)
          writeStream.write(audioBuffer)
        }
      })

      websocket.on('close', () => {
        writeStream.end()
        const publicUrl = `/audio/${filename}`
        resolve(NextResponse.json({ audioUrl: publicUrl }))
      })

      websocket.on('error', (error) => {
        console.error("WebSocket error:", error)
        reject(error)
      })
    })

  } catch (error) {
    console.error("Speech generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    )
  }
} 