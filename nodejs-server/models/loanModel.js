const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Loan must have an amount']
    },
    interestRate: {
        type: Number,
        required: [true, 'Loan must have an interest rate']
    },
    repaymentAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'PAID'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true // createdAt will be the start date of the loan
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;
