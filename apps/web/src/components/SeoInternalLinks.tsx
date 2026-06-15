import Link from 'next/link';
import {
  FEATURED_FINGERPRINT_ROUTES,
  STATIC_SEO_ROUTES,
} from '@/lib/seo-routes';

interface SeoInternalLinksProps {
  currentPath?: string;
  title?: string;
  description?: string;
}

export function SeoInternalLinks({
  currentPath,
  title = 'Explore related CreepJS resources',
  description = 'Move between the main privacy tools, API documentation, and fingerprint signal explainers.',
}: SeoInternalLinksProps) {
  const staticLinks = STATIC_SEO_ROUTES.filter(
    (route) => route.path !== currentPath && route.path !== '/privacy'
  );

  return (
    <section className="bg-background border-t">
      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm leading-6">
            {description}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-normal">
              Core pages
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {staticLinks.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className="bg-muted/20 hover:bg-muted/40 rounded-md border p-4 transition-colors"
                >
                  <span className="block font-medium">{route.title}</span>
                  <span className="text-muted-foreground mt-1 block text-sm leading-5">
                    {route.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-normal">
              Popular fingerprint signals
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {FEATURED_FINGERPRINT_ROUTES.map((technique) => (
                <Link
                  key={technique.slug}
                  href={`/fingerprint/${technique.slug}`}
                  className="bg-muted/20 hover:bg-muted/40 rounded-md border p-4 transition-colors"
                >
                  <span className="block font-medium">{technique.name}</span>
                  <span className="text-muted-foreground mt-1 block text-sm leading-5">
                    {technique.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
