
const API = 'https://liamba-mufaya-node-app-mysql.onrender.com/api/items';

const tbody = document.querySelector('#itemsTbl tbody');

// Load all items
async function loadItems() {
    try {
        const res = await fetch(API);

        if (!res.ok) {
            throw new Error('Failed to load items');
        }

        const data = await res.json();

        tbody.innerHTML = '';

        data.forEach(row => {
            const tr = document.createElement('tr');

            // ID cell
            const idTd = document.createElement('td');
            idTd.textContent = row.id;
            tr.appendChild(idTd);

            // Name cell
            const nameTd = document.createElement('td');
            nameTd.contentEditable = 'true';
            nameTd.dataset.field = 'name';
            nameTd.textContent = row.name;
            tr.appendChild(nameTd);

            // Price cell
            const priceTd = document.createElement('td');
            priceTd.contentEditable = 'true';
            priceTd.dataset.field = 'price';
            priceTd.textContent = row.price;
            tr.appendChild(priceTd);

            // Actions cell
            const actionsTd = document.createElement('td');

            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save';
            saveBtn.dataset.id = row.id;
            saveBtn.classList.add('save');

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.dataset.id = row.id;
            deleteBtn.classList.add('del');

            actionsTd.appendChild(saveBtn);
            actionsTd.appendChild(deleteBtn);
            tr.appendChild(actionsTd);

            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading items:', error);
        alert('Failed to load items. Check your server.');
    }
}

// Create a new item
document.getElementById('createForm').addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const priceInput = document.getElementById('price').value.trim();
    const price = Number(priceInput);

    if (!name || priceInput === '' || !Number.isFinite(price) || price < 0) {
        alert('Enter a valid name and non-negative price.');
        return;
    }

    try {
        const res = await fetch(API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, price })
        });

        if (res.ok) {
            e.target.reset();
            await loadItems();
        } else {
            alert('Create failed');
        }
    } catch (error) {
        console.error('Error creating item:', error);
        alert('Unable to create item. Check your server.');
    }
});

// Handle Save and Delete buttons
tbody.addEventListener('click', async e => {
    const button = e.target.closest('button');

    if (!button || !tbody.contains(button)) {
        return;
    }

    const id = button.dataset.id;

    // Delete an item
    if (button.classList.contains('del')) {
        try {
            const res = await fetch(`${API}/${id}`, {
                method: 'DELETE'
            });

            if (res.status === 204 || res.ok) {
                await loadItems();
            } else {
                alert('Delete failed');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Unable to delete item. Check your server.');
        }
    }

    // Update an item
    if (button.classList.contains('save')) {
        const tr = button.closest('tr');

        const name = tr
            .querySelector('[data-field="name"]')
            .textContent.trim();

        const priceInput = tr
            .querySelector('[data-field="price"]')
            .textContent.trim();

        const price = Number(priceInput);

        if (!name || priceInput === '' || !Number.isFinite(price) || price < 0) {
            alert('Enter a valid name and non-negative price.');
            return;
        }

        try {
            const res = await fetch(`${API}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, price })
            });

            if (res.ok) {
                await loadItems();
            } else {
                alert('Update failed');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Unable to update item. Check your server.');
        }
    }
});

// Initial load
loadItems();
