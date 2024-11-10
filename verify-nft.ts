import {
    createNft,
    fetchDigitalAsset,
    findMetadataPda,
    mplTokenMetadata,
    verifyCollectionV1,
    verifyCreatorV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
} from "@solana/web3.js";
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

const collectionAddress = publicKey(
    "9UQj4DLXkrBAtsnWXeR2SFGuCypDPk5EHG8Vfr8ivuPN"
);
const nftAddress = publicKey("CVD9QtxSFpTpKZAUwB9vN1vUiEQHXdjj5EH1g2yTmy4v");

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity,
});

transaction.sendAndConfirm(umi);

console.log(
    `👌 NFT ,${nftAddress} verified as a member of collection ${collectionAddress}
    See Explorer: ${
        getExplorerLink("address", collectionAddress, "devnet")
    }`
);
