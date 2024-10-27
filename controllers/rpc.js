"use strict";
// head over to https://chainlist.org/ to get more evm rpcs
Object.defineProperty(exports, "__esModule", { value: true });
exports.testnetJSONRPC = exports.jsonRPC = void 0;
exports.jsonRPC = {
    ethereum: "https://mainnet.infura.io/v3/2b1c64c1eeb243e185468576d10a32db",
    avalanche: "https://api.avax.network/ext/bc/C/rpc",
    bsc: "https://bsc-dataseed.binance.org/",
    btc: "https://blockstream.info/api/",
    fantom: "https://rpcapi.fantom.network",
    litecoin: "https://explorer.litecoin.net",
    polygon: "https://rpc-mainnet.maticvigil.com",
    solana: "https://api.mainnet-beta.solana.com",
    tron: "https://api.trongrid.io",
    plygonZkEVM: "https://zkevm-rpc.com"
};
exports.testnetJSONRPC = {
    ethereum: "https://ethereum-sepolia.rpc.subquery.network/public	",
    avalanche: "https://avalanche-fuji-c-chain-rpc.publicnode.com	",
    bsc: "wss://bsc-testnet-rpc.publicnode.com",
    solana: "https://api.testnet.solana.com",
    tron: "https://api.trongrid.io",
    polygonZkEVM: "https://rpc.cardona.zkevm-rpc.com"
};
