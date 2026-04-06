/** Client-side calls to Better Auth JSON routes (`/api/auth/...`). */

const base = () => `${window.location.origin}/api/auth`

export async function authPost<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  })
  const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
  if (!res.ok) {
    throw new Error(json.message || json.error || `Erreur ${res.status}`)
  }
  return json as T
}
