import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const keypair = Keypair.generate();

console.log("=====================================");
console.log("✅ Solana Wallet Generated");
console.log("-------------------------------------");
console.log("Public Key:", keypair.publicKey.toBase58());
console.log("Private Key (array):", `[${keypair.secretKey.toString()}]`);
console.log("Private Key (base58):", bs58.encode(keypair.secretKey));
console.log("=====================================");

