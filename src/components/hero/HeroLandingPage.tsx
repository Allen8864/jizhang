import Link from 'next/link'
import type { CSSProperties } from 'react'
import { RoomCodeJoinForm } from './RoomCodeJoinForm'
import styles from './HeroLandingPage.module.css'
import { createHeroJsonLd, heroContent, type HeroLocale } from '@/lib/hero'

interface HeroLandingPageProps {
  locale: HeroLocale
  canonicalPath: string
  adaptive?: boolean
}

const delayStyle = (index: number) => ({
  '--hero-delay': `${index * 90}ms`,
}) as CSSProperties

const h = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).map((className) => styles[className as string]).join(' ')

const primaryCtaClass =
  'inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#f5b840] bg-[#f5b840] px-[18px] font-black text-[#17140e] no-underline shadow-[0_18px_40px_rgba(245,184,64,0.24)] motion-safe:transition-transform motion-safe:hover:-translate-y-px max-[620px]:min-h-[46px] max-[620px]:flex-1 max-[620px]:basis-[150px] max-[620px]:justify-center'

const secondaryCtaClass =
  'inline-flex min-h-12 items-center rounded-lg border border-[rgba(255,248,234,0.25)] bg-[rgba(255,248,234,0.08)] px-[18px] font-black text-[#fff8ea] no-underline motion-safe:transition-transform motion-safe:hover:-translate-y-px max-[620px]:min-h-[46px] max-[620px]:flex-1 max-[620px]:basis-[150px] max-[620px]:justify-center'

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
    <main className={h('hero-page')} lang={content.htmlLang}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className={h('hero-shell')} aria-labelledby="hero-title">
        <nav className={h('hero-nav')} aria-label="Hero navigation">
          <Link className={h('hero-brand')} href="/hero">
            <span className={h('hero-brand-mark')} aria-hidden="true">計</span>
            <span>{content.brand}</span>
          </Link>

          <div className={h('hero-nav-links')}>
            <a href="#features">{content.navFeatures}</a>
            <a href="#use-cases">{content.navUseCases}</a>
            <a href="#faq">{content.navFaq}</a>
          </div>

          <div className={h('hero-language')} aria-label={content.languageLabel}>
            <Link
              href="/hero/zh"
              className={h(!adaptive && locale === 'zh' && 'isActive')}
              hrefLang="zh-CN"
            >
              中
            </Link>
            <Link
              href="/hero/en"
              className={h(!adaptive && locale === 'en' && 'isActive')}
              hrefLang="en"
            >
              EN
            </Link>
          </div>
        </nav>

        <div className={h('hero-grid')}>
          <div className={h('hero-copy')}>
            <p className={h('hero-eyebrow')}>{content.eyebrow}</p>
            <h1 id="hero-title">{content.headline}</h1>
            <p className={h('hero-lead')}>{content.lead}</p>

            <div className={h('hero-proof')} aria-label={content.eyebrow}>
              {content.proof.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className={h('hero-mobile-preview')} aria-label={content.preview.tableTitle}>
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

            <div className="mt-[30px] flex flex-wrap items-center gap-3 max-[620px]:mt-3.5 max-[620px]:gap-2.5">
              <Link className={primaryCtaClass} href="/">
                {content.primaryCta}
                <span aria-hidden="true">↗</span>
              </Link>
              <a className={secondaryCtaClass} href="#features">
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

          <div className={h('hero-stage')} aria-label={content.preview.tableTitle}>
            <div className={h('hero-tabletop')} aria-hidden="true">
              <div className={h('hero-tile', 'hero-tile-one')}>🀄</div>
              <div className={h('hero-tile', 'hero-tile-two')}>♠</div>
              <div className={h('hero-tile', 'hero-tile-three')}>●</div>
            </div>

            <div className={h('hero-device')}>
              <div className={h('hero-device-top')}>
                <div>
                  <span>{content.preview.roomCodeLabel}</span>
                  <strong>{content.preview.roomCode}</strong>
                </div>
                <div className={h('hero-live-pill')}>
                  <span aria-hidden="true" />
                  {content.preview.live}
                </div>
              </div>

              <div className={h('hero-round-strip')}>
                <span>{content.preview.round}</span>
                <strong>{content.preview.tableTitle}</strong>
              </div>

              <div className={h('hero-player-grid')}>
                {content.preview.players.map((player, index) => (
                  <div className={h('hero-player')} key={player.name} style={delayStyle(index)}>
                    <span className={h('hero-player-emoji')}>{player.emoji}</span>
                    <span>{player.name}</span>
                    <strong className={toneClass[player.tone]}>{player.amount}</strong>
                  </div>
                ))}
              </div>

              <div className={h('hero-score-table')}>
                <div className={h('hero-score-head')}>
                  <span>{content.preview.round}</span>
                  <span>E</span>
                  <span>S</span>
                  <span>W</span>
                  <span>N</span>
                </div>
                {content.preview.rounds.map((round, index) => (
                  <div className={h('hero-score-row')} key={round.label} style={delayStyle(index + 2)}>
                    <span>{round.label}</span>
                    <span>{round.east}</span>
                    <span>{round.south}</span>
                    <span>{round.west}</span>
                    <span>{round.north}</span>
                  </div>
                ))}
              </div>

              <div className={h('hero-settlement')}>
                <div>
                  <span>{content.preview.settlementTitle}</span>
                  <strong>{content.preview.transfer}</strong>
                </div>
                <p>{content.preview.settlementHint}</p>
              </div>
            </div>

            <div className={h('hero-metrics')} aria-label={content.featuresTitle}>
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

      <section className={h('hero-section')} id="features">
        <div className={h('hero-section-heading')}>
          <p>{content.navFeatures}</p>
          <h2>{content.featuresTitle}</h2>
          <span>{content.featuresLead}</span>
        </div>
        <div className={h('hero-feature-grid')}>
          {content.features.map((feature) => (
            <article className={h('hero-feature-card')} key={feature.title}>
              <span>{feature.marker}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={h('hero-section', 'hero-use-section')} id="use-cases">
        <div className={h('hero-section-heading')}>
          <p>{content.navUseCases}</p>
          <h2>{content.useCasesTitle}</h2>
          <span>{content.useCasesLead}</span>
        </div>
        <div className={h('hero-use-grid')}>
          {content.useCases.map((useCase, index) => (
            <article className={h('hero-use-card')} key={useCase.name}>
              <div className={h('hero-use-index')}>{String(index + 1).padStart(2, '0')}</div>
              <h3>{useCase.name}</h3>
              <p>{useCase.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={h('hero-section')} id="faq">
        <div className={h('hero-section-heading')}>
          <p>{content.navFaq}</p>
          <h2>{content.faqTitle}</h2>
          <span>{content.faqLead}</span>
        </div>
        <div className={h('hero-faq-list')}>
          {content.faq.map((item) => (
            <details className={h('hero-faq-item')} key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={h('hero-final')}>
        <div>
          <h2>{content.finalCtaTitle}</h2>
          <p>{content.finalCtaBody}</p>
        </div>
        <Link className={primaryCtaClass} href="/">
          {content.primaryCta}
          <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  )
}
