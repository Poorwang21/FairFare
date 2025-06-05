// App State
let currentTrip = {
    name: '',
    members: [],
    expenses: []
};

// DOM Elements
const tripSection = document.getElementById('trip-section');
const expenseSection = document.getElementById('expense-section');
const summarySection = document.getElementById('summary-section');
const tripNameInput = document.getElementById('trip-name');
const membersInput = document.getElementById('members');
const createTripBtn = document.getElementById('create-trip-btn');
const currentTripName = document.getElementById('current-trip-name');
const expenseDescInput = document.getElementById('expense-desc');
const expenseAmountInput = document.getElementById('expense-amount');
const paidBySelect = document.getElementById('paid-by');
const splitBetweenCheckboxes = document.getElementById('split-between-checkboxes');
const addExpenseBtn = document.getElementById('add-expense-btn');
const quickExpenseInput = document.getElementById('quick-expense');
const quickAddBtn = document.getElementById('quick-add-btn');
const expensesTbody = document.getElementById('expenses-tbody');
const viewSummaryBtn = document.getElementById('view-summary-btn');
const backToExpensesBtn = document.getElementById('back-to-expenses');
const summaryTripName = document.getElementById('summary-trip-name');
const totalSpentEl = document.getElementById('total-spent');
const averageSpentEl = document.getElementById('average-spent');
const balancesTbody = document.getElementById('balances-tbody');
const settlementsList = document.getElementById('settlements-list');
const exportBtn = document.getElementById('export-btn');

// Initialize the app
function init() {
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    createTripBtn.addEventListener('click', createTrip);
    addExpenseBtn.addEventListener('click', addExpense);
    quickAddBtn.addEventListener('click', addQuickExpense);
    viewSummaryBtn.addEventListener('click', showSummary);
    backToExpensesBtn.addEventListener('click', showExpenses);
    exportBtn.addEventListener('click', exportToPDF);
}

// Create a new trip
function createTrip() {
    const tripName = tripNameInput.value.trim();
    const members = membersInput.value.split(',').map(m => m.trim()).filter(m => m);
    
    if (!tripName || members.length < 2) {
        alert('Please enter a trip name and at least 2 participants');
        return;
    }
    
    currentTrip = {
        name: tripName,
        members: members,
        expenses: []
    };
    
    currentTripName.textContent = tripName;
    updatePaidBySelect();
    updateSplitBetweenCheckboxes();
    
    tripSection.classList.remove('active');
    tripSection.classList.add('hidden');
    expenseSection.classList.remove('hidden');
    expenseSection.classList.add('active');
}

// Update the "Paid By" dropdown
function updatePaidBySelect() {
    paidBySelect.innerHTML = '';
    currentTrip.members.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        paidBySelect.appendChild(option);
    });
}

// Update the split between checkboxes
function updateSplitBetweenCheckboxes() {
    splitBetweenCheckboxes.innerHTML = '';
    currentTrip.members.forEach(member => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'split-checkbox';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `split-${member}`;
        checkbox.value = member;
        checkbox.checked = true;
        
        const label = document.createElement('label');
        label.htmlFor = `split-${member}`;
        label.textContent = member;
        
        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        splitBetweenCheckboxes.appendChild(checkboxDiv);
    });
}

// Add an expense
function addExpense() {
    const description = expenseDescInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value);
    const paidBy = paidBySelect.value;
    
    if (!description || isNaN(amount)) {
        alert('Please enter a description and valid amount');
        return;
    }
    
    const splitBetween = Array.from(document.querySelectorAll('#split-between-checkboxes input:checked'))
        .map(checkbox => checkbox.value);
    
    if (splitBetween.length === 0) {
        alert('Please select at least one person to split between');
        return;
    }
    
    const expense = {
        id: Date.now(),
        description,
        amount,
        paidBy,
        splitBetween
    };
    
    currentTrip.expenses.push(expense);
    renderExpenses();
    clearExpenseForm();
}

// Add a quick expense from the notepad
function addQuickExpense() {
    const text = quickExpenseInput.value.trim();
    if (!text) return;
    
    // Simple parser for format like "Dinner 500 by Alice, only Alice and Bob"
    const parts = text.split(' by ');
    if (parts.length < 2) {
        alert('Please use format: "Description Amount by WhoPaid, only WhoIsInvolved"');
        return;
    }
    
    const firstPart = parts[0].trim();
    const amountMatch = firstPart.match(/(\d+)/);
    if (!amountMatch) {
        alert('Could not find amount in the description');
        return;
    }
    
    const amount = parseFloat(amountMatch[0]);
    const description = firstPart.replace(amount, '').trim();
    
    const secondPart = parts[1].trim();
    const paidBy = secondPart.includes(',') ? secondPart.split(',')[0].trim() : secondPart;
    
    let splitBetween = currentTrip.members;
    if (secondPart.includes('only')) {
        const onlyPart = secondPart.split('only')[1].trim();
        splitBetween = onlyPart.split(' and ').map(s => s.trim());
    }
    
    // Validate paidBy is in members
    if (!currentTrip.members.includes(paidBy)) {
        alert(`${paidBy} is not a trip participant`);
        return;
    }
    
    // Validate splitBetween members
    const invalidMembers = splitBetween.filter(m => !currentTrip.members.includes(m));
    if (invalidMembers.length > 0) {
        alert(`These members are not in the trip: ${invalidMembers.join(', ')}`);
        return;
    }
    
    const expense = {
        id: Date.now(),
        description,
        amount,
        paidBy,
        splitBetween
    };
    
    currentTrip.expenses.push(expense);
    renderExpenses();
    quickExpenseInput.value = '';
}

// Render the expenses table
function renderExpenses() {
    expensesTbody.innerHTML = '';
    
    currentTrip.expenses.forEach(expense => {
        const row = document.createElement('tr');
        
        const descCell = document.createElement('td');
        descCell.textContent = expense.description;
        
        const amountCell = document.createElement('td');
        amountCell.textContent = `₹${expense.amount.toFixed(2)}`;
        
        const paidByCell = document.createElement('td');
        paidByCell.textContent = expense.paidBy;
        
        const splitCell = document.createElement('td');
        splitCell.textContent = expense.splitBetween.join(', ');
        
        const actionCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'btn secondary';
        deleteBtn.addEventListener('click', () => deleteExpense(expense.id));
        actionCell.appendChild(deleteBtn);
        
        row.appendChild(descCell);
        row.appendChild(amountCell);
        row.appendChild(paidByCell);
        row.appendChild(splitCell);
        row.appendChild(actionCell);
        
        expensesTbody.appendChild(row);
    });
}

// Delete an expense
function deleteExpense(expenseId) {
    currentTrip.expenses = currentTrip.expenses.filter(exp => exp.id !== expenseId);
    renderExpenses();
}

// Clear the expense form
function clearExpenseForm() {
    expenseDescInput.value = '';
    expenseAmountInput.value = '';
}

// Show the summary section
function showSummary() {
    calculateBalances();
    
    summaryTripName.textContent = `${currentTrip.name} - Summary`;
    
    expenseSection.classList.remove('active');
    expenseSection.classList.add('hidden');
    summarySection.classList.remove('hidden');
    summarySection.classList.add('active');
}

// Show the expenses section
function showExpenses() {
    summarySection.classList.remove('active');
    summarySection.classList.add('hidden');
    expenseSection.classList.remove('hidden');
    expenseSection.classList.add('active');
}

// Calculate balances and settlements
function calculateBalances() {
    // Initialize balances
    const balances = {};
    currentTrip.members.forEach(member => {
        balances[member] = 0;
    });
    
    // Calculate total spent
    const totalSpent = currentTrip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalSpentEl.textContent = `₹${totalSpent.toFixed(2)}`;
    
    // Calculate average per person
    const averagePerPerson = totalSpent / currentTrip.members.length;
    averageSpentEl.textContent = `₹${averagePerPerson.toFixed(2)}`;
    
    // Process each expense
    currentTrip.expenses.forEach(expense => {
        const amountPerPerson = expense.amount / expense.splitBetween.length;
        
        // Person who paid gets credited the full amount
        balances[expense.paidBy] += expense.amount;
        
        // Each person who participated gets debited their share
        expense.splitBetween.forEach(person => {
            balances[person] -= amountPerPerson;
        });
    });
    
    // Render balances
    renderBalances(balances);
    
    // Calculate and render settlements
    const settlements = calculateSettlements(balances);
    renderSettlements(settlements);
}

// Render balances
function renderBalances(balances) {
    balancesTbody.innerHTML = '';
    
    Object.entries(balances).forEach(([person, balance]) => {
        const row = document.createElement('tr');
        
        const personCell = document.createElement('td');
        personCell.textContent = person;
        
        const balanceCell = document.createElement('td');
        balanceCell.textContent = `₹${balance.toFixed(2)}`;
        if (balance > 0) {
            balanceCell.style.color = 'green';
        } else if (balance < 0) {
            balanceCell.style.color = 'red';
        }
        
        row.appendChild(personCell);
        row.appendChild(balanceCell);
        balancesTbody.appendChild(row);
    });
}

// Calculate minimal transactions to settle balances
function calculateSettlements(balances) {
    const settlements = [];
    const people = Object.keys(balances);
    const amounts = Object.values(balances);
    
    // Create a list of people with their net balances
    const peopleBalances = people.map((person, index) => ({
        person,
        balance: amounts[index]
    }));
    
    // Sort by balance (highest creditors first, then highest debtors)
    peopleBalances.sort((a, b) => b.balance - a.balance);
    
    let i = 0; // Start of debtors
    let j = peopleBalances.length - 1; // Start of creditors
    
    while (i < j) {
        const debtor = peopleBalances[i];
        const creditor = peopleBalances[j];
        
        // Find the amount to settle
        const amount = Math.min(Math.abs(debtor.balance), Math.abs(creditor.balance));
        
        if (amount > 0.01) { // Ignore tiny amounts due to floating point
            settlements.push({
                from: debtor.person,
                to: creditor.person,
                amount: parseFloat(amount.toFixed(2))
            });
            
            // Update balances
            debtor.balance -= amount;
            creditor.balance += amount;
        }
        
        // Move to next person if balance is settled
        if (Math.abs(debtor.balance) < 0.01) i++;
        if (Math.abs(creditor.balance) < 0.01) j--;
    }
    
    return settlements;
}

// Render settlements
function renderSettlements(settlements) {
    settlementsList.innerHTML = '';
    
    if (settlements.length === 0) {
        const item = document.createElement('li');
        item.textContent = 'No settlements needed - everything is balanced!';
        settlementsList.appendChild(item);
        return;
    }
    
    settlements.forEach(settlement => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${settlement.from}</strong> pays <strong>₹${settlement.amount.toFixed(2)}</strong> to <strong>${settlement.to}</strong>`;
        settlementsList.appendChild(item);
    });
}

// Export to PDF (simplified - in a real app you'd use a library like jsPDF)
function exportToPDF() {
    alert('In a complete implementation, this would generate a PDF report.\nFor now, you can take a screenshot.');
}

// Initialize the app
init();