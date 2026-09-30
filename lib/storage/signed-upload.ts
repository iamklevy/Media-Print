/**
 * Browser-side upload to a Supabase Storage signed upload URL (from
 * createSignedUploadUrl on the server). Files go straight to Storage instead
 * of through a Server Action because Vercel rejects function request bodies
 * over 4.5MB. Sends the same multipart shape as supabase-js's
 * uploadToSignedUrl.
 *
 * `status` is Storage's own status code: rejections arrive as HTTP 400 with
 * the real code in the body (e.g. "413" when the bucket's size limit is hit,
 * "415" for a MIME type the bucket doesn't allow). 0 means a network error.
 */
export async function putToSignedUrl(signedUrl: string, file: File): Promise<{ ok: boolean; status: number }> {
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", file);
  try {
    const res = await fetch(signedUrl, { method: "PUT", body, headers: { "x-upsert": "false" } });
    if (res.ok) return { ok: true, status: res.status };
    const payload = (await res.json().catch(() => null)) as { statusCode?: string } | null;
    const status = Number(payload?.statusCode);
    return { ok: false, status: Number.isFinite(status) && status > 0 ? status : res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
