import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'LaunchPixel | AI Automation & Digital Solutions',
        short_name: 'LaunchPixel',
        description: 'Transform your business with AI-powered automation and cutting-edge digital solutions',
        start_url: '/',
        display: 'standalone',
        background_color: '#030712',
        theme_color: '#6366f1',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/apple-icon.png',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
    }
}
