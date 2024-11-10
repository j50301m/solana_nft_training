import {
    createNft,
    fetchDigitalAsset,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    keypairIdentity,
    generateSigner,
    percentAmount,
} from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));
const user = await getKeypairFromFile();

await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL
);

console.log("Loading user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

// Create a umi keypair from the secret key
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));
console.log("Set up umi instance for user: ", umiUser.publicKey.toString());

const collectionMint = generateSigner(umi);
const transaction = await createNft(umi, {
    mint: collectionMint,
    name: "My NFT Collection",
    symbol: "MC",
    uri: "https://...",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
});
await transaction.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(
    umi,
    collectionMint.publicKey
);

console.log(
    `Created Collection Address:: ${getExplorerLink(
        "address",
        createdCollectionNft.mint.publicKey,
        "devnet"
    )} `
);
