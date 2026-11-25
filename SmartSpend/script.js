
/* ==========================================
   SMARTSPEND - FINANCIAL MANAGEMENT SYSTEM
   ========================================== */

const STORAGE_KEYS = {
    transactions: "smartSpend_transactions",
    budgets: "smartSpend_budgets"
};

const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Education",
    "Bills",
    "Health",
    "Entertainment",
    "Other"
];

const defaultBudgets = {
    Food: 5000,
    Transport: 2500,
    Shopping: 4000,
    Education: 3000,
    Bills: 3500,
    Health: 2000,
    Entertainment: 2000,
    Other: 1500
};

// Keyword-based classification
const categoryKeywords = {
    Food: [
        "food", "restaurant", "swiggy", "zomato",
        "grocery", "groceries", "pizza", "cafe"
    ],

    Transport: [
        "uber", "ola", "bus", "train", "fuel",
        "petrol", "transport", "auto"
    ],

    Shopping: [
        "amazon", "shopping", "clothes", "mall",
        "purchase", "flipkart"
    ],

    Education: [
        "college", "course", "books", "education",
        "fee", "tuition"
    ],

    Bills: [
        "electricity", "water", "internet", "bill",
        "recharge", "wifi"
    ],

    Health: [
        "hospital", "medicine", "medical", "doctor",
        "health", "pharmacy"
    ],

    Entertainment: [
        "movie", "cinema", "game", "entertainment",
        "netflix", "music"
    ]
};

const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

function formatMoney(amount) {
    return currency.format(amount);
}

/* ==========================================
   STORAGE
   ========================================== */

function loadTransactions() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.transactions);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function loadBudgets() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.budgets);
        return data ? { ...defaultBudgets, ...JSON.parse(data) }
                   : { ...defaultBudgets };
    } catch {
        return { ...defaultBudgets };
    }
}

let transactions = loadTransactions();
let budgets = loadBudgets();

function saveTransactions() {
    localStorage.setItem(
        STORAGE_KEYS.transactions,
        JSON.stringify(transactions)
    );
}

function saveBudgets() {
    localStorage.setItem(
        STORAGE_KEYS.budgets,
        JSON.stringify(budgets)
    );
}

/* ==========================================
   DEMO DATA
   Only initialize sample transactions on first run.
   ========================================== */

function initializeDemoData() {
    if (localStorage.getItem(STORAGE_KEYS.transactions) !== null) {
        return;
    }

    const today = new Date();

    function daysAgo(days) {
        const d = new Date(today);
        d.setDate(d.getDate() - days);
        return d.toISOString().split("T")[0];
    }

    transactions = [
        {
            id: 1,
            description: "Monthly Allowance",
            amount: 15000,
            type: "income",
            category: "Other",
            date: daysAgo(0)
        },
        {
            id: 2,
            description: "Grocery Shopping",
            amount: 1250,
            type: "expense",
            category: "Food",
            date: daysAgo(0)
        },
        {
            id: 3,
            description: "College Transport",
            amount: 600,
            type: "expense",
            category: "Transport",
            date: daysAgo(1)
        },
        {
            id: 4,
            description: "Online Shopping",
            amount: 1800,
            type: "expense",
            category: "Shopping",
            date: daysAgo(2)
        },
        {
            id: 5,
            description: "Course Material",
            amount: 950,
            type: "expense",
            category: "Education",
            date: daysAgo(3)
        },
        {
            id: 6,
            description: "Movie Tickets",
            amount: 500,
            type: "expense",
            category: "Entertainment",
            date: daysAgo(4)
        },
        {
            id: 7,
            description: "Electricity Bill",
            amount: 1200,
            type: "expense",
            category: "Bills",
            date: daysAgo(5)
        },
        {
            id: 8,
            description: "Medical Expenses",
            amount: 350,
            type: "expense",
            category: "Health",
            date: daysAgo(6)
        }
    ];

    saveTransactions();
}



/* ==========================================
   CATEGORY CLASSIFICATION
   ========================================== */

function classifyTransaction(description, selectedCategory) {
    const text = description.toLowerCase();

    for (const category in categoryKeywords) {
        const keywords = categoryKeywords[category];

        if (keywords.some(keyword => text.includes(keyword))) {
            return category;
        }
    }

    // Use user-selected category if no keyword matches.
    return selectedCategory || "Other";
}

/* ==========================================
   FINANCIAL CALCULATIONS
   ========================================== */

function calculateTotals() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });

    const totalBudget = Object.values(budgets)
        .reduce((sum, value) => sum + Number(value), 0);

    const remainingBudget = totalIncome - totalExpense;

    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        totalBudget,
        remainingBudget
    };
}

function getCategoryExpenses() {
    const result = {};

    categories.forEach(category => {
        result[category] = 0;
    });

    transactions.forEach(transaction => {
        if (transaction.type === "expense") {
            result[transaction.category] =
                (result[transaction.category] || 0) +
                transaction.amount;
        }
    });

    return result;
}

/* ==========================================
   DASHBOARD
   ========================================== */

function updateDashboard() {
    const totals = calculateTotals();

    document.getElementById("balance").textContent =
        formatMoney(totals.balance);

    document.getElementById("income").textContent =
        formatMoney(totals.totalIncome);

    document.getElementById("expense").textContent =
        formatMoney(totals.totalExpense);

    document.getElementById("remaining").textContent =
        formatMoney(totals.remainingBudget);

    renderTransactions();
    renderBudgets();
    renderInsights();
    updateChart();
}

/* ==========================================
   TRANSACTION MANAGEMENT
   ========================================== */

const transactionForm =
    document.getElementById("transactionForm");

transactionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const description =
        document.getElementById("description").value.trim();

    const amount = Number(
        document.getElementById("amount").value
    );

    const type = document.getElementById("type").value;

    const selectedCategory =
        document.getElementById("category").value;

    const date = document.getElementById("date").value;

    // Validation
    if (!description || !Number.isFinite(amount) ||
        amount <= 0 || !date) {

        alert("Please enter valid transaction details.");
        return;
    }

    // Automatic category classification
    const category = classifyTransaction(
        description,
        selectedCategory
    );

    const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
        category,
        date
    };

    transactions.unshift(transaction);

    saveTransactions();
    updateDashboard();

    transactionForm.reset();

    document.getElementById("date").value =
        new Date().toISOString().split("T")[0];

    alert("Transaction added successfully!");
});

// Delete a transaction
function deleteTransaction(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    transactions = transactions.filter(
        transaction => transaction.id !== id
    );

    saveTransactions();
    updateDashboard();
}

// Transaction filter
document.getElementById("filterType")
    .addEventListener("change", renderTransactions);

function renderTransactions() {
    const tbody = document.getElementById("transactionTable");
    const filter = document.getElementById("filterType").value;
    const emptyMessage = document.getElementById("emptyMessage");

    tbody.innerHTML = "";

    const filteredTransactions = transactions.filter(transaction => {
        return filter === "all" || transaction.type === filter;
    });

    emptyMessage.style.display =
        filteredTransactions.length === 0 ? "block" : "none";

    filteredTransactions.forEach(transaction => {
        const row = document.createElement("tr");

        const descriptionCell = document.createElement("td");
        descriptionCell.className = "transaction-name";
        descriptionCell.textContent = transaction.description;

        const categoryCell = document.createElement("td");

        const categoryBadge = document.createElement("span");
        categoryBadge.className = "category-badge";
        categoryBadge.textContent = transaction.category;

        categoryCell.appendChild(categoryBadge);

        const dateCell = document.createElement("td");
        dateCell.textContent = transaction.date;

        const typeCell = document.createElement("td");
        typeCell.textContent = transaction.type;

        const amountCell = document.createElement("td");
        amountCell.textContent =
            (transaction.type === "income" ? "+" : "-") +
            formatMoney(transaction.amount);

        amountCell.className =
            transaction.type === "income"
            ? "income-text"
            : "expense-text";

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTransaction(transaction.id);
        });

        actionCell.appendChild(deleteButton);

        row.append(
            descriptionCell,
            categoryCell,
            dateCell,
            typeCell,
            amountCell,
            actionCell
        );

        tbody.appendChild(row);
    });
}

/* ==========================================
   BUDGET MANAGEMENT
   ========================================== */

function renderBudgets() {
    const budgetList = document.getElementById("budgetList");
    const categoryExpenses = getCategoryExpenses();

    budgetList.innerHTML = "";

    categories.forEach(category => {
        const budget = Number(budgets[category]) || 0;
        const spent = categoryExpenses[category] || 0;

        const percentage =
            budget > 0 ? (spent / budget) * 100 : 0;

        const safePercentage = Math.min(percentage, 100);

        let status = "Within budget";
        let progressClass = "";
        
        if (percentage >= 100) {
            status = "Budget exceeded";
            progressClass = "danger";
        } else if (percentage >= 70) {
            status = "Budget warning";
            progressClass = "warning";
        }

        const item = document.createElement("div");
        item.className = "budget-item";

        const top = document.createElement("div");
        top.className = "budget-top";

        const categoryName = document.createElement("strong");
        categoryName.textContent = category;

        const spentLabel = document.createElement("span");
        spentLabel.textContent =
            `${formatMoney(spent)} / ${formatMoney(budget)}`;

        top.append(categoryName, spentLabel);

        const track = document.createElement("div");
        track.className = "progress-track";

        const bar = document.createElement("div");
        bar.className = `progress-bar ${progressClass}`;
        bar.style.width = `${safePercentage}%`;

        track.appendChild(bar);

        const statusLabel = document.createElement("p");
        statusLabel.className = "budget-status";
        statusLabel.textContent =
            `${percentage.toFixed(1)}% utilized · ${status}`;

        const budgetInput = document.createElement("input");
        budgetInput.type = "number";
        budgetInput.min = "0";
        budgetInput.value = budget;
        budgetInput.setAttribute(
            "aria-label", `${category} monthly budget`
        );
        budgetInput.style.marginTop = "12px";

        const saveButton = document.createElement("button");
        saveButton.className = "primary-button";
        saveButton.textContent = "Update Budget";
        saveButton.style.marginTop = "8px";

        saveButton.addEventListener("click", () => {
            const newBudget = Number(budgetInput.value);

            if (!Number.isFinite(newBudget) || newBudget < 0) {
                alert("Enter a valid budget amount.");
                return;
            }

            budgets[category] = newBudget;
            saveBudgets();
            updateDashboard();
        });

        item.append(top, track, statusLabel, budgetInput, saveButton);

        budgetList.appendChild(item);
    });
}

/* ==========================================
   FINANCIAL INSIGHTS
   ========================================== */

function renderInsights() {
    const container = document.getElementById("insights");
    const categoryExpenses = getCategoryExpenses();
    const totals = calculateTotals();

    container.innerHTML = "";

    const expenses = transactions.filter(
        transaction => transaction.type === "expense"
    );

    const insights = [];

    if (expenses.length === 0) {
        insights.push(
            "Add expense transactions to generate financial insights."
        );
    } else {
        const highestCategory = Object.entries(categoryExpenses)
            .sort((a, b) => b[1] - a[1])[0];

        if (highestCategory && highestCategory[1] > 0) {
            insights.push(
                `Highest spending category: <strong>${highestCategory[0]}</strong> with ${formatMoney(highestCategory[1])}.`
            );
        }

        categories.forEach(category => {
            const spent = categoryExpenses[category];
            const budget = Number(budgets[category]) || 0;

            if (budget > 0 && spent > budget) {
                insights.push(
                    `<strong>${category}</strong> spending exceeded its budget by ${formatMoney(spent - budget)}.`
                );
            } else if (budget > 0 && spent >= budget * 0.9) {
                insights.push(
                    `<strong>${category}</strong> is approaching its budget limit.`
                );
            }
        });

        if (totals.totalIncome > 0) {
            const expenseRatio =
                (totals.totalExpense / totals.totalIncome) * 100;

            insights.push(
                `You have spent <strong>${expenseRatio.toFixed(1)}%</strong> of your recorded income.`
            );
        }

        if (totals.balance < 0) {
            insights.push(
                "Your recorded expenses exceed your recorded income."
            );
        } else {
            insights.push(
                `Your current recorded balance is <strong>${formatMoney(totals.balance)}</strong>.`
            );
        }
    }

    insights.forEach(message => {
        const div = document.createElement("div");
        div.className = "insight";
        div.innerHTML = message;
        container.appendChild(div);
    });
}

/* ==========================================
   CHART.JS
   ========================================== */

let categoryChart = null;

function updateChart() {
    const categoryExpenses = getCategoryExpenses();

    const labels = categories.filter(
        category => categoryExpenses[category] > 0
    );

    const data = labels.map(
        category => categoryExpenses[category]
    );

    const ctx = document.getElementById("categoryChart");

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
        type: "doughnut",

        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    "#40d6a2",
                    "#6d9cff",
                    "#aa8cff",
                    "#f5bd58",
                    "#ff7185",
                    "#5dc8e8",
                    "#e49bff",
                    "#8b9bb4"
                ],
                borderColor: "#141e30",
                borderWidth: 4,
                hoverOffset: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#a7b5cb",
                        padding: 16,
                        usePointStyle: true
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${formatMoney(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

/* ==========================================
   INITIALIZATION
   ========================================== */

function initializeApplication() {
    document.getElementById("todayDate").textContent =
        new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    document.getElementById("date").value =
        new Date().toISOString().split("T")[0];

    updateDashboard();
}

initializeApplication();
