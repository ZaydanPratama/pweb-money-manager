
const form = document.querySelector("#transaction-form");
const typeInput = document.querySelector("#type");
const amountInput = document.querySelector("#amount");

const incomeElement = document.querySelector("#income");
const expenseElement = document.querySelector("#expense");
const balanceElement = document.querySelector("#balance");

const transactionList = document.querySelector("#transaction-list");
const emptyMessage = document.querySelector("#empty-message");

let transactions = [];

function formatRupiah(amount) {
    return "Rp" + amount.toLocaleString("id-ID");
}

function renderTransactions() {
    transactionList.innerHTML = "";

    let income = 0;
    let expense = 0;

    for (const transaction of transactions) {
        const item = document.createElement("li");

        if (transaction.type === "income") {
            income += transaction.amount;
            item.textContent =
                "Pemasukan: " + formatRupiah(transaction.amount);
        } else {
            expense += transaction.amount;
            item.textContent =
                "Pengeluaran: " + formatRupiah(transaction.amount);
        }

        transactionList.appendChild(item);
    }

    incomeElement.textContent = formatRupiah(income);
    expenseElement.textContent = formatRupiah(expense);
    balanceElement.textContent = formatRupiah(income - expense);

    emptyMessage.hidden = transactions.length > 0;
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const type = typeInput.value;
    const amount = Number(amountInput.value);

    if (amount <= 0) {
        alert("Nominal harus lebih dari 0.");
        return;
    }

    transactions.push({
        type: type,
        amount: amount
    });

    form.reset();
    renderTransactions();
});

renderTransactions();
