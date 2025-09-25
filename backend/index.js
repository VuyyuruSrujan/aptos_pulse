const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Delhi', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const autopayBillSchema = new mongoose.Schema({
	userAddress: { type: String, required: true, unique: false },
	billDetails: { type: Object, required: true },
	createdAt: { type: Date, default: Date.now },
});

const AutopayBill = mongoose.model('AutopayBill', autopayBillSchema);

// Endpoint to store autopay bill
app.post('/api/autopay', async (req, res) => {
	try {
		const { userAddress, billDetails } = req.body;
		if (!userAddress || !billDetails) {
			return res.status(400).json({ error: 'Missing userAddress or billDetails' });
		}
		const bill = new AutopayBill({ userAddress, billDetails });
		await bill.save();
		res.status(201).json({ message: 'Autopay bill stored successfully' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.listen(3001, () => {
	console.log('Backend server running on port 3001');
});

const { Aptos, AptosAccount, Network } = require('@aptos-labs/ts-sdk');
require('dotenv').config();

// Real function to call pay_single_bill on Aptos smart contract
async function sendTransaction({ userAddress, payee, amount, billId }) {
	try {
		// Setup Aptos client
		const aptos = new Aptos(
			Network[process.env.VITE_APP_NETWORK?.toUpperCase() || 'TESTNET']
		);
		// Use publisher's private key to sign transaction
		const account = new AptosAccount(process.env.VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY);
		// Prepare payload for pay_single_bill
		const payload = {
			function: `${process.env.VITE_MODULE_ADDRESS}::pulse::pay_single_bill`,
			type_arguments: [],
			arguments: [userAddress, billId, payee, amount],
		};
		// Send transaction
		const tx = await aptos.sendTransaction({
			sender: account,
			payload,
		});
		await aptos.waitForTransaction({ transactionHash: tx.hash });
		console.log(`Transaction successful: user=${userAddress}, payee=${payee}, amount=${amount}, billId=${billId}, txHash=${tx.hash}`);
		return { success: true, txHash: tx.hash };
	} catch (err) {
		console.error('Aptos transaction error:', err);
		return { success: false, error: err.message };
	}
}


// Endpoint to get today's due autopay bills for a user
app.get('/api/autopay/due/:userAddress', async (req, res) => {
	const userAddress = req.params.userAddress;
	const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
	try {
		const bills = await AutopayBill.find({
			userAddress,
			'billDetails.enabled': true,
			'billDetails.dueDate': today
		});
		res.json({ bills });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});
