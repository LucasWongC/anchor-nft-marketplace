import * as anchor from '@project-serum/anchor'
import { MARKETPLACE_PROGRAM_ID } from './constant'
import { PublicKey } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'


export const getMarketplacePDA = async (owner: PublicKey): Promise<PublicKey> => {
    return (await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from('MARKETPLACE'),
            owner.toBuffer()
        ],
        MARKETPLACE_PROGRAM_ID,
    ))[0]
}

export const getEscrowPDA = async (marketplacePDA: PublicKey, marketplaceMint: PublicKey): Promise<PublicKey> => {
    return (await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from('MARKETPLACE'),
            marketplacePDA.toBuffer(),
            marketplaceMint.toBuffer(),
            Buffer.from('ESCROW'),
        ],
        MARKETPLACE_PROGRAM_ID,
    ))[0]
}

export const getCollectionPDA = async (marketplacePDA: PublicKey, symbol: string): Promise<PublicKey> => {
    return (await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from('MARKETPLACE'),
            Buffer.from(symbol),
            marketplacePDA.toBuffer(),
        ],
        MARKETPLACE_PROGRAM_ID,
    ))[0]
}

export const getNftVaultPDA = async (nftMint: PublicKey): Promise<PublicKey> => {
    return (await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('MARKETPLACE'), Buffer.from('vault'), nftMint.toBuffer()],
        MARKETPLACE_PROGRAM_ID,
    ))[0]
}

export const getSellOrderPDA = async (sellerTokenAccount: PublicKey, price: anchor.BN): Promise<PublicKey> => {
    return (await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from('MARKETPLACE'),
            sellerTokenAccount.toBuffer(),
            Buffer.from(price.toString())
        ],
        MARKETPLACE_PROGRAM_ID,
    ))[0]
}

export const getAssociatedTokenAddress = async (addr: PublicKey, mint: PublicKey): Promise<PublicKey> => {
    return await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        addr,
        false,
    )
}