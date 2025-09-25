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
