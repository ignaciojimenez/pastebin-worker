// Content-Security-Policy for the /d/ display page (PER-43).
//
// The page renders attacker-chosen paste content, some of it through
// dangerouslySetInnerHTML, so the policy is defence in depth against anything
// that slips past escaping and sanitising. Scripts run only with this
// response's nonce; 'strict-dynamic' lets those scripts load the bundle's own
// chunks. There is deliberately no 'self' in script-src: on a pastebin, 'self'
// would allow `<script src="/<a paste uploaded as JavaScript>">`.

export function newNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function displayPageCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob:",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "connect-src 'self'",
  ].join("; ")
}

// Adds the nonce to every <script> and <link rel="modulepreload"> in TRUSTED
// template HTML. Apply it before any user-controlled text is inserted, or an
// injected "<script" would receive the nonce too.
export function nonceTemplate(html: string, nonce: string): string {
  return html
    .replace(/<script\b/g, `<script nonce="${nonce}"`)
    .replace(/<link rel="modulepreload"/g, `<link rel="modulepreload" nonce="${nonce}"`)
}
