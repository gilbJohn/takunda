# Connect this project to the takunda GitHub repository
# Run this from the project root: .\setup-git.ps1
# Safe to run in both fresh projects and cloned repositories

$repoUrl = "https://github.com/gilbJohn/takunda.git"

# Initialize git only if not already a repository
if (-not (Test-Path .git)) {
  Write-Host "Initializing git repository..." -ForegroundColor Cyan
  git init
} else {
  Write-Host "Git repository already initialized." -ForegroundColor Gray
}

# Add or update origin remote
$origin = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Adding takunda remote..." -ForegroundColor Cyan
  git remote add origin $repoUrl
} else {
  Write-Host "Remote origin already exists. Updating URL..." -ForegroundColor Cyan
  git remote set-url origin $repoUrl
}

# Only stage and commit if there are uncommitted changes
$status = git status --porcelain
if ($status) {
  Write-Host "Staging all files..." -ForegroundColor Cyan
  git add .
  Write-Host "Creating commit..." -ForegroundColor Cyan
  git commit -m "Initial commit: Next.js setup"
} else {
  Write-Host "Working tree clean. Nothing to commit." -ForegroundColor Gray
}

Write-Host "Setting main branch..." -ForegroundColor Cyan
git branch -M main

Write-Host "`nDone! To push to GitHub, run:" -ForegroundColor Green
Write-Host "  git push -u origin main" -ForegroundColor Yellow
Write-Host "`n(You may need to authenticate with GitHub)" -ForegroundColor Gray
