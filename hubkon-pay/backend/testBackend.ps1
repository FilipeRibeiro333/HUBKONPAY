# ===============================================
# testBackendFinal.ps1 - HUBKON Backend Teste Ajustável
# ===============================================

# ---------------------------
# Configurações
# ---------------------------
$serverHost = "127.0.0.1"
$port = 5000
$baseUrl = "http://$($serverHost):$($port)"
$apiKey = "devkey"  # Substitua pelo valor correto

# Ajuste aqui os campos que seu backend espera:
$loginData = @{
    # Substitua 'username' e 'password' pelos campos corretos
    username = "teste"
    password = "123456"
} | ConvertTo-Json

$registerData = @{
    # Substitua pelos campos corretos para registro
    username = "novoTeste"
    password = "123456"
} | ConvertTo-Json

$totalTests = 0
$passedTests = 0
$failedTests = 0

# ---------------------------
# Função de cores
# ---------------------------
function Write-Color([string]$text, [ConsoleColor]$color) {
    $orig = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $color
    Write-Host $text
    $Host.UI.RawUI.ForegroundColor = $orig
}

# ---------------------------
# Espera backend subir
# ---------------------------
Write-Host "Aguardando backend subir..."

$maxRetries = 15
$up = $false
for ($i=0; $i -lt $maxRetries; $i++) {
    $check = Test-NetConnection -ComputerName $serverHost -Port $port
    if ($check.TcpTestSucceeded) { 
        $up = $true
        break
    }
    Start-Sleep -Seconds 1
}

if (-not $up) { 
    Write-Color "❌ Backend não respondeu. Certifique-se de rodar 'npm run dev'" Red
    exit
}
Write-Color "✅ Backend ativo na porta $port!" Green

# ---------------------------
# Funções de teste GET/POST
# ---------------------------
function Test-GET {
    param($url, $headers)
    $global:totalTests++
    try {
        $resp = Invoke-RestMethod -Uri $url -Headers $headers -TimeoutSec 5
        Write-Color "✅ SUCESSO GET $url" Green
        Write-Host $resp
        $global:passedTests++
    } catch {
        Write-Color "❌ ERRO GET $url" Red
        Write-Host $_.Exception.Message
        $global:failedTests++
    }
}

function Test-POST {
    param($url, $body, $headers)
    $global:totalTests++
    try {
        $resp = Invoke-RestMethod -Uri $url -Method POST -Body $body -Headers $headers -ContentType "application/json" -TimeoutSec 5
        Write-Color "✅ SUCESSO POST $url" Green
        Write-Host $resp
        $global:passedTests++
        return $resp
    } catch {
        Write-Color "❌ ERRO POST $url" Red
        Write-Host $_.Exception.Message
        $global:failedTests++
        return $null
    }
}

# ---------------------------
# 1️⃣ Teste Login
# ---------------------------
$loginResp = Test-POST "$($baseUrl)/auth/login" $loginData @{ "x-api-key"=$apiKey }

$jwtToken = $null
if ($loginResp -and $loginResp.token) {
    $jwtToken = $loginResp.token
    Write-Color "✅ JWT obtido com sucesso!" Green
} else {
    Write-Color "⚠️ Não foi possível obter JWT. Rotas protegidas não serão testadas." Yellow
}

# ---------------------------
# 2️⃣ Testes GET
# ---------------------------
# GET público (/health)
Test-GET "$($baseUrl)/health" @{ "x-api-key"=$apiKey }

# GET protegido (/protected)
$headersProtected = @{}
if ($jwtToken) { $headersProtected["Authorization"] = "Bearer $($jwtToken)" }
Test-GET "$($baseUrl)/protected" $headersProtected

# ---------------------------
# 3️⃣ Teste POST /auth/register
# ---------------------------
Test-POST "$($baseUrl)/auth/register" $registerData @{ "x-api-key"=$apiKey }

# ---------------------------
# 4️⃣ Resumo final
# ---------------------------
Write-Host "`n==== RESUMO FINAL ===="
Write-Host "Total de testes: $totalTests"
Write-Color "Passaram: $passedTests" Green
Write-Color "Falharam: $failedTests" Red
Write-Host "===================="
