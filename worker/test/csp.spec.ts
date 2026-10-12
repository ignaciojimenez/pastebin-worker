import { test, expect, describe } from "vitest"
import { workerFetch, upload, BASE_URL } from "./testUtils.js"
import { createExecutionContext } from "cloudflare:test"
import { displayPageCsp, nonceTemplate } from "../csp.js"

// PER-43: the /d/ display page renders attacker-chosen content, so it carries a
// nonce-based CSP. In this environment SSR falls back to CSR (see ssr.spec.ts),
// so these requests exercise the CSR path; the SSR template sets the same nonce
// attributes directly.

const scriptTags = (html: string) => [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0])
const nonceOf = (csp: string) => /'nonce-([^']+)'/.exec(csp)?.[1]

describe("display page CSP", () => {
  const ctx = createExecutionContext()

  test("every script carries this response's nonce, and script-src allows nothing else", async () => {
    const uploadResp = await upload(ctx, { c: "csp test" })
    const name = new URL(uploadResp.url).pathname.slice(1)
    const resp = await workerFetch(ctx, `${BASE_URL}/d/${name}`)
    expect(resp.status).toBe(200)

    const csp = resp.headers.get("Content-Security-Policy")
    expect(csp).toBeTruthy()
    const scriptSrc = csp!.split("; ").find((d) => d.startsWith("script-src "))!
    expect(scriptSrc).toMatch(/^script-src 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'$/)
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'none'")

    const nonce = nonceOf(csp!)
    const tags = scriptTags(await resp.text())
    expect(tags.length).toBeGreaterThan(0)
    for (const tag of tags) expect(tag).toContain(`nonce="${nonce}"`)
  })

  test("each response gets a fresh nonce", async () => {
    const uploadResp = await upload(ctx, { c: "nonce freshness" })
    const name = new URL(uploadResp.url).pathname.slice(1)
    const a = nonceOf((await workerFetch(ctx, `${BASE_URL}/d/${name}`)).headers.get("Content-Security-Policy")!)
    const b = nonceOf((await workerFetch(ctx, `${BASE_URL}/d/${name}`)).headers.get("Content-Security-Policy")!)
    expect(a).toBeTruthy()
    expect(a).not.toBe(b)
  })

  test("a filename from the URL cannot close <title> or inject a script", async () => {
    const uploadResp = await upload(ctx, { c: "title escape" })
    const name = new URL(uploadResp.url).pathname.slice(1)
    const payload = encodeURIComponent("</title><script>alert(1)</script>.txt")
    const resp = await workerFetch(ctx, `${BASE_URL}/d/${name}/${payload}`)
    const html = await resp.text()
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).toContain("&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;")
    const nonce = nonceOf(resp.headers.get("Content-Security-Policy")!)
    for (const tag of scriptTags(html)) expect(tag).toContain(`nonce="${nonce}"`)
  })

  test("CSR path (encrypted paste): URL filename is escaped and scripts are nonced", async () => {
    // Encrypted pastes skip SSR, so this is the path that used to insert the
    // URL-decoded filename into <title> unescaped: a reflected XSS.
    const uploadResp = await upload(ctx, { c: "ciphertext", "encryption-scheme": "AES-GCM" })
    const name = new URL(uploadResp.url).pathname.slice(1)
    const payload = encodeURIComponent("</title><script>alert(1)</script>.txt")
    const resp = await workerFetch(ctx, `${BASE_URL}/d/${name}/${payload}`)
    const html = await resp.text()
    expect(html).not.toContain("__PASTE_DATA__") // proves this was the CSR path
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).toContain("&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;")
    const nonce = nonceOf(resp.headers.get("Content-Security-Policy")!)
    const tags = scriptTags(html)
    expect(tags.length).toBeGreaterThan(0)
    for (const tag of tags) expect(tag).toContain(`nonce="${nonce}"`)
  })

  test("HEAD carries the policy too", async () => {
    const uploadResp = await upload(ctx, { c: "head csp" })
    const name = new URL(uploadResp.url).pathname.slice(1)
    const resp = await workerFetch(ctx, new Request(`${BASE_URL}/d/${name}`, { method: "HEAD" }))
    expect(resp.headers.get("Content-Security-Policy")).toContain("'strict-dynamic'")
  })

  test("nonceTemplate nonces scripts and module preloads, nothing else", () => {
    const html = nonceTemplate(
      '<script>x</script><script type="module" src="/a.js"></script><link rel="modulepreload" href="/b.js"><link rel="stylesheet" href="/c.css">',
      "N",
    )
    expect(html).toBe(
      '<script nonce="N">x</script><script nonce="N" type="module" src="/a.js"></script><link rel="modulepreload" nonce="N" href="/b.js"><link rel="stylesheet" href="/c.css">',
    )
    expect(displayPageCsp("N")).not.toContain("'self' 'strict-dynamic'")
  })
})
