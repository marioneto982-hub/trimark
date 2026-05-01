# ============================================================
# TRIMARK - Deploy de dominio na Vercel
# ============================================================
# Sequencia completa para conectar trimark.net.br ao deploy
# Vercel + configurar env vars do Supabase.
#
# Como usar:
#   1. Abrir PowerShell
#   2. cd "C:\Users\mario\OneDrive\Desktop\TRIMARK AGENCIA\scripts"
#   3. Liberar execucao nesta sessao:
#        Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   4. Rodar:
#        .\deploy-domain.ps1
# ============================================================

$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Users\mario\OneDrive\Desktop\TRIMARK AGENCIA\trimark"
$ProjectName = "trimark"
$Scope       = "marioneto982-5598s-projects"
$SupabaseUrl = "https://rrprzipocqxwadsiscpz.supabase.co"

function Section($title) {
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host " $title" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan
}

function Pause-And-Continue($msg) {
    Write-Host ""
    Write-Host $msg -ForegroundColor Yellow
    Read-Host "Pressione ENTER para continuar (ou Ctrl+C para abortar)"
}

# ---------- 0) Pre-requisitos ----------
Section "0/7 - Pre-requisitos"

if (-not (Test-Path $ProjectRoot)) {
    Write-Host "ERRO: pasta do projeto nao encontrada: $ProjectRoot" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando Vercel CLI globalmente..."
    npm i -g vercel
} else {
    Write-Host ("Vercel CLI ja instalada: " + (vercel --version))
}

Set-Location $ProjectRoot
Write-Host "Pasta atual: $(Get-Location)"

Section "Login na Vercel"
Write-Host "Vai abrir o navegador. Escolha 'Continue with Google', autorize, e volte."
vercel login

# ---------- 1) Linkar projeto ----------
Section "1/7 - Linkar pasta local ao projeto Vercel 'trimark'"
vercel link --project $ProjectName --scope $Scope --yes

# ---------- 2) Adicionar dominios ----------
Section "2/7 - Adicionar dominios trimark.net.br + www"
Write-Host "ANOTE os registros DNS que a Vercel vai imprimir abaixo." -ForegroundColor Yellow
Write-Host ""
vercel domains add trimark.net.br $ProjectName --scope $Scope
vercel domains add www.trimark.net.br $ProjectName --scope $Scope

$dnsMsg = @"
Va ao painel do Registro.br (Editar Zona DNS) e configure:

  Tipo   Nome   Valor                    TTL
  -----  -----  -----------------------  ----
  A      @      76.76.21.21              3600
  CNAME  www    cname.vercel-dns.com.    3600

Salve no Registro.br antes de continuar.
"@
Pause-And-Continue $dnsMsg

# ---------- 3) Env vars ----------
Section "3/7 - Env vars do Supabase (Production + Preview + Development)"

$Anon = Read-Host "Cole a anon key do Supabase (so fica na memoria desta sessao)"

if ([string]::IsNullOrWhiteSpace($Anon)) {
    Write-Host "ERRO: anon key vazia." -ForegroundColor Red
    exit 1
}

# VITE_SUPABASE_URL
$SupabaseUrl | vercel env add VITE_SUPABASE_URL production
$SupabaseUrl | vercel env add VITE_SUPABASE_URL preview
$SupabaseUrl | vercel env add VITE_SUPABASE_URL development

# VITE_SUPABASE_ANON_KEY
$Anon | vercel env add VITE_SUPABASE_ANON_KEY production
$Anon | vercel env add VITE_SUPABASE_ANON_KEY preview
$Anon | vercel env add VITE_SUPABASE_ANON_KEY development

# limpa da memoria
$Anon = $null
Remove-Variable Anon -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Conferindo env vars:"
vercel env ls

# ---------- 4) Redeploy prod ----------
Section "4/7 - Forcar novo deploy de producao"
Write-Host "Env vars so entram em build novo. Rodando vercel --prod..."
vercel --prod

# ---------- 5) Validar DNS ----------
Section "5/7 - Validar DNS apos propagacao"
Write-Host "Se voce acabou de configurar o DNS, espere de 5 a 30 min antes de seguir."
Pause-And-Continue "ENTER quando estiver pronto para checar."

Write-Host ""
Write-Host ">> nslookup trimark.net.br"
nslookup trimark.net.br
Write-Host ""
Write-Host ">> nslookup www.trimark.net.br"
nslookup www.trimark.net.br
Write-Host ""
Write-Host ">> Status dos dominios na Vercel:"
vercel domains ls --scope $Scope

Write-Host ""
Write-Host "Se algum dominio aparecer como 'Invalid Configuration', rode:" -ForegroundColor Yellow
Write-Host "  vercel domains inspect trimark.net.br --scope $Scope" -ForegroundColor Yellow

# ---------- 6) Supabase Auth (manual) ----------
Section "6/7 - Supabase Auth (passo manual no painel)"
Start-Process "https://supabase.com/dashboard/project/rrprzipocqxwadsiscpz/auth/url-configuration"
Write-Host @"
Configurar no painel que abriu:

  Site URL:
    https://trimark.net.br

  Redirect URLs (Add URL):
    https://trimark.net.br/**
    https://www.trimark.net.br/**
    https://trimark-iota.vercel.app/**
    http://localhost:5173/**

Clique em Save.
"@
Pause-And-Continue "ENTER apos salvar no painel do Supabase."

# ---------- 7) Validacao final ----------
Section "7/7 - Validacao final"
Start-Process "https://trimark.net.br"
Write-Host ""
Write-Host "Abrindo logs do ultimo deploy (Ctrl+C para sair):"
vercel logs --prod

Write-Host ""
Write-Host "=================== TUDO PRONTO ===================" -ForegroundColor Green
Write-Host "Site:    https://trimark.net.br"
Write-Host "Painel:  https://vercel.com/$Scope/$ProjectName"
Write-Host ""
