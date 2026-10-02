use anchor_lang::prelude::*;
use anchor_spl::token::Mint; // 💎 Injetado para dar suporte nativo à validação de Mints Web3 de Euros/Yuans

// ID único do teu programa na Solana (Mantido perfeitamente intacto)
declare_id!("2tXffr4AroSCrUyrkfb35PtFMkj1Zy3LtBszt19gZCbT");

#[program]
pub mod hubkon_solana_contracts {
    use super::*;

    /**
     * @notice Passo 1: Inicializa o Fiel Depósito (Escrow) e valida a Mint da Divisa (USD/EUR/CNH)
     * @dev Acionado pelo teu Express passando a Mint correspondente mapeada no web3Mints.js [GSO/SRO]
     */
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>, 
        amount_tokens: u64, 
        fee_percentage: u16
    ) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        escrow_account.buyer = *ctx.accounts.buyer.key;
        escrow_account.vendor = *ctx.accounts.vendor.key;
        escrow_account.amount = amount_tokens;
        escrow_account.fee_percentage = fee_percentage;
        
        // 👑 ATUALIZAÇÃO REVOLUCIONÁRIA (SRO): Grava o ID criptográfico da divisa no Ledger on-chain
        escrow_account.currency_mint = ctx.accounts.currency_mint.key(); 
        
        escrow_account.is_anticipated = false;
        escrow_account.is_settled = false;
        
        msg!("🛡️ [SRO MULTIMOEDA] Escrow gerado para a Mint: {}. Montante: {}", ctx.accounts.currency_mint.key(), amount_tokens);
        Ok(())
    }

    /**
     * @notice Passo 2: O "Botão de Envio" clicado pelo cliente angolano
     * @dev Liberta o montante guardado diretamente para o fornecedor estrangeiro
     */
    pub fn release_to_vendor(ctx: Context<ReleaseEscrow>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        
        require!(!escrow_account.is_settled, HubkonError::AlreadySettled);
        require!(!escrow_account.is_anticipated, HubkonError::AlreadyAnticipated);

        escrow_account.is_settled = true;
        msg!("🖲️ [HUBKON ENGINE] Entrega confirmada! Liquidez libertada para o fornecedor.");
        Ok(())
    }

    /**
     * @notice O teu Motor de Antecipação de Liquidez (Factoring B2B)
     * @dev O fornecedor pede o adiantamento, a HUBKON paga aplicando a taxa de desconto
     */
    pub fn anticipate_liquidity(ctx: Context<AnticipateLiquidity>, discount_fee: u64) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;

        require!(!escrow_account.is_settled, HubkonError::AlreadySettled);
        require!(!escrow_account.is_anticipated, HubkonError::AlreadyAnticipated);

        escrow_account.is_anticipated = true;
        escrow_account.is_settled = true;

        msg!("💎 [FACTORING] Antecipação aprovada! Desconto de {} tokens retido como lucro HUBKON.", discount_fee);
        Ok(())
    }

    /**
     * @notice SEMANA 10: OTIMIZAÇÃO DE RENT (FECHO DE COFRE)
     */
    pub fn close_escrow_account(ctx: Context<CloseEscrowAccount>) -> Result<()> {
        let escrow_account = &ctx.accounts.escrow_account;
        require!(escrow_account.is_settled, HubkonError::CofreAindaTrancado);
        msg!("🏆 [RENT OPTIMIZATION] Conta destruída! Lamports drenados para o Tesouro HUBKON.");
        Ok(())
    }
}
// 📐 Estrutura de dados que o teu cofre digital (PDA) vai gravar na blockchain
#[account]
pub struct EscrowAccount {
    pub buyer: Pubkey,          // Cliente angolano (32 bytes)
    pub vendor: Pubkey,         // Fornecedor internacional (32 bytes)
    pub currency_mint: Pubkey,  // 👑 NOVO CAMPO MULTIMOEDA (SRO): Regista a Mint SPL (USD/EUR/CNH) (32 bytes)
    pub amount: u64,            // Valor total em tokens da divisa correspondente (8 bytes)
    pub fee_percentage: u16,    // Taxa padrão de factoring configurada (2 bytes)
    pub is_anticipated: bool,   // Estado: Fornecedor pediu adiantamento? (1 byte)
    pub is_settled: bool,       // Estado: Finalizado/Liquidado? (1 byte)
}

// Contextos de Contas para validação estrita do Anchor (Segurança do SRO)
#[derive(Accounts)]
pub struct InitializeEscrow<'info> {
    // 👑 RECALIBRAÇÃO DE ESPAÇO ATÓMICA: Adicionado +32 bytes para o campo currency_mint
    #[account(init, payer = buyer, space = 8 + 32 + 32 + 32 + 8 + 2 + 1 + 1)]
    pub escrow_account: Account<'info, EscrowAccount>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// CHECK: Conta de destino segura do fornecedor
    pub vendor: AccountInfo<'info>,

    // 👑 VALIDAÇÃO CRYPTO (SRO): Obriga a passagem do identificador do token da moeda correspondente
    pub currency_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowAccount>,
    pub buyer: Signer<'info>,
}
#[derive(Accounts)]
pub struct AnticipateLiquidity<'info> {
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowAccount>,
    pub master_engine: Signer<'info>, // Apenas a tua chave privada HUBKON pode autorizar o adiantamento
}

// 🎚️ CONTEXTO DE CONTAS DA SEMANA 10 RECALIBRADO PARA PROJETOS MULTI-TOKEN [GSO/SRO]
#[derive(Accounts)]
pub struct CloseEscrowAccount<'info> {
    // 🛡️ O atributo close zera os dados da conta e drena os Lamports para a carteira definida [GSO/SRO]
    #[account(
        mut,
        close = hubkon_treasury
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    // A tua chave privada master do Express que assina a ordem de desalocação da rede
    pub master_engine: Signer<'info>,

    // 💰 A conta mestre da HUBKON que recebe o lucro limpo do resgate de Rent Exemption [GSO/SRO]
    #[account(mut)]
    pub hubkon_treasury: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

// Códigos de Erros customizados para proteção forense contra duplos levantamentos e invasões [GSO/SRO]
#[error_code]
pub mod HubkonError {
    #[msg("🚨 Transação já liquidada na infraestrutura.")]
    AlreadySettled,
    #[msg("🚨 Esta liquidez já foi antecipada pelo fornecedor.")]
    AlreadyAnticipated,
    #[msg("🚨 [SRO REJECTION] Operação abortada: O cofre ainda possui fundos ativos on-chain.")]
    CofreAindaTrancado,
}
