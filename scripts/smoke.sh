#!/usr/bin/env bash
# Smoke-test a deployed pastebin-worker instance.
#
#   scripts/smoke.sh https://pb-dev.i-jimenezpi.workers.dev
#
# Exercises the paste lifecycle plus this fork's headless-mode guards against a
# live deployment. Read-only apart from one paste it creates and then deletes.
set -uo pipefail

BASE="${1:-}"
if [[ -z "$BASE" ]]; then
  echo "usage: $0 <base-url> [user:password]" >&2
  exit 2
fi
BASE="${BASE%/}"
AUTH_ARGS=()
[[ $# -ge 2 ]] && AUTH_ARGS=(-u "$2")

pass=0
fail=0
check() { # check <label> <actual> <expected>
  if [[ "$2" == "$3" ]]; then
    printf '  ok    %-46s %s\n' "$1" "$2"
    pass=$((pass + 1))
  else
    printf '  FAIL  %-46s got %s, want %s\n' "$1" "$2" "$3"
    fail=$((fail + 1))
  fi
}
status() { curl -sS -o /dev/null -w '%{http_code}' "${AUTH_ARGS[@]}" "$@"; }

echo "smoke: $BASE"

echo "- lifecycle"
marker="smoke-$(date +%s)-$RANDOM"
resp=$(curl -sS "${AUTH_ARGS[@]}" -Fc="$marker" "$BASE")
url=$(printf '%s' "$resp" | sed -n 's/.*"url": *"\([^"]*\)".*/\1/p')
manage=$(printf '%s' "$resp" | sed -n 's/.*"manageUrl": *"\([^"]*\)".*/\1/p')
if [[ -z "$url" ]]; then
  if [[ "$resp" == *"basic auth is required"* || "$resp" == *"incorrect passwd"* ]]; then
    echo "  FAIL  upload rejected: this deployment gates POST behind basic auth." >&2
    echo "        Re-run with credentials:  $0 $BASE user:password" >&2
  else
    echo "  FAIL  upload returned no url; response was:" >&2
    printf '%s\n' "$resp" >&2
  fi
  exit 1
fi
name="${url##*/}"
check "upload returns url" "$([[ -n $url ]] && echo yes)" "yes"
check "upload returns manageUrl" "$([[ -n $manage ]] && echo yes)" "yes"
check "content round-trips" "$(curl -sS "$url")" "$marker"
check "metadata (role m)" "$(status "$BASE/m/$name")" "200"
check "display page (role d)" "$(status "$BASE/d/$name")" "200"

echo "- headless guards (expect 403 when HEADLESS_MODE=true)"
check "url redirect (role u) blocked" "$(status "$BASE/u/$name")" "403"
check "article render (role a) blocked" "$(status "$BASE/a/$name")" "403"

echo "- landing page"
ua='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'
landing=$(curl -sS -H "User-Agent: $ua" "${AUTH_ARGS[@]}" "$BASE/" | tr -d '\0')
check "browser gets headless landing" "$(grep -c 'API-only mode' <<<"$landing")" "1"
check "no React bundle served" "$(grep -c 'assets/index-' <<<"$landing")" "0"

echo "- docs"
for d in doc/api doc/tos doc/curl.md; do
  check "/$d" "$(status "$BASE/$d")" "200"
done

echo "- cleanup"
check "delete paste" "$(status -X DELETE "$manage")" "200"
check "gone after delete" "$(status "$url")" "404"

echo
echo "passed $pass, failed $fail"
[[ $fail -eq 0 ]]
