import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/login/', '/register/'], // Disallow these for focus and privacy
        },
        sitemap: 'https://www.cledumemoire.com/sitemap.xml',
    }
}
