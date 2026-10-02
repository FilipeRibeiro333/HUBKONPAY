// checkStatus.js
const { exec } = require('child_process');

console.log('🔎 Verificando status do projeto...');

exec('npm test -- --json', (err, stdout, stderr) => {
  if (err) {
    console.error('❌ Erro ao rodar os testes:', err);
    return;
  }

  try {
    // Pega apenas a última linha que começa com { -> JSON do Jest
    const lines = stdout.trim().split('\n').reverse();
    const jsonLine = lines.find(line => line.trim().startsWith('{'));
    if (!jsonLine) throw new Error('JSON do Jest não encontrado.');

    const results = JSON.parse(jsonLine);

    console.log('✅ Testes processados com sucesso:', results.numPassedTests, 'passaram');
    console.log('⚠️ Testes falharam:', results.numFailedTests);
    console.log('📦 Total de suites testadas:', results.numTotalTestSuites);
    console.log('------------------------------');

    // Mapear resultados por arquivo/test suite
    results.testResults.forEach(suite => {
      const suiteName = suite.name.split('\\').pop(); // pega só o nome do arquivo
      const status = suite.status === 'passed' ? '✅' : '❌';
      console.log(`${status} ${suiteName} - ${suite.status}`);
    });

    console.log('------------------------------');
    console.log('💡 Próximo passo sugerido: Continue com o próximo bloco do fluxo do projeto.');
  } catch (e) {
    console.error('❌ Erro ao processar saída dos testes:', e);
  }
});
