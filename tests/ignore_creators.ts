import * as anchor from '@project-serum/anchor';
import { web3 } from '@project-serum/anchor';
import { PublicKey } from "@solana/web3.js";
import * as splToken from '@solana/spl-token';
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import assert from "assert";
import { nft_data, nft_json_url } from "./data";
import { createMint } from "./utils/utils";
import { Marketplace } from '../js/marketplace';
import { Collection } from "../js/collection";
import { getCollectionPDA, getSellOrderPDA } from "../js/getPDAs";

let provider = anchor.Provider.env()
anchor.setProvider(provider);

web3.LAMPORTS_PER_SOL
describe('ignore creators tests', () => {
    let creator: web3.Keypair;
    let creatorTokenAccount: web3.PublicKey;
    let seller: web3.Keypair;
    let sellerTokenAccount: web3.PublicKey;
    let marketplaceMint: splToken.Token;
    let nftMint: splToken.Token;
    let metadataPDA: web3.PublicKey;
    let sellerNftAssociatedTokenAccount: web3.PublicKey;

    let marketplace: Marketplace;
    let collection: Collection;


    it('Prepare tests variables', async () => {
        const key1 = new Uint8Array([218, 240, 112, 171, 149, 113, 51, 231, 110, 255, 95, 30, 191, 107, 242, 54, 184, 45, 161, 197, 197, 85, 90, 152, 246, 1, 182, 32, 140, 81, 192, 248, 134, 244, 250, 133, 142, 147, 155, 189, 241, 122, 152, 235, 22, 214, 74, 17, 76, 177, 84, 87, 22, 76, 44, 63, 106, 227, 5, 216, 230, 33, 184, 160]);
        creator = anchor.web3.Keypair.fromSecretKey(key1);
        // creator = anchor.web3.Keypair.generate()
        // let fromAirdropSignature = await provider.connection.requestAirdrop(
        //     creator.publicKey,
        //     anchor.web3.LAMPORTS_PER_SOL,
        // );
        // await provider.connection.confirmTransaction(fromAirdropSignature);

        // seller = anchor.web3.Keypair.generate()
        const key2 = new Uint8Array([228, 96, 81, 192, 83, 233, 241, 76, 237, 254, 237, 7, 219, 66, 39, 54, 109, 135, 238, 49, 9, 200, 77, 112, 206, 134, 246, 130, 67, 33, 80, 195, 228, 5, 202, 155, 73, 215, 83, 214, 94, 226, 54, 245, 142, 46, 236, 9, 198, 16, 4, 57, 14, 206, 79, 142, 64, 119, 197, 237, 131, 120, 231, 135]);
        seller = anchor.web3.Keypair.fromSecretKey(key2);

        // fromAirdropSignature = await provider.connection.requestAirdrop(
        //     seller.publicKey,
        //     anchor.web3.LAMPORTS_PER_SOL,
        // );
        // await provider.connection.confirmTransaction(fromAirdropSignature);

        let t_pubkey = new anchor.web3.PublicKey("5MYGMMafYr7G3HymNbaFQnHCdPxgWqAZqHZQP1NiDEJa");

        marketplaceMint = new splToken.Token(
            provider.connection,
            t_pubkey,
            splToken.TOKEN_PROGRAM_ID,
            creator
        );

        const associatedTokanAccount = await Token.getAssociatedTokenAddress(splToken.ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, marketplaceMint.publicKey, creator.publicKey);
        const creatorAccountInfo = await provider.connection.getAccountInfo(associatedTokanAccount)
        if (creatorAccountInfo === null) {
            creatorTokenAccount = await marketplaceMint.createAssociatedTokenAccount(
                creator.publicKey,
            );
        } else {
            creatorTokenAccount = associatedTokanAccount;
        }

        sellerTokenAccount = await Token.getAssociatedTokenAddress(splToken.ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, marketplaceMint.publicKey, seller.publicKey);
        const sellerAccountInfo = await provider.connection.getAccountInfo(sellerTokenAccount)
        if (sellerAccountInfo === null) {
            await marketplaceMint.createAssociatedTokenAccount(
                seller.publicKey,
            );
        }

        const data = nft_data(creator.publicKey);
        const json_url = nft_json_url;
        const lamports = await Token.getMinBalanceRentForExemptMint(
            provider.connection
        );

        const [mint, metadataAddr, tx] = await createMint(
            creator.publicKey,
            seller.publicKey,
            lamports,
            data,
            json_url
        );

        const signers = [mint, creator];
        await provider.send(tx, signers);

        metadataPDA = metadataAddr
        nftMint = new Token(provider.connection, mint.publicKey, TOKEN_PROGRAM_ID, seller)

        sellerNftAssociatedTokenAccount = (await nftMint.getOrCreateAssociatedAccountInfo(seller.publicKey)).address

        marketplace = new Marketplace(provider)
        await marketplace.createMarketplace(seller, marketplaceMint.publicKey, 5, sellerTokenAccount)

        await marketplace.createCollection(seller, "AURY", creator.publicKey, "AURY", true)

        let collectionPDA = await getCollectionPDA(marketplace.marketplacePDA, "AURY")
        collection = new Collection(provider, marketplace.marketplacePDA, collectionPDA)
    });

    it('sell order ignore creators', async function () {
        const sellAssetTx = await collection.sellAsset(
            nftMint.publicKey,
            sellerNftAssociatedTokenAccount,
            sellerTokenAccount,
            new anchor.BN(2000),
            new anchor.BN(2),
            seller
        )
        console.log(sellAssetTx);

        // let buyer = anchor.web3.Keypair.generate()
        // let fromAirdropSignature = await provider.connection.requestAirdrop(
        //     buyer.publicKey,
        //     anchor.web3.LAMPORTS_PER_SOL,
        // );
        // await provider.connection.confirmTransaction(fromAirdropSignature);

        const key3 = new Uint8Array([222, 69, 143, 147, 205, 198, 36, 153, 236, 0, 28, 187, 64, 186, 228, 5, 81, 132, 101, 163, 156, 82, 229, 90, 110, 114, 197, 43, 180, 12, 166, 60, 129, 129, 90, 166, 171, 171, 157, 157, 181, 187, 241, 219, 237, 249, 53, 211, 123, 133, 137, 91, 234, 31, 167, 39, 165, 59, 199, 203, 206, 80, 212, 11]);
        let buyer = anchor.web3.Keypair.fromSecretKey(key3);

        let buyerTokenATA = await Token.getAssociatedTokenAddress(splToken.ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, marketplaceMint.publicKey, buyer.publicKey)
        const buyerTokenInfo = await provider.connection.getAccountInfo(buyerTokenATA);
        if (buyerTokenInfo === null) {
            const mm = await marketplaceMint.createAssociatedTokenAccount(buyer.publicKey)
            console.log("MM: ", mm.toBase58())
        }

        // console.log("buyerTokenInfo: ", buyerTokenInfo)
        // let buyerTokenATA = await marketplaceMint.createAssociatedTokenAccount(buyer.publicKey)

        // await marketplaceMint.mintTo(buyerTokenATA, creator.publicKey, [], 4000)

        // let buyerNftATA = (await nftMint.getOrCreateAssociatedAccountInfo(buyer.publicKey)).address

        let buyerNftATA = await nftMint.createAssociatedTokenAccount(buyer.publicKey)
        // let aaa = await Token.getAssociatedTokenAddress(splToken.ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, nftMint.publicKey, buyer.publicKey);

        // console.log("buyerNftATA: ", buyerNftATA);
        // console.log("aaa: ", aaa);


        // console.log(nftMint.publicKey.toBase58(), 999);
        // console.log("buyerNftATA, ", buyerNftATA.toBase58());
        // console.log("buyerTokenATA, ", buyerTokenATA.toBase58());

        //     nftMint.publicKey,
        //     sellerNftAssociatedTokenAccount,
        //     sellerTokenAccount,
        //     new anchor.BN(2000),
        //     new anchor.BN(2),
        //     seller

        await collection.buy(
            nftMint.publicKey,
            [
                await getSellOrderPDA(sellerNftAssociatedTokenAccount, new anchor.BN(2000)),
            ],
            buyerNftATA,
            buyerTokenATA,
            new anchor.BN(2),
            buyer,
        )

        let buyerNftAccountAfterSell = await nftMint.getAccountInfo(buyerNftATA)
        assert.equal(buyerNftAccountAfterSell.amount.toNumber(), 2)
    });
});
