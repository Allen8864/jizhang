import Link from 'next/link'
import type { CSSProperties } from 'react'
import { RoomCodeJoinForm } from './RoomCodeJoinForm'
import { createHeroJsonLd, heroContent, type HeroLocale } from '@/lib/hero'

interface HeroLandingPageProps {
  locale: HeroLocale
  canonicalPath: string
  adaptive?: boolean
}

const delayStyle = (index: number) => ({
  '--hero-delay': `${index * 90}ms`,
}) as CSSProperties

const toneClass = {
  positive: 'text-emerald-300',
  negative: 'text-rose-300',
  neutral: 'text-stone-300',
}

export function HeroLandingPage({
  locale,
  canonicalPath,
  adaptive = false,
}: HeroLandingPageProps) {
  const content = heroContent[locale]
  const jsonLd = createHeroJsonLd(locale, canonicalPath)

  return (
    <main className="hero-page" lang={content.htmlLang}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="hero-shell" aria-labelledby="hero-title">
        <nav className="hero-nav" aria-label="Hero navigation">
          <Link className="hero-brand" href="/hero">
            <span className="hero-brand-mark" aria-hidden="true">計</span>
            <span>{content.brand}</span>
          </Link>

          <div className="hero-nav-links">
            <a href="#features">{content.navFeatures}</a>
            <a href="#use-cases">{content.navUseCases}</a>
            <a href="#faq">{content.navFaq}</a>
          </div>

          <div className="hero-language" aria-label={content.languageLabel}>
            <Link
              href="/hero/zh"
              className={!adaptive && locale === 'zh' ? 'is-active' : ''}
              hrefLang="zh-CN"
            >
              中
            </Link>
            <Link
              href="/hero/en"
              className={!adaptive && locale === 'en' ? 'is-active' : ''}
              hrefLang="en"
            >
              EN
            </Link>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-eyebrow">{content.eyebrow}</p>
            <h1 id="hero-title">{content.headline}</h1>
            <p className="hero-lead">{content.lead}</p>

            <div className="hero-proof" aria-label={content.eyebrow}>
              {content.proof.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="hero-mobile-preview" aria-label={content.preview.tableTitle}>
              <div>
                <span>{content.preview.roomCodeLabel}</span>
                <strong>{content.preview.roomCode}</strong>
              </div>
              <div>
                <span>{content.preview.round}</span>
                <strong>{content.preview.players[0].amount}</strong>
              </div>
              <div>
                <span>{content.preview.settlementTitle}</span>
                <strong>{content.preview.transfer}</strong>
              </div>
            </div>

            <div className="hero-actions">
              <Link className="hero-primary-cta" href="/">
                {content.primaryCta}
                <span aria-hidden="true">↗</span>
              </Link>
              <a className="hero-secondary-cta" href="#features">
                {content.secondaryCta}
              </a>
            </div>

            <RoomCodeJoinForm
              label={content.joinLabel}
              placeholder={content.joinPlaceholder}
              buttonLabel={content.joinButton}
              errorLabel={content.joinError}
            />
          </div>

          <div className="hero-stage" aria-label={content.preview.tableTitle}>
            <div className="hero-tabletop" aria-hidden="true">
              <div className="hero-tile hero-tile-one">🀄</div>
              <div className="hero-tile hero-tile-two">♠</div>
              <div className="hero-tile hero-tile-three">●</div>
            </div>

            <div className="hero-device">
              <div className="hero-device-top">
                <div>
                  <span>{content.preview.roomCodeLabel}</span>
                  <strong>{content.preview.roomCode}</strong>
                </div>
                <div className="hero-live-pill">
                  <span aria-hidden="true" />
                  {content.preview.live}
                </div>
              </div>

              <div className="hero-round-strip">
                <span>{content.preview.round}</span>
                <strong>{content.preview.tableTitle}</strong>
              </div>

              <div className="hero-player-grid">
                {content.preview.players.map((player, index) => (
                  <div className="hero-player" key={player.name} style={delayStyle(index)}>
                    <span className="hero-player-emoji">{player.emoji}</span>
                    <span>{player.name}</span>
                    <strong className={toneClass[player.tone]}>{player.amount}</strong>
                  </div>
                ))}
              </div>

              <div className="hero-score-table">
                <div className="hero-score-head">
                  <span>{content.preview.round}</span>
                  <span>E</span>
                  <span>S</span>
                  <span>W</span>
                  <span>N</span>
                </div>
                {content.preview.rounds.map((round, index) => (
                  <div className="hero-score-row" key={round.label} style={delayStyle(index + 2)}>
                    <span>{round.label}</span>
                    <span>{round.east}</span>
                    <span>{round.south}</span>
                    <span>{round.west}</span>
                    <span>{round.north}</span>
                  </div>
                ))}
              </div>

              <div className="hero-settlement">
                <div>
                  <span>{content.preview.settlementTitle}</span>
                  <strong>{content.preview.transfer}</strong>
                </div>
                <p>{content.preview.settlementHint}</p>
              </div>
            </div>

            <div className="hero-metrics" aria-label={content.featuresTitle}>
              {content.metrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hero-section" id="features">
        <div className="hero-section-heading">
          <p>{content.navFeatures}</p>
          <h2>{content.featuresTitle}</h2>
          <span>{content.featuresLead}</span>
        </div>
        <div className="hero-feature-grid">
          {content.features.map((feature) => (
            <article className="hero-feature-card" key={feature.title}>
              <span>{feature.marker}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hero-section hero-use-section" id="use-cases">
        <div className="hero-section-heading">
          <p>{content.navUseCases}</p>
          <h2>{content.useCasesTitle}</h2>
          <span>{content.useCasesLead}</span>
        </div>
        <div className="hero-use-grid">
          {content.useCases.map((useCase, index) => (
            <article className="hero-use-card" key={useCase.name}>
              <div className="hero-use-index">{String(index + 1).padStart(2, '0')}</div>
              <h3>{useCase.name}</h3>
              <p>{useCase.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hero-section" id="faq">
        <div className="hero-section-heading">
          <p>{content.navFaq}</p>
          <h2>{content.faqTitle}</h2>
          <span>{content.faqLead}</span>
        </div>
        <div className="hero-faq-list">
          {content.faq.map((item) => (
            <details className="hero-faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="hero-final">
        <div>
          <h2>{content.finalCtaTitle}</h2>
          <p>{content.finalCtaBody}</p>
        </div>
        <Link className="hero-primary-cta" href="/">
          {content.primaryCta}
          <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  )
}
