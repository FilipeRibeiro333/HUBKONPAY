---------
    // 5️⃣ Aprovações Buyer + Seller (CORRIGIDO)
    // -----------------------------
    // Importante: passa o objeto de usuário que o teu service espera
    await approveEscrow(escrow._id, { companyId: companyA._id, role: 'buyer' });
    let finalEscrow = await approveEscrow(escrow._id, { companyId: companyB._id, role: 'seller' });
    
    console.log("✅ Aprovações concluídas:", finalEscrow.approvals);

    // -----------------------------
    // 6️⃣ LIBERAR ESCROW (O que faltava para o lucro subir!)
    // -----------------------------
    // Aqui é onde a taxa de 2% é cobrada e o vendedor recebe
    const releaseResult = await releaseEscrow(escrow._id, { companyId: companyA._id });
    console.log(`🎉 Escrow Liberado! Taxa: ${releaseResult.fee} | Recebido: ${releaseResult.finalAmount}`);

    // -----------------------------
    // 7️⃣ RESGATAR STAKING (Para o saldo da Wallet A SUBIR)
    // -----------------------------
    // Simula a passagem de tempo ou força o resgate do lucro
    const rewardData = await claimReward(companyA._id); 
    console.log(`💰 Staking Resgatado! Lucro: ${rewardData.rewards}`);

    // -----------------------------
    // 8️⃣ Checar saldos finais (AGORA VAI SUBIR!)
    // -----------------------------
    const finalWalletA = await Wallet.findById(walletA._id);
    const finalWalletB = await Wallet.findById(walletB._id);
    const finalPlatform = await Wallet.findById(platformWallet._id);

    console.log("\n📊 RESULTADOS REAIS (NÍVEL FORD RAPTOR):");
    console.log(`Wallet A (Buyer): ${finalWalletA.balance} (Recuperou capital + lucro staking)`);
    console.log(`Wallet B (Seller): ${finalWalletB.balance} (Recebeu valor líquido do escrow)`);
    console.log(`🏦 PLATFORM PROFIT: ${finalPlatform.balance} (O TEU LUCRO REAL)`);