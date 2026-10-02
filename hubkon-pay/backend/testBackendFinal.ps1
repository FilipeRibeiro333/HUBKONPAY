# ==============================
# Teste final do backend HUBKON
# ==============================

$baseUrl = "http://localhost:5000"
$headers = @{ "x-api-key" = "umaChaveSegura123" }

try {
    Write-Host "1️⃣ Obtendo JWT de teste (rota DEV)..."
    $jwtResponse = Invoke-RestMethod -Uri "$baseUrl/generate-test-jwt" -Method Get
    $token = $jwtResponse.token
    Write-Host "✅ JWT obtido:" $token

    # Atualiza headers para rota protegida
    $headers["authorization"] = "Bearer $token"

    Write-Host "2️⃣ Chamando rota protegida /protected..."
    $response = Invoke-RestMethod -Uri "$baseUrl/protected" -Method Get -Headers $headers
    Write-Host "✅ Resposta do backend:" $response.message
    Write-Host "📦 Payload do JWT:" ($response.user | ConvertTo-Json)
}
catch {
    if ($_.Exception.Response) {
        $status = $_.Exception.Response.StatusCode.value__
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "❌ Erro HTTP:" $status
        Write-Host "Body:" $body
    } else {
        Write-Host "❌ Erro:" $_.Exception.Message
    }
}

Write-Host "==== RESUMO FINAL ===="
Write-Host "Backend funcional, teste concluído!"
Write-Host "====================="
