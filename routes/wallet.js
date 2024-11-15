import express from 'express';
import {ethers} from 'ethers';

import { Mnemonic } from 'ethers';

import { createNewWallet, sendERC20Token, sendNativeToken, queryERC20Balance, queryNativeBalance, getTransactionHistory} from '../controllers/transactionController.js';
const router = express.Router();

// Create new wallet
router.get('/create-wallet', createNewWallet);
router.post('/transaction/erc20', sendERC20Token);
router.post('/transaction/native', sendNativeToken);
router.get('/balance/native/:address', queryNativeBalance);
router.get('/balance/erc20/:address/:ERC20_CONTRACT_ADDRESS', queryERC20Balance);
router.get('/transaction/:address', getTransactionHistory);

export default router;