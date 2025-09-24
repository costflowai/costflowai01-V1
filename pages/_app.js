import '../styles/globals.css'
import Head from 'next/head'
import { useEffect } from 'react'
import Analytics from '../components/Analytics'

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <>
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="CostFlowAI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CostFlowAI" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1a365d" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#1a365d" />

        {/* Manifest and Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/icon-192.png" />

        {/* Performance and SEO */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />

        {/* Open Graph defaults */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CostFlowAI" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card defaults */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@costflowai" />
      </Head>
      <Analytics />
      <Component {...pageProps} />
    </>
  )
}