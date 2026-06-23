import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { RoomCodeJoinForm } from './RoomCodeJoinForm'
import styles from './HeroLandingPage.module.css'
import { LanguageSegmentedControl } from '@/components/ui/LanguageSegmentedControl'
import { createHeroJsonLd, heroContent, type HeroLocale } from '@/lib/hero'

interface HeroLandingPageProps {
  locale: HeroLocale
  canonicalPath: string
}

const delayStyle = (index: number) => ({
  '--hero-delay': `${index * 90}ms`,
}) as CSSProperties

const h = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).map((className) => styles[className as string]).join(' ')

const primaryCtaClass =
  'inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#10b981] bg-[#10b981] px-[18px] font-black text-white no-underline shadow-[0_18px_40px_rgba(16,185,129,0.24)] motion-safe:transition-transform motion-safe:hover:-translate-y-px motion-safe:hover:bg-[#059669] max-[620px]:min-h-[46px] max-[620px]:flex-1 max-[620px]:basis-[150px] max-[620px]:justify-center'

const secondaryCtaClass =
  'inline-flex min-h-12 items-center rounded-lg border border-[rgba(236,253,245,0.25)] bg-[rgba(236,253,245,0.08)] px-[18px] font-black text-[#ecfdf5] no-underline motion-safe:transition-transform motion-safe:hover:-translate-y-px max-[620px]:min-h-[46px] max-[620px]:flex-1 max-[620px]:basis-[150px] max-[620px]:justify-center'

const tableAmountClass = (amount: string, isCurrent = false) =>
  h(
    'hero-room-table-amount',
    isCurrent && 'is-current',
    amount.startsWith('+') && 'is-positive',
    amount.startsWith('-') && 'is-negative',
  )

export function HeroLandingPage({
  locale,
  canonicalPath,
}: HeroLandingPageProps) {
  const content = heroContent[locale]
  const jsonLd = createHeroJsonLd(locale, canonicalPath)
  const playerCountLabel = locale === 'zh'
    ? `(${content.preview.players.length}人)`
    : `(${content.preview.players.length})`
  const roomTitle = locale === 'zh'
    ? `房间 ${content.preview.roomCode}`
    : `Room ${content.preview.roomCode}`
  const roundHeading = locale === 'zh' ? '轮次' : 'Round'
  const gameTabLabel = locale === 'zh' ? '牌局' : 'Game'
  const historyTabLabel = locale === 'zh' ? '历史' : 'History'
  const addFriendLabel = locale === 'zh' ? '加好友' : 'Invite'
  const nextRoundLabel = locale === 'zh' ? '下一轮' : 'Next round'

  return (
    <main className={h('hero-page')} lang={content.htmlLang}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className={h('hero-shell')} aria-labelledby="hero-title">
        <nav className={h('hero-nav')} aria-label="Hero navigation">
          <Link className={h('hero-brand')} href="/hero">
            <Image
              className={h('hero-brand-mark')}
              src="/icons/icon.svg"
              alt=""
              width={36}
              height={36}
              priority
              unoptimized
              aria-hidden="true"
            />
            <span>{content.brand}</span>
          </Link>

          <div className={h('hero-nav-links')}>
            <a href="#features">{content.navFeatures}</a>
            <a href="#use-cases">{content.navUseCases}</a>
            <a href="#faq">{content.navFaq}</a>
          </div>

          <LanguageSegmentedControl
            value={locale}
            ariaLabel={content.languageLabel}
            tone="dark"
            links={{
              zh: { href: '/hero/zh', hrefLang: 'zh-CN' },
              en: { href: '/hero/en', hrefLang: 'en' },
            }}
          />
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
                <span>{content.preview.tableTitle}</span>
                <strong>{nextRoundLabel}</strong>
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
            <div className={h('hero-room-phone')}>
              <div className={h('hero-room-screen')}>
                <header className={h('hero-room-header')}>
                  <div className={h('hero-room-title')}>
                    <strong>{roomTitle}</strong>
                    <span>{playerCountLabel}</span>
                    <i aria-hidden="true" />
                  </div>
                  <div className={h('hero-room-actions')} aria-hidden="true">
                    <span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                  </div>
                </header>

                <div className={h('hero-room-players')}>
                  {content.preview.players.map((player, index) => (
                    <div
                      className={h('hero-room-player', index === 0 && 'is-current')}
                      key={player.name}
                      style={delayStyle(index)}
                    >
                      <span className={h('hero-room-avatar')}>{player.emoji}</span>
                      <span className={h('hero-room-player-name')}>{player.name}</span>
                      <strong className={h(
                        'hero-room-player-amount',
                        player.tone === 'positive' && 'is-positive',
                        player.tone === 'negative' && 'is-negative',
                      )}>
                        {player.amount}
                      </strong>
                    </div>
                  ))}
                  <div className={h('hero-room-player', 'hero-room-add-player')}>
                    <span className={h('hero-room-add-icon')} aria-hidden="true">+</span>
                    <span className={h('hero-room-player-name')}>{addFriendLabel}</span>
                  </div>
                </div>

                <div className={h('hero-room-tabs')} aria-label={content.preview.tableTitle}>
                  <span className={h('is-active')}>{gameTabLabel}</span>
                  <span>{historyTabLabel}</span>
                </div>

                <div className={h('hero-room-table')}>
                  <div className={h('hero-room-table-head')}>
                    <span className={h('hero-room-table-round')}>{roundHeading}</span>
                    {content.preview.players.map((player, index) => (
                      <span
                        className={h('hero-room-table-player', index === 0 && 'is-current')}
                        key={player.name}
                      >
                        <span className={h('hero-room-table-avatar')}>{player.emoji}</span>
                        <span>{player.name}</span>
                      </span>
                    ))}
                  </div>

                  {content.preview.rounds.map((round, index) => (
                    <div className={h('hero-room-table-row')} key={round.label} style={delayStyle(index + 2)}>
                      <span className={h('hero-room-table-round')}>{round.label}</span>
                      <span className={tableAmountClass(round.east, true)}>{round.east}</span>
                      <span className={tableAmountClass(round.south)}>{round.south}</span>
                      <span className={tableAmountClass(round.west)}>{round.west}</span>
                      <span className={tableAmountClass(round.north)}>{round.north}</span>
                    </div>
                  ))}
                </div>

                <div className={h('hero-room-action-bar')}>
                  <span>{content.preview.round}</span>
                  <strong>{nextRoundLabel}</strong>
                </div>
              </div>
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
