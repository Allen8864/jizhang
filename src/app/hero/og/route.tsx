import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'
import { heroContent, isHeroLocale, type HeroLocale } from '@/lib/hero'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const requestedLocale = request.nextUrl.searchParams.get('lang')
  const locale: HeroLocale = requestedLocale && isHeroLocale(requestedLocale)
    ? requestedLocale
    : 'en'
  const content = heroContent[locale]

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: '#10382d',
          color: '#fff8ea',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background:
              'linear-gradient(120deg, rgba(245,184,64,0.22), transparent 34%), linear-gradient(140deg, #0a2a22 0%, #134437 52%, #332618 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            opacity: 0.32,
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            padding: '70px',
            gap: '54px',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', width: '610px' }}>
            <div
              style={{
                display: 'flex',
                padding: '12px 18px',
                border: '1px solid rgba(245,184,64,0.55)',
                borderRadius: '8px',
                background: 'rgba(245,184,64,0.16)',
                color: '#ffd27a',
                fontSize: '24px',
                fontWeight: 800,
              }}
            >
              {content.eyebrow}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: '30px',
                fontSize: '76px',
                fontWeight: 900,
                lineHeight: 0.96,
                letterSpacing: '0',
              }}
            >
              {content.headline}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: '26px',
                color: 'rgba(255,248,234,0.78)',
                fontSize: '30px',
                lineHeight: 1.36,
              }}
            >
              {content.title}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              {content.proof.slice(0, 3).map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    padding: '10px 14px',
                    border: '1px solid rgba(255,248,234,0.18)',
                    borderRadius: '8px',
                    background: 'rgba(255,248,234,0.1)',
                    fontSize: '20px',
                    fontWeight: 800,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '390px',
              padding: '24px',
              border: '1px solid rgba(255,248,234,0.28)',
              borderRadius: '26px',
              background: '#10241f',
              boxShadow: '0 42px 90px rgba(0,0,0,0.34)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: 'rgba(255,248,234,0.58)', fontSize: '18px' }}>
                  {content.preview.roomCodeLabel}
                </div>
                <div style={{ color: '#fffdf6', fontSize: '44px', fontWeight: 900 }}>
                  {content.preview.roomCode}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  padding: '10px 14px',
                  border: '1px solid rgba(16,185,129,0.34)',
                  borderRadius: '8px',
                  background: 'rgba(16,185,129,0.12)',
                  color: '#a7f3d0',
                  fontSize: '18px',
                  fontWeight: 900,
                }}
              >
                {content.preview.live}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderRadius: '8px',
                background: '#fff8ea',
                color: '#173b30',
                fontSize: '22px',
                fontWeight: 900,
              }}
            >
              <span style={{ color: '#b45309' }}>{content.preview.round}</span>
              <span>{content.preview.tableTitle}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {content.preview.players.slice(0, 4).map((player) => (
                <div
                  key={player.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    border: '1px solid rgba(255,248,234,0.12)',
                    borderRadius: '8px',
                    background: 'rgba(255,248,234,0.08)',
                    fontSize: '21px',
                    fontWeight: 800,
                  }}
                >
                  <span>{player.emoji} {player.name}</span>
                  <span style={{ color: player.tone === 'negative' ? '#fda4af' : '#6ee7b7' }}>
                    {player.amount}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '14px',
                padding: '15px',
                border: '1px solid rgba(52,211,153,0.28)',
                borderRadius: '8px',
                background: 'rgba(52,211,153,0.12)',
              }}
            >
              <span style={{ color: '#a7f3d0', fontSize: '18px', fontWeight: 800 }}>
                {content.preview.settlementTitle}
              </span>
              <strong style={{ marginTop: '4px', fontSize: '24px' }}>
                {content.preview.transfer}
              </strong>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
