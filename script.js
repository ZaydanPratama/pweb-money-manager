
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

    for (let i = transactions.length - 1; i >= 0; i--) {
        const transaction = transactions[i];
        const item = document.createElement("li");
        const deleteButton = document.createElement("button");

        if (transaction.type === "income") {
            item.textContent =
                "Pemasukan: " + formatRupiah(transaction.amount);
        } else {
            item.textContent =
                "Pengeluaran: " + formatRupiah(transaction.amount);
        }

        deleteButton.textContent = "Hapus";
        deleteButton.classList.add("delete-button");

        deleteButton.addEventListener("click", function() {
            const confirmation = confirm(
                "Apakah kamu yakin ingin menghapus transaksi ini?"
            );

            if (confirmation) {
                transactions.splice(i, 0);
                renderTransactions();
            }
        });

        item.appendChild(deleteButton);
        transactionList.appendChild(item);
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
