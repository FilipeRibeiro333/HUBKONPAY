use anchor_lang::prelude::*;

declare_id!("GjKqR2iWys9dR9EwBdFS5QYDFt6NZAbGD65j2JENHTSs");

#[program]
pub mod hubkon_solana_contracts {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
