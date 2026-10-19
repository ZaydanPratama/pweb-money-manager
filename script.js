
const form = document.querySelector("#transaction-form");
const typeInput = document.querySelector("#type");
const amountInput = document.querySelector("#amount");

const transactionList = document.querySelector("#transaction-list");
const emptyMessage = document.querySelector("#empty-message");

let transactions = [];

function formatRupiah(amount) {
    return "Rp" + amount.toLocaleString("id-ID");
}

function renderTransactions() {
    transactionList.innerHTML = "";

    for (const transaction of transactions) {
        const item = document.createElement("li");

        if (transaction.type === "income") {
            item.textContent =
                "Pemasukan: " + formatRupiah(transaction.amount);
        } else {
            item.textContent =
                "Pengeluaran: " + formatRupiah(transaction.amount);
        }

        transactionList.prepend(item);
    }

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
