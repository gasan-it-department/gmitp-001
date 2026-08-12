import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Head, usePage } from '@inertiajs/react';

export type StructuredData = Record<string, unknown>;

export interface SeoSharedData {
    site_url: string;
    default_image: string;
}

interface PublicSeoProps {
    title: string;
    description?: string;
    canonicalUrl?: string;
    imageUrl?: string;
    type?: 'website' | 'article';
    noIndex?: boolean;
    structuredData?: StructuredData | StructuredData[];
}

interface SeoPageProps {
    app_name: string;
    currentMunicipality?: Municipality;
    seo?: SeoSharedData;
    [key: string]: unknown;
}

const FALLBACK_SITE_URL = 'http://localhost';

export function absoluteUrl(value: string, siteUrl: string): string {
    try {
        const url = new URL(value, `${siteUrl.replace(/\/$/, '')}/`);
        url.pathname = url.pathname.replace(/\/{2,}/g, '/');

        return url.toString();
    } catch {
        return value;
    }
}

export function canonicalizeUrl(value: string, siteUrl: string): string {
    try {
        const url = new URL(value, `${siteUrl.replace(/\/$/, '')}/`);
        const pageNumber = url.searchParams.get('page');
        url.pathname = url.pathname.replace(/\/{2,}/g, '/');
        url.search = '';
        url.hash = '';

        if (pageNumber && /^\d+$/.test(pageNumber) && Number(pageNumber) > 1) {
            url.searchParams.set('page', pageNumber);
        }

        return url.toString();
    } catch {
        return value;
    }
}

export function summarizeText(value: string, maximumLength = 160): string {
    const normalized = value
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (normalized.length <= maximumLength) {
        return normalized;
    }

    return `${normalized.slice(0, maximumLength - 3).trimEnd()}...`;
}

function isTemporarySignedUrl(value: string): boolean {
    try {
        const url = new URL(value, FALLBACK_SITE_URL);

        return url.searchParams.has('X-Amz-Signature') || url.searchParams.has('X-Amz-Expires');
    } catch {
        return false;
    }
}

export default function PublicSeo({ title, description, canonicalUrl, imageUrl, type = 'website', noIndex = false, structuredData }: PublicSeoProps) {
    const page = usePage<SeoPageProps>();
    const { app_name: appName, currentMunicipality, seo } = page.props;
    const siteUrl = seo?.site_url || FALLBACK_SITE_URL;
    const municipalityName = currentMunicipality?.name;
    const resolvedDescription = summarizeText(
        description?.trim() ||
            (municipalityName
                ? `Access municipal services, announcements, events, and public information from the Municipality of ${municipalityName}.`
                : 'Access local government services, announcements, events, and public information online.'),
    );
    const resolvedCanonicalUrl = canonicalizeUrl(canonicalUrl || page.url, siteUrl);
    const defaultImageUrl = seo?.default_image || '/assets/gasan-poster-banner.png';
    const shareImageUrl = imageUrl && !isTemporarySignedUrl(imageUrl) ? imageUrl : defaultImageUrl;
    const resolvedImageUrl = absoluteUrl(shareImageUrl, siteUrl);
    const schemas = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];

    return (
        <Head title={title.trim() || appName}>
            <meta head-key="description" name="description" content={resolvedDescription} />
            <link head-key="canonical" rel="canonical" href={resolvedCanonicalUrl} />

            <meta head-key="og:type" property="og:type" content={type} />
            <meta head-key="og:site_name" property="og:site_name" content={appName} />
            <meta head-key="og:title" property="og:title" content={title.trim() || appName} />
            <meta head-key="og:description" property="og:description" content={resolvedDescription} />
            <meta head-key="og:url" property="og:url" content={resolvedCanonicalUrl} />
            <meta head-key="og:image" property="og:image" content={resolvedImageUrl} />
            <meta head-key="og:locale" property="og:locale" content="en_PH" />

            <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
            <meta head-key="twitter:title" name="twitter:title" content={title.trim() || appName} />
            <meta head-key="twitter:description" name="twitter:description" content={resolvedDescription} />
            <meta head-key="twitter:image" name="twitter:image" content={resolvedImageUrl} />

            {noIndex && <meta head-key="robots" name="robots" content="noindex, nofollow" />}

            {schemas.map((schema, index) => (
                <script head-key={`structured-data-${index}`} key={index} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Head>
    );
}
