let participants = [];
let expenseList = [];

// Function to add a participant
function addParticipant() {
    const participantName = document.getElementById('participantName').value.trim();
    if (participantName && !participants.includes(participantName)) {
        participants.push(participantName);
        updateParticipantDropdown();
        updateParticipantList();
        document.getElementById('participantName').value = '';
    } else {
        alert("Please enter a valid and unique participant name.");
    }
}

// Update the Payer dropdown
function updateParticipantDropdown() {
    const payerSelect = document.getElementById('payer');
    payerSelect.innerHTML = `<option value="" disabled selected>Select payer</option>`;
    participants.forEach(participant => {
        const option = document.createElement('option');
        option.value = participant;
        option.text = participant;
        payerSelect.add(option);
    });
}

// Update the Participants list display
function updateParticipantList() {
    const participantsList = document.getElementById('participantsList');
    participantsList.innerHTML = '';
    participants.forEach(participant => {
        const li = document.createElement('li');
        li.textContent = participant;
        participantsList.appendChild(li);
    });
}

// Function to add an expense
function addExpense() {
    const payer = document.getElementById('payer').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value.trim();

    if (!payer) {
        alert("Please select a payer.");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    if (!description) {
        alert("Please enter a description for the expense.");
        return;
    }

    expenseList.push({ payer, amount, description });
    updateExpenseTable();
    calculateSettlements();

    // Reset the expense form fields
    document.getElementById('payer').value = "";
    document.getElementById('amount').value = "";
    document.getElementById('description').value = "";
}

// Function to update the Expense table
function updateExpenseTable() {
    const expenseTableBody = document.getElementById('expenseList');
    expenseTableBody.innerHTML = '';

    expenseList.forEach((expense, index) => {
        const eachShare = (expense.amount / participants.length).toFixed(2);

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${expense.payer}</td>
            <td>${expense.description}</td>
            <td>₹${expense.amount.toFixed(2)}</td>
            <td>₹${eachShare}</td>
            <td><button class="edit" onclick="editExpense(${index})">Edit</button></td>
            <td><button class="delete" onclick="deleteExpense(${index})">Delete</button></td>
        `;

        expenseTableBody.appendChild(row);
    });
}

// Function to delete an expense
function deleteExpense(index) {
    if (confirm("Are you sure you want to delete this expense?")) {
        expenseList.splice(index, 1);
        updateExpenseTable();
        calculateSettlements();
    }
}

// Function to edit an expense
function editExpense(index) {
    const expense = expenseList[index];
    document.getElementById('payer').value = expense.payer;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('description').value = expense.description;

    // Remove the expense from the list to allow re-editing
    deleteExpense(index);
}
// Function to calculate settlements
function calculateSettlements() {
    const settlements = {};
    participants.forEach(person => {
        settlements[person] = { paid: 0, owes: 0 };
    });

    // Calculate total paid and owed for each participant
    expenseList.forEach(expense => {
        const eachShare = expense.amount / participants.length;
        settlements[expense.payer].paid += expense.amount;
        participants.forEach(person => {
            settlements[person].owes += eachShare;
        });
    });

    // Calculate net settlements
    const netSettlements = {};
    participants.forEach(person => {
        netSettlements[person] = (settlements[person].paid - settlements[person].owes).toFixed(2);
    });

    displaySettlements(netSettlements);
}

// Function to display settlements
function displaySettlements(netSettlements) {
    const settlementDiv = document.getElementById('settlementDiv');
    settlementDiv.innerHTML = '';

    Object.keys(netSettlements).forEach(person => {
        const amount = parseFloat(netSettlements[person]);
        const p = document.createElement('p');

        if (amount > 0) {
            p.textContent = `${person} will receive ₹${amount.toFixed(2)}`;
            p.classList.add('receive');
        } else if (amount < 0) {
            p.textContent = `${person} needs to pay ₹${Math.abs(amount).toFixed(2)}`;
            p.classList.add('need-to-pay');
        } else {
            p.textContent = `${person} is settled.`;
            p.classList.add('settled');
        }

        settlementDiv.appendChild(p);
    });
}

// Function to show detailed calculations in table format
function showCalculation() {
    console.log("Show Calculation Button Clicked");
    const calculationDiv = document.getElementById('calculationDetails');
    calculationDiv.innerHTML = '';

    const totalsPaid = {};
    const totalsOwed = {};
    participants.forEach(person => {
        totalsPaid[person] = 0;
        totalsOwed[person] = 0;
    });

    // Calculate totals paid and owed
    expenseList.forEach(expense => {
        const eachShare = expense.amount / participants.length;
        totalsPaid[expense.payer] += expense.amount;
        participants.forEach(person => {
            totalsOwed[person] += eachShare;
        });
    });

    // Calculate the total amount spent
    const totalSpent = expenseList.reduce((sum, expense) => sum + expense.amount, 0);
    const eachOwed = (totalSpent / participants.length).toFixed(2);

    // Generate Totals Paid table
    let totalsPaidTable = `<h2>Totals Paid:</h2>
        <table>
            <thead>
                <tr><th>Person</th><th>Total Paid (₹)</th></tr>
            </thead>
            <tbody>`;

    Object.keys(totalsPaid).forEach(person => {
        totalsPaidTable += `<tr><td>${person}</td><td>₹${totalsPaid[person].toFixed(2)}</td></tr>`;
    });

    totalsPaidTable += `<tr><td><strong>Total</strong></td><td>₹${totalSpent.toFixed(2)}</td></tr>`;
    totalsPaidTable += `</tbody></table>`;

    // Generate Totals Owed table
    let totalsOwedTable = `<h2>Totals Owed:</h2>
        <p>(${totalSpent.toFixed(2)} total / ${participants.length} participants)</p>
        <table>
            <thead>
                <tr><th>Person</th><th>Total Owed (₹)</th></tr>
            </thead>
            <tbody>`;

    participants.forEach(person => {
        totalsOwedTable += `<tr><td>${person}</td><td>₹${eachOwed}</td></tr>`;
    });

    totalsOwedTable += `</tbody></table>`;

    // Generate Net Settlements table
    let netSettlementsTable = `<h2>Net Settlements:</h2>
        <table>
            <thead>
                <tr><th>Person</th><th>Net Settlement (₹)</th></tr>
            </thead>
            <tbody>`;

    participants.forEach(person => {
        const netSettlement = (totalsPaid[person] - eachOwed).toFixed(2);
        const sign = netSettlement >= 0 ? "+" : "-";
        netSettlementsTable += `<tr><td>${person}</td><td>₹${totalsPaid[person].toFixed(2)} - ₹${eachOwed} = ${sign}₹${Math.abs(netSettlement)}</td></tr>`;
    });

    netSettlementsTable += `</tbody></table>`;

    // Append tables to the calculation details div
    calculationDiv.innerHTML = totalsPaidTable + totalsOwedTable + netSettlementsTable;
    console.log("Calculation Completed");
}

// Function to generate and display the payment plan
function showPaymentPlan() {
    const settlementDiv = document.getElementById('settlementDiv');
    const calculationDiv = document.getElementById('calculationDetails');
    const paymentPlanDiv = document.createElement('div');
    paymentPlanDiv.id = 'paymentPlan';
    paymentPlanDiv.innerHTML = `<h2>Payment Plan:</h2>`;
    
    // Calculate settlements again
    const settlements = {};
    participants.forEach(person => {
        settlements[person] = { paid: 0, owes: 0 };
    });

    expenseList.forEach(expense => {
        const eachShare = expense.amount / participants.length;
        settlements[expense.payer].paid += expense.amount;
        participants.forEach(person => {
            settlements[person].owes += eachShare;
        });
    });

    const netSettlements = {};
    participants.forEach(person => {
        netSettlements[person] = (settlements[person].paid - settlements[person].owes).toFixed(2);
    });

    // Separate payers and receivers
    let payers = [];
    let receivers = [];

    Object.keys(netSettlements).forEach(person => {
        const amount = parseFloat(netSettlements[person]);
        if (amount < 0) {
            payers.push({ person, amount: Math.abs(amount) });
        } else if (amount > 0) {
            receivers.push({ person, amount: amount });
        }
    });

    let paymentPlan = '';
    payers.forEach(payer => {
        while (payer.amount > 0 && receivers.length > 0) {
            let receiver = receivers[0];
            let payment = Math.min(payer.amount, receiver.amount);

            paymentPlan += `${payer.person} pays ${receiver.person} ₹${payment.toFixed(2)}<br/>`;

            payer.amount -= payment;
            receiver.amount -= payment;

            if (receiver.amount === 0) {
                receivers.shift();
            }
        }
    });

    if (paymentPlan === '') {
        paymentPlanDiv.innerHTML += `<p>No payments needed, everyone is settled!</p>`;
    } else {
        paymentPlanDiv.innerHTML += paymentPlan;
    }

    // Remove previous payment plan if exists
    const existingPaymentPlan = document.getElementById('paymentPlan');
    if (existingPaymentPlan) {
        existingPaymentPlan.remove();
    }

    settlementDiv.appendChild(paymentPlanDiv);
}
