/**
 * Cloudflare Pages Function — Resume File Download
 * GET /api/download/resumes/:filename
 *
 * Serves uploaded resume files from the R2 bucket.
 * The [[path]] catch-all route captures the full path after /api/download/.
 */

interface Env {
  RESUMES: any; // R2Bucket
}

export const onRequestGet = async (context: any) => {
  const { env, params } = context;

  // Reconstruct the full path from the catch-all route segments
  const pathSegments = params.path;
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;

  if (!path) {
    return new Response('File not found', { status: 404 });
  }

  const object = await env.RESUMES.get(path);

  if (!object) {
    return new Response('File not found', { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    'Content-Type',
    object.httpMetadata?.contentType || 'application/octet-stream'
  );
  if (object.httpMetadata?.contentDisposition) {
    headers.set('Content-Disposition', object.httpMetadata.contentDisposition);
  }
  headers.set('Cache-Control', 'private, max-age=3600');

  return new Response(object.body, { headers });
};
