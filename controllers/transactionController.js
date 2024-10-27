import { ethers } from "ethers";
import dotenv from "dotenv";
import jsonRPC from "rpc.js";

dotenv.config();

const PolygonZkevm = "https://rpc.cardona.zkevm-rpc.com"
const apikey = process.env.POLYGONZKEVM_API_KEY;

const convertFromTokenUnits = (amount, decimals) => {
  return ethers.formatUnits(amount, decimals);
};

const convertToTokenUnits = (amount, decimals) => {
  return ethers.parseUnits(amount, decimals);
};

const erc20Abi = [
  // Standard ERC-20 functions
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function _decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function _symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function name() view returns (string)",
];

export const createNewWallet = (req, res) => {
  try {
    // Generate any random wallet
    const createNewWallet = ethers.Wallet.createRandom();
    console.log(createNewWallet);
    // Return wallet address || private key || mnemonic
    res.status(201).json({
      message: "Wallet created successfully",
      address: createNewWallet.address,
      privateKey: createNewWallet.privateKey,
      Mnemonic: createNewWallet.mnemonic,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create wallet" });
  }
};

// Send ERC20 Token
export const sendERC20Token = async (req, res) => {
  try {
    const {
      addressToReceive,
      amountToSend,
      ERC20_CONTRACT_ADDRESS,
      PRIVATE_KEY,
    } = req.body;
    const provider = new ethers.JsonRpcProvider(PolygonZkevm);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    // const contract = new ethers.Contract(ERC20_CONTRACT_ADDRESS, erc20Abi, wallet);

    const tokenContract = new ethers.Contract(
      ERC20_CONTRACT_ADDRESS,
      erc20Abi,
      wallet
    );
    console.log("======Logging Contract=======")
    // console.log(erc20Abi,wallet,ERC20_CONTRACT_ADDRESS)
    

    const tokenDecimals = await tokenContract.decimals();
    const convertedAmount = convertToTokenUnits(amountToSend, tokenDecimals);
    const transfer = await tokenContract.transfer(addressToReceive, convertedAmount);
    console.log("====Initiating Transfer========",transfer.hash)
    res.status(200).json({
      message: `Transfer of ${amountToSend} has been sent successfully to ${addressToReceive}`,
    });
    return transfer.hash;
  } catch (error) {
    res.status(500).json(`Failed to send ERC20 token`);
  }
};

// Send Native Token
// export const sendNativeToken = async (req, res) => {
//   try {
//     const { addressToReceive, amountToSend, privateKey } = req.body;

//     const provider = new ethers.JsonRpcProvider(PolygonZkevm);
//     const wallet = new ethers.Wallet(privateKey, provider);

//     const tx = await wallet.sendTransaction({
//       to: addressToReceive,
//       value: ethers.parseEther(amountToSend.toString()),
//     });
//     res
//       .status(200)
//       .json(
//         `Transfer of ${amountToSend} has been sent successfully to ${addressToReceive}`
//       );
//     return tx.hash;
//   } catch (error) {
//     res.status(500).json(`Failed to send ERC20 token`);
//   }
// };
export const sendNativeToken = async (req, res) => {
  try {
    const { addressToReceive, amountToSend, privateKey } = req.body;

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(PolygonZkevm);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Send native token transaction
    const tx = await wallet.sendTransaction({
      to: addressToReceive,  // Corrected from addressToReceive to 'to'
      value: ethers.parseEther(amountToSend.toString())  // Corrected typo in toString
    });

    // Respond with success and transaction hash
    res.status(200).json({
      message: `Transfer of ${amountToSend} has been sent successfully to ${addressToReceive}`,
      transactionHash: tx.hash
    });
    return tx.hash;
  } catch (error) {
    console.error("Failed to send native token:", error);
    res.status(500).json({ error: `Failed to send native token: ${error.message}` });
  }
};


// Query Native Balance
export const queryNativeBalance = async (req, res) => {
  try {
    const { address } = req.params;

    const provider = new ethers.JsonRpcProvider(PolygonZkevm);

    const balance = await provider.getBalance(address);
    const convertedBalance = Number(ethers.formatEther(balance));
    res.json({ balance: convertedBalance });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: "Failed to query native balance" });
  }
};

// Query ERC20 Balance
export const queryERC20Balance = async (req, res) => {
  try {
    const { address } = req.params;
    const { ERC20_CONTRACT_ADDRESS } = req.params;

    const provider = new ethers.JsonRpcProvider(PolygonZkevm);
    // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const tokenContract = new ethers.Contract(
      ERC20_CONTRACT_ADDRESS,
      erc20Abi,
      provider
    );

    const batchRequest = await Promise.all([
      tokenContract.decimals(),
      tokenContract.balanceOf(address),
      tokenContract.name(),
    ]);

    const decimal = batchRequest[0];
    const amount = batchRequest[1];
    const name = batchRequest[2];
    const convertFromTokenUnit = (amount, decimal) => {
      return ethers.formatUnits(amount, decimal);
    };

    const convertedBalance = convertFromTokenUnit(amount, decimal);
    console.log(convertedBalance);

    res.status(200).json({
      message: "Balanced fetched successfully",
      response: `${convertedBalance} ${name} token.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to query ERC20 balance" });
  }
};

// Fetch Transaction History
import axios from "axios";

export const getTransactionHistory = async (req, res) => {
  try {
    const { address } = req.params;
    const url = `https://api-zkevm.polygonscan.com/api?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${apikey}`;
    const response = await axios.get(url);
    console.log("===== Fetching Transaction History =====", response.data);
    // Check if the API request was successful
    if (response.data.status === "1") {
      const transactionHistory = response.data.result;

      // Handle the case when transaction status is available
      if (transactionHistory.length > 0) {
        return res.status(200).json({
          status: "Success",
          message: "Transaction history found",
          response: transactionHistory,
        });
      } else {
        // Handle case when there are no transactions or status is undefined
        return res.status(404).json({
          status: "Failed",
          message:
            "No transactions found or status might be pending or invalid",
          response: transactionHistory,
        });
      }
    } else {
      // Handle cases where the API status is not '1' (failed request)
      return res.status(400).json({
        status: "Failed",
        message: "Error fetching transaction history",
        response: response.data,
      });
    }
  } catch (error) {
    res.status(500).json(`Something went wrong, unable to fetch balance`);
  }
};

// import fetch from 'node-fetch';
// import axios from 'axios';
// export const fetchTransactionHistory = async (req, res) => {
//     try {
//         const { address } = req.params;
//         const apiKey = process.env.POLYGONSCAN_API_KEY;

//         // Check if API key exists
//         if (!apiKey) {
//             return res.status(500).json({ error: 'API key is missing' });
//         }

//         // Construct the API URL
//         const url = `https://api-testnet.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

//         // Fetch transaction history with timeout (set to 10 seconds)
//         const response = await axios(url, { timeout: 10000 });
//         console.log(response)
//         // Check if the response is OK (status code 200)
//         if (!response.ok) {
//             const text = await response.text(); // Retrieve the full response text for inspection
//             console.error('Non-JSON response received:', text);
//             return res.status(response.status).json({ error: 'Failed to fetch transaction history', details: text });
//         }

//         // Attempt to parse the response as JSON
//         const data = await response.json();

//         // Check for API-specific errors
//         if (data.status !== '1') {
//             return res.status(400).json({ error: 'Failed to fetch transaction history', details: data.message });
//         }

//         // Send the transaction history data
//         res.json({ transactions: data.result });

//     } catch (error) {
//         // Handle timeout or other network errors
//         if (error.type === 'system' && error.code === 'ETIMEDOUT') {
//             console.error('Request timed out');
//             return res.status(504).json({ error: 'Request timed out, please try again' });
//         }

//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error', details: error.message });
//     }
// };
