/** Wraps email body in a minimal HTML layout. */
export function emailShell(title: string, innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/><title>${escapeHtml(title)}</title></head>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:18px;margin:0 0 16px;">${escapeHtml(title)}</h1>
  <div>${innerHtml}</div>
  <p style="margin-top:32px;font-size:12px;color:#666;">${escapeHtml(process.env.NEXT_PUBLIC_APP_NAME || "Waiting List")}</p>
</body>
</html>`
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
