import Link from 'next/link';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'Page Not Found',
  description:
    'The page you are looking for does not exist. Explore the CreepJS fingerprint checker, IP risk checker, and documentation instead.',
  noIndex: true,
});

const SUGGESTED_LINKS = [
  {
    href: '/checker',
    title: 'Fingerprint Checker',
    description: 'Run a full browser fingerprint scan',
  },
  {
    href: '/ip',
    title: 'IP Risk Checker',
    description: 'Check any IP for proxy, VPN and datacenter signals',
  },
  {
    href: '/fingerprint',
    title: 'Fingerprint Signals',
    description: 'Browse every fingerprinting technique we explain',
  },
  {
    href: '/docs',
    title: 'Documentation',
    description: 'API, SDK, and integration guides',
  },
];

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-primary text-sm font-semibold uppercase tracking-wide">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
        The page you are looking for doesn&apos;t exist or has moved. Here are
        the most useful places to go next:
      </p>

      <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
        {SUGGESTED_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-muted/20 hover:bg-muted/40 rounded-lg border p-4 transition-colors"
          >
            <span className="block font-semibold">{link.title}</span>
            <span className="text-muted-foreground mt-1 block text-sm">
              {link.description}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="text-primary mt-8 inline-block text-sm font-medium hover:underline"
      >
        Back to the homepage
      </Link>
    </div>
  );
}
