import { expect, describe, it, beforeEach, afterEach } from "vitest"
import { createExecutionContext, env } from "cloudflare:test"
import { addRole, BASE_URL, genRandomBlob, upload, workerFetch } from "./testUtils"

describe("headless mode", () => {
  const ctx = createExecutionContext()
  const blob1 = genRandomBlob(1024)

  beforeEach(() => {
    env.HEADLESS_MODE = true
  })

  afterEach(() => {
    env.HEADLESS_MODE = false
  })

  it("should return headless landing page for GET /", async () => {
    const resp = await workerFetch(ctx, BASE_URL)
    expect(resp.status).toStrictEqual(200)
    const text = await resp.text()
    expect(text).toContain("API-only pastebin service")
    expect(text).toContain(env.DEPLOY_URL)
    expect(resp.headers.get("Content-Type")).toStrictEqual("text/html;charset=UTF-8")
  })

  it("should return headless landing page for admin URL", async () => {
    const uploadResp = await upload(ctx, { c: blob1 })
    env.HEADLESS_MODE = true
    const manageResp = await workerFetch(ctx, uploadResp.manageUrl)
    expect(manageResp.status).toStrictEqual(200)
    const text = await manageResp.text()
    expect(text).toContain("API-only pastebin service")
  })

  it("should still allow POST / to create pastes", async () => {
    const resp = await upload(ctx, { c: blob1 })
    expect(resp.url).toBeDefined()
    expect(resp.manageUrl).toBeDefined()
  })

  it("should still allow GET /<name> to retrieve pastes", async () => {
    const uploadResp = await upload(ctx, { c: blob1 })
    const getResp = await workerFetch(ctx, uploadResp.url)
    expect(getResp.status).toStrictEqual(200)
  })

  it("should still serve display page for GET /d/<name>", async () => {
    const uploadResp = await upload(ctx, { c: blob1 })
    const displayUrl = addRole(uploadResp.url, "d")
    const displayResp = await workerFetch(ctx, displayUrl)
    expect(displayResp.status).toStrictEqual(200)
    expect(displayResp.headers.get("Content-Type")).toStrictEqual("text/html;charset=UTF-8")
  })

  it("should return 403 for GET /u/<name>", async () => {
    const uploadResp = await upload(ctx, { c: new Blob(["https://example.com"]) })
    const redirectUrl = addRole(uploadResp.url, "u")
    const redirectResp = await workerFetch(ctx, redirectUrl)
    expect(redirectResp.status).toStrictEqual(403)
    const text = await redirectResp.text()
    expect(text).toContain("URL redirect is disabled in headless mode")
  })

  it("should return 403 for GET /a/<name>", async () => {
    const uploadResp = await upload(ctx, { c: new Blob(["# Hello"]) })
    const articleUrl = addRole(uploadResp.url, "a")
    const articleResp = await workerFetch(ctx, articleUrl)
    expect(articleResp.status).toStrictEqual(403)
    const text = await articleResp.text()
    expect(text).toContain("Article rendering is disabled in headless mode")
  })
})
