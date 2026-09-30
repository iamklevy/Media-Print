import { createStaffUploadUrl } from "@/lib/orders/actions";
import { putToSignedUrl } from "@/lib/storage/signed-upload";

export type StaffUploadResult =
  | { ok: true; path: string }
  | { ok: false; error?: string; tooLarge?: boolean };

/**
 * Uploads a staff file straight to Storage (see createStaffUploadUrl) and
 * returns its path for the matching save* action. `error` carries the
 * server's validation message when there is one; `tooLarge` flags a
 * rejection by the bucket's own size limit.
 */
export async function uploadStaffFile(
  kind: "sample" | "artwork" | "invoice",
  orderId: string,
  slot: number,
  file: File
): Promise<StaffUploadResult> {
  const target = await createStaffUploadUrl(kind, orderId, slot, { size: file.size, type: file.type });
  if (!target.ok || !target.path || !target.signedUrl) return { ok: false, error: target.error };

  const put = await putToSignedUrl(target.signedUrl, file);
  if (put.ok) return { ok: true, path: target.path };
  return { ok: false, tooLarge: put.status === 413 };
}
