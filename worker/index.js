/**
 * Runs only when no static asset matched the request.
 *
 * Cloudflare's own `not_found_handling: "404-page"` cannot be used here:
 * `html_handling: "auto-trailing-slash"` canonicalises `404.html` to `/404`,
 * so the handler never finds the file it is looking for and misses come back
 * with an empty body. Fetching the page through the assets binding and
 * restamping the status is explicit and does not depend on that resolution.
 */
export default {
  async fetch(request, env) {
    const { origin } = new URL(request.url);
    const page = await env.ASSETS.fetch(`${origin}/404`);

    // If even the 404 page is missing, still answer with a real status rather
    // than passing along whatever the assets binding said.
    if (!page.ok) return new Response('Not found', { status: 404 });

    return new Response(page.body, {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  },
};
