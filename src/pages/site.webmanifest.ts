import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { link } from '../lib/url';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: site.name,
        short_name: site.shortName,
        description: site.description,
        start_url: link(),
        scope: link(),
        display: 'browser',
        background_color: site.themeColor,
        theme_color: site.themeColor,
        icons: [
          { src: link('favicon.svg'), type: 'image/svg+xml', sizes: 'any' },
          { src: link('icon-512.png'), type: 'image/png', sizes: '512x512' },
          { src: link('apple-touch-icon.png'), type: 'image/png', sizes: '180x180' },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
