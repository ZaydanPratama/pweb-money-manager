
const form = document.querySelector("#transaction-form");
const dateInput = document.querySelector("#date");
const typeInput = document.querySelector("#type");
const walletInput = document.querySelector("#wallet");
const fromWalletInput = document.querySelector("#from-wallet");
const toWalletInput = document.querySelector("#to-wallet");
const categoryInput = document.querySelector("#category");
const amountInput = document.querySelector("#amount");
const noteInput = document.querySelector("#note");

const walletField = document.querySelector("#wallet-field");
const transferFields = document.querySelector("#transfer-fields");
const categoryField = document.querySelector("#category-field");
const formError = document.querySelector("#form-error");

const incomeElement = document.querySelector("#income");
const expenseElement = document.querySelector("#expense");
const balanceElement = document.querySelector("#balance");
const personalBalanceElement = document.querySelector("#personal-balance");
const businessBalanceElement = document.querySelector("#business-balance");

const transactionList = document.querySelector("#transaction-list");
const emptyMessage = document.querySelector("#empty-message");

const STORAGE_KEY = "transactions";

let transactions = [];

try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData !== null) {
        const parsedData = JSON.parse(savedData);

        if (Array.isArray(parsedData)) {
            transactions = parsedData;
        }
    }
} catch (error) {
    transactions = [];
}

function saveTransactions() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(transactions)
        );
        return true;
    } catch (error) {
        showError("Data gagal disimpan. Periksa penyimpanan browser.");
        return false;
    }
}

function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);
}

function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
}

function clearError() {
    formError.textContent = "";
    formError.hidden = true;
}

function getWalletName(wallet) {
    return wallet === "pribadi" ? "Pribadi" : "Usaha";
}

function updateFormFields() {
    const isTransfer = typeInput.value === "transfer";

    walletField.hidden = isTransfer;
    transferFields.hidden = !isTransfer;
    categoryField.hidden = isTransfer;

    walletInput.required = !isTransfer;
    categoryInput.required = !isTransfer;

    if (isTransfer) {
        categoryInput.value = "";
    }

    clearError();
}

typeInput.addEventListener("change", updateFormFields);

dateInput.value = getToday();
updateFormFields();

function calculateBalances() {
    let income = 0;
    let expense = 0;
    let personalBalance = 0;
    let businessBalance = 0;

    for (const transaction of transactions) {
        const amount = Number(transaction.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            continue;
        }

        if (transaction.type === "income") {
            income += amount;

            if (transaction.wallet === "pribadi") {
                personalBalance += amount;
            } else if (transaction.wallet === "usaha") {
                businessBalance += amount;
            }
        } else if (transaction.type === "expense") {
            expense += amount;

            if (transaction.wallet === "pribadi") {
                personalBalance -= amount;
            } else if (transaction.wallet === "usaha") {
                businessBalance -= amount;
            }
        } else if (transaction.type === "transfer") {
            if (
                transaction.fromWallet === "pribadi" &&
                transaction.toWallet === "usaha"
            ) {
                personalBalance -= amount;
                businessBalance += amount;
            } else if (
                transaction.fromWallet === "usaha" &&
                transaction.toWallet === "pribadi"
            ) {
                businessBalance -= amount;
                personalBalance += amount;
            }
        }
    }

    return {
        income,
        expense,
        balance: income - expense,
        personalBalance,
        businessBalance
    };
}

function renderSummary() {
    const balances = calculateBalances();

    incomeElement.textContent = formatRupiah(balances.income);
    expenseElement.textContent = formatRupiah(balances.expense);
    balanceElement.textContent = formatRupiah(balances.balance);

    personalBalanceElement.textContent =
        formatRupiah(balances.personalBalance);

    businessBalanceElement.textContent =
        formatRupiah(balances.businessBalance);
}

function renderTransactions() {
    transactionList.replaceChildren();

    const sortedTransactions = [...transactions].sort(
        function (a, b) {
            return (Number(b.createdAt) || 0) -
                   (Number(a.createdAt) || 0);
        }
    );

    emptyMessage.hidden = sortedTransactions.length > 0;

    for (const transaction of sortedTransactions) {
        const item = document.createElement("li");

        const info = document.createElement("div");
        info.className = "transaction-info";

        const name = document.createElement("strong");

        let title = "";

        if (transaction.type === "transfer") {
            title = "Transfer Dana";
        } else {
            title = transaction.category || "Transaksi";
        }

        name.textContent = title;

        const details = document.createElement("small");
        const date = transaction.date || "-";

        if (transaction.type === "transfer") {
            details.textContent =
                `${date} · ${getWalletName(transaction.fromWallet)} → ` +
                `${getWalletName(transaction.toWallet)}`;
        } else {
            details.textContent =
                `${date} · ${getWalletName(transaction.wallet)}` +
                (transaction.note ? ` · ${transaction.note}` : "");
        }

        info.append(name, details);

        const actions = document.createElement("div");
        actions.className = "transaction-actions";

        const amount = document.createElement("span");
        amount.className = "transaction-amount";

        if (transaction.type === "income") {
            amount.classList.add("income-text");
            amount.textContent = "+ " + formatRupiah(transaction.amount);
        } else if (transaction.type === "expense") {
            amount.classList.add("expense-text");
            amount.textContent = "- " + formatRupiah(transaction.amount);
        } else {
            amount.classList.add("transfer-text");
            amount.textContent = formatRupiah(transaction.amount);
        }

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Hapus";
        deleteButton.dataset.id = transaction.id;

        actions.append(amount, deleteButton);
        item.append(info, actions);
        transactionList.append(item);
    }

    renderSummary();
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearError();

    const date = dateInput.value;
    const type = typeInput.value;
    const amount = Number(amountInput.value);
    const note = noteInput.value.trim();

    if (!date) {
        showError("Tanggal transaksi wajib diisi.");
        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !Number.isInteger(amount)
    ) {
        showError("Nominal harus berupa bilangan bulat lebih dari 0.");
        return;
    }

    let newTransaction;

    if (type === "transfer") {
        const fromWallet = fromWalletInput.value;
        const toWallet = toWalletInput.value;

        if (fromWallet === toWallet) {
            showError("Dompet asal dan tujuan harus berbeda.");
            return;
        }

        const balances = calculateBalances();

        const sourceBalance =
            fromWallet === "pribadi"
                ? balances.personalBalance
                : balances.businessBalance;

        if (amount > sourceBalance) {
            showError("Saldo dompet asal tidak mencukupi untuk transfer.");
            return;
        }

        newTransaction = {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            date: date,
            type: "transfer",
            fromWallet: fromWallet,
            toWallet: toWallet,
            amount: amount,
            note: note
        };
    } else {
        const wallet = walletInput.value;
        const category = categoryInput.value;

        if (!category) {
            showError("Silakan pilih kategori transaksi.");
            return;
        }

        newTransaction = {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            date: date,
            type: type,
            wallet: wallet,
            category: category,
            amount: amount,
            note: note
        };
    }

    transactions.push(newTransaction);

    if (!saveTransactions()) {
        transactions.pop();
        return;
    }

    form.reset();
    dateInput.value = getToday();
    updateFormFields();

    renderTransactions();
});

transactionList.addEventListener("click", function (event) {
    const button = event.target.closest(".delete-button");

    if (!button) {
        return;
    }

    const id = button.dataset.id;

    const confirmed = confirm(
        "Apakah kamu yakin ingin menghapus transaksi ini?"
    );

    if (!confirmed) {
        return;
    }

    const previousTransactions = transactions;

    transactions = transactions.filter(function (transaction) {
        return transaction.id !== id;
    });

    if (!saveTransactions()) {
        transactions = previousTransactions;
        return;
    }

    renderTransactions();
});

renderTransactions();
