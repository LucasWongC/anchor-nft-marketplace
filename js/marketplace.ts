import * as anchor from '@project-serum/anchor'
import { Marketplace as MarketplaceDefinition } from './types/marketplace'
import { MARKETPLACE_PROGRAM_ID } from './constant'
import * as idl from './types/marketplace.json'

import { Keypair, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getCollectionPDA, getMarketplacePDA, getEscrowPDA } from './getPDAs'

export class Marketplace {
    program: anchor.Program<MarketplaceDefinition>
    marketplacePDA: PublicKey
    marketplace: Marketplace

    constructor(provider: anchor.Provider, marketplacePDA?: PublicKey) {
        console.log(MARKETPLACE_PROGRAM_ID.toBase58())
        // @ts-ignore
        this.program = new anchor.Program(idl, MARKETPLACE_PROGRAM_ID, provider,)
        this.marketplacePDA = marketplacePDA
    }

    async createMarketplace(
        owner: Keypair,
        mint: PublicKey,
        fees: number,
        feesDestination: PublicKey,
    ): Promise<string> {
        let marketplacePDA = await getMarketplacePDA(owner.publicKey)
        this.marketplacePDA = marketplacePDA
        const mPDAAccount = await this.program.provider.connection.getAccountInfo(marketplacePDA);
        if (mPDAAccount != null) {
            console.log("Already created")
            return;
        }

        let escrowPDA = await getEscrowPDA(marketplacePDA, mint)
        const ePDAAccount = await this.program.provider.connection.getAccountInfo(escrowPDA);
        if (ePDAAccount != null) {
            console.log("Already created")
            return;
        }
        return await this.program.methods.createMarketplace(mint, fees, feesDestination, owner.publicKey).accounts(
            {
                payer: owner.publicKey,
                marketplace: marketplacePDA,
                mint: mint,
                escrow: escrowPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }
        ).signers([owner]).rpc()
    }

    async createCollection(
        authority: Keypair,
        name: string,
        required_metadata_signer: PublicKey,
        collection_symbol: string,
        ignore_creators: boolean,
        fee?: number,
    ): Promise<string> {
        let collectionPDA = await getCollectionPDA(this.marketplacePDA, collection_symbol)
        const cPDAAccount = await this.program.provider.connection.getAccountInfo(collectionPDA);
        if (cPDAAccount != null) {
            console.log("Already created collection")
            return;
        }
        if (!fee) {
            fee = null
        }

        return await this.program.methods.createCollection(collection_symbol, required_metadata_signer, fee, ignore_creators).accounts(
            {
                authority: authority.publicKey,
                marketplace: this.marketplacePDA,
                collection: collectionPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).signers([authority]).rpc()
    }
}
