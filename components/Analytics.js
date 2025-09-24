import Script from 'next/script'

export default function Analytics() {
  // Only load analytics in production and browser
  if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
    return null
  }

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID

  // Don't load if no GA ID is configured
  if (!GA_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  )
}

// Utility function to track events
export const trackEvent = (action, category = 'engagement', label = '', value = 0) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Analytics Event:', { action, category, label, value })
    return
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      anonymize_ip: true
    })
  }
}

// Utility function to track calculator usage
export const trackCalculatorUse = (calculatorType, inputs) => {
  trackEvent('calculator_used', 'calculator', calculatorType, 1)

  // Track specific calculator metrics without PII
  if (calculatorType === 'concrete') {
    const volume = inputs.length * inputs.width * (inputs.thickness / 12) / 27
    trackEvent('concrete_volume_calculated', 'calculator_metrics', 'cubic_yards', Math.round(volume))
  }
}