import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import path from 'path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  const fontData = await readFile(
    path.join(process.cwd(), 'app/fonts/DancingScript-Regular.ttf')
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #f5c5b0 0%, #e8a898 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 2,
        }}
      >
        <span
          style={{
            fontFamily: 'Dancing Script',
            fontSize: 26,
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          a
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Dancing Script',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
