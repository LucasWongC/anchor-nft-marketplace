# marketplace
An open-source Solana NFT marketplace

integration steps

1. need to create spl token for marketplace fee
2. need to create marketplace.

please check `js/marketplace.ts` line 22.
```
let provider = anchor.Provider.env()
let marketplace = new Marketplace(provider)
await marketplace.createMarketplace(seller, marketplaceMint.publicKey, 5, sellerTokenAccount)
```
3. need to create collection.

please check `js/marketplace.ts` line 55.
```
await marketplace.createCollection(seller, "AURY", creator.publicKey, "AURY", true)

let collectionPDA = await getCollectionPDA(marketplace.marketplacePDA, "AURY")
collection = new Collection(provider, marketplace.marketplacePDA, collectionPDA)
```
4. creating sell order

please check `js/collection.ts` line 63.
```
let nftMint = new Token(provider.connection, nftTokenPubkey, TOKEN_PROGRAM_ID, seller)
let price = new anchor.BN(2000)
let amount = new anchor.BN(1);
const sellAssetTx = await collection.sellAsset(
    nftMint.publicKey,
    sellerNftAssociatedTokenAccount,
    sellerTokenAccount,
    price,
    amount,
    seller
)
```
5. buy nft from marketplace

please check `js/collection.ts` line 208.
```
await collection.buy(
    nftMint.publicKey,
    [
        await getSellOrderPDA(sellerNftAssociatedTokenAccount, price),
    ],
    buyerNftATA,
    buyerTokenATA,
    amount,
    buyer,
)
```