# Empacota Plantatec em .exe (codigo ofuscado leve)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "==> Preparando pasta pack/"
Remove-Item -Recurse -Force pack, dist_build, build -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path pack | Out-Null
Copy-Item index.html, styles.css pack\
Copy-Item -Recurse -Force fonts, vendor pack\

Write-Host "==> Ofuscando app.js (leve - preserva textos SVG)"
npm install --silent javascript-obfuscator --no-save
npx --yes javascript-obfuscator app.js `
  --output pack/app.js `
  --compact true `
  --control-flow-flattening false `
  --dead-code-injection false `
  --string-array false `
  --self-defending false `
  --rename-globals false `
  --identifier-names-generator hexadecimal

if (-not (Test-Path "pack\app.js")) { throw "Falha ao ofuscar app.js" }

Write-Host "==> Gerando Plantatec.exe"
$packAbs = Join-Path $Root "pack"
py -3 -m PyInstaller `
  --noconfirm `
  --clean `
  --onefile `
  --windowed `
  --name Plantatec `
  --distpath (Join-Path $Root "dist_build") `
  --workpath (Join-Path $Root "build") `
  --specpath (Join-Path $Root "build") `
  --add-data "$packAbs;pack" `
  (Join-Path $Root "launcher.py")

$exe = Join-Path $Root "dist_build\Plantatec.exe"
if (-not (Test-Path $exe)) { throw "Falha: exe nao gerado" }

Write-Host ""
Write-Host "OK: $exe"
Write-Host "Copie so o .exe para outros PCs (Windows 10/11)."
