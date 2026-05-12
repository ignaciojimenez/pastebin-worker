import { atob_utf8, btoa_utf8, WorkerError } from "../common.js"
import { compareSync } from "bcrypt-ts"

// Encoding function
export function encodeBasicAuth(username: string, password: string): string {
  const credentials = `${username}:${password}`
  return `Basic ${btoa_utf8(credentials)}`
}

// Decoding function
export function decodeBasicAuth(encodedString: string): {
  username: string
  password: string
} {
  const [scheme, encodedCredentials] = encodedString.split(" ")
  if (scheme !== "Basic") {
    throw new WorkerError(400, "Invalid authentication scheme")
  }
  const credentials = atob_utf8(encodedCredentials)
  const [username, password] = credentials.split(":", 2)
  return { username, password }
}

// Resolve the configured user→hash map. Prefer BASIC_AUTH_HASHES (a JSON
// string set via `wrangler secret put`) so credentials don't sit in
// committed wrangler.toml vars. Fall back to env.BASIC_AUTH (object var,
// upstream-compatible) when the secret is absent.
function resolveBasicAuthMap(env: Env): Record<string, string> {
  const secretJson = (env as unknown as { BASIC_AUTH_HASHES?: string }).BASIC_AUTH_HASHES
  if (typeof secretJson === "string" && secretJson.length > 0) {
    try {
      const parsed: unknown = JSON.parse(secretJson)
      if (parsed && typeof parsed === "object") return parsed as Record<string, string>
    } catch {
      throw new WorkerError(500, "Configuration Error: BASIC_AUTH_HASHES is not valid JSON")
    }
  }
  return (env.BASIC_AUTH as Record<string, string>) || {}
}

// return null if auth passes or is not required,
// return auth page if auth is required
// throw WorkerError if auth failed
export function verifyAuth(request: Request, env: Env): Response | null {
  const basic_auth = resolveBasicAuthMap(env)
  const auth_entries = Object.entries(basic_auth)

  const passwdMap = new Map<string, string>()
  for (const [user, hash] of auth_entries) {
    if (!hash.startsWith("$2")) {
      throw new WorkerError(
        500,
        `Configuration Error: Password for user '${user}' is not a valid bcrypt hash. Only hashed passwords are allowed.`,
      )
    }
    passwdMap.set(user, hash)
  }

  // pass auth if 'BASIC_AUTH' is empty
  if (passwdMap.size === 0) return null

  if (request.headers.has("Authorization")) {
    const { username, password } = decodeBasicAuth(request.headers.get("Authorization")!)
    if (!passwdMap.has(username) || !compareSync(password, passwdMap.get(username)!)) {
      throw new WorkerError(401, "incorrect passwd for basic auth")
    } else {
      return null
    }
  } else {
    return new Response("HTTP basic auth is required", {
      status: 401,
      headers: {
        // Prompts the user for credentials.
        "WWW-Authenticate": 'Basic charset="UTF-8"',
      },
    })
  }
}
