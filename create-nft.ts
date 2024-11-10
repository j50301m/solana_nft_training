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
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
    keypairIdentity,
    generateSigner,
    percentAmount,
    publicKey,
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

const collectionAddress = publicKey("9UQj4DLXkrBAtsnWXeR2SFGuCypDPk5EHG8Vfr8ivuPN");

console.log(`Creating NFT...`)

const mint = generateSigner(umi);
const transaction = await createNft(umi, {
    mint:mint,
    name: "A cat named Oru",
    uri: "https://raw.githubusercontent.com/j50301m/solana_nft_training/refs/heads/main/nft-info.json",
    sellerFeeBasisPoints:percentAmount(0),
    collection: {
        key: collectionAddress,
        verified: false,
    },
});

await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log(
    `Created NFT Address: ${getExplorerLink(
        "address",
        createdNft.mint.publicKey,
        "devnet"
    )}`
);



