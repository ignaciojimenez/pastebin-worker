export function headlessLandingPage(env: Env): string {
  const deployUrl = env.DEPLOY_URL || ""
  return `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PasteBin API</title>
  <style>body{font-family:monospace;max-width:600px;margin:2em auto;padding:0 1em;line-height:1.6;}pre{background:#f4f4f4;padding:1em;overflow-x:auto;}</style>
</head><body>
  <h1>PasteBin</h1>
  <p>API-only pastebin service.</p>
  <h2>Quick Start</h2>
  <pre>curl -Fc=@file.txt ${deployUrl}</pre>
  <p><a href="/api">API Reference</a> · <a href="/tos">Terms</a></p>
</body></html>`
}
