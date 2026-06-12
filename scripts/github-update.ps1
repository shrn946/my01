param(
  [Parameter(Position = 0)]
  [string]$Message = "Update website"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git is not installed or is not available in PATH."
}

$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
  throw "Run this command inside the Git repository."
}

Set-Location $repoRoot

$branch = git branch --show-current
if (-not $branch) {
  throw "Git is not currently on a branch."
}

$remote = git remote get-url origin 2>$null
if (-not $remote) {
  throw "The Git remote named 'origin' is not configured."
}

# Ignored untracked files are skipped automatically.
git add --all

if ($LASTEXITCODE -ne 0) {
  throw "Git could not stage the project files."
}

# Keep known local or unintended tracked changes out of automated updates.
$protectedPaths = @(
  "prisma.config.ts"
)

foreach ($protectedPath in $protectedPaths) {
  git restore --staged -- $protectedPath 2>$null
}

if ($LASTEXITCODE -ne 0) {
  $global:LASTEXITCODE = 0
}

$blockedFiles = git diff --cached --name-only | Where-Object {
  ($_ -match '(^|/)\.env($|\.)' -and $_ -notmatch '(^|/)\.env\.example$') -or
  $_ -match '\.(pem|key|p12|pfx)$' -or
  $_ -match 'service[-_]?account.*\.json$'
}

if ($blockedFiles) {
  git reset -- $blockedFiles | Out-Null
  throw "Secret-like files were blocked from the commit: $($blockedFiles -join ', ')"
}

$stagedFiles = git diff --cached --name-status
if (-not $stagedFiles) {
  Write-Host "No project changes to upload."
  exit 0
}

Write-Host "Files to upload:"
$stagedFiles | ForEach-Object { Write-Host "  $_" }

git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  throw "Git commit failed."
}

git push origin $branch
if ($LASTEXITCODE -ne 0) {
  throw "Git push failed. The commit remains saved locally."
}

Write-Host "GitHub updated: $remote ($branch)"
