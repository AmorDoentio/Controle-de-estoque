// --- Variáveis Globais ---
let appData = {
    products: [],
};

// --- Seletores do DOM (Versão Limitada) ---
let navLinks, pages;
let stockMovementModal;
let openEntryModalBtn, openExitModalBtn, cancelMovementModalBtn;
let stockMovementForm;
let productTableBody, stockTableBody;
let productSearchInput, stockSearchInput;

// --- Inicialização do App ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Protege a página
    checkAuth('employee');

    // --- Seleciona elementos ---
    navLinks = document.querySelectorAll('.nav-link');
    pages = document.querySelectorAll('.page-content');
    
    // --- Página 2 (Produtos) ---
    productTableBody = document.getElementById('productTableBody');
    productSearchInput = document.getElementById('productSearchInput');

    // --- Página 3 (Estoque) ---
    stockTableBody = document.getElementById('stockTableBody');
    stockMovementModal = document.getElementById('stockMovementModal');
    openEntryModalBtn = document.getElementById('openEntryModalBtn');
    openExitModalBtn = document.getElementById('openExitModalBtn');
    cancelMovementModalBtn = document.getElementById('cancelMovementModalBtn');
    stockMovementForm = document.getElementById('stockMovementForm');
    stockSearchInput = document.getElementById('stockSearchInput');

    // --- Botão de Sair ---
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) logoutBtn.addEventListener('click', logout);

    // --- Configura Navegação e Modais ---
    setupNavigation();
    setupModalLogic();

    // --- Configura Formulário de Movimentação ---
    setupFormHandlers();

    // --- Configura Buscas ---
    setupSearchInputs();

    // --- Carrega dados iniciais ---
    initializeApp();
});

// --- Funções Principais ---

async function initializeApp() {
    await fetchProducts();
    renderAll();
}

async function fetchProducts() {
    // TODO: (Flask) Rota: GET /api/products
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Falha ao buscar produtos');
        appData.products = await response.json();
    } catch (error) {
        console.error(error);
        showToast('Não foi possível carregar os produtos.', 'error');
        appData.products = [];
    }
}

function renderAll() {
    renderProductTable(appData.products);
    renderStockTable(appData.products);
    populateProductSelect(appData.products);
}

// --- Configuração de Eventos ---

function setupNavigation() {
    if (navLinks && pages) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPageId = link.getAttribute('data-page');
                
                pages.forEach(page => page.classList.add('hidden'));
                const targetPage = document.getElementById(targetPageId);
                if (targetPage) targetPage.classList.remove('hidden');
                
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }
}

function setupModalLogic() {
    // Modal de Movimentação
    if (openEntryModalBtn) openEntryModalBtn.addEventListener('click', () => openMovementModal('entrada'));
    if (openExitModalBtn) openExitModalBtn.addEventListener('click', () => openMovementModal('saida'));
    if (cancelMovementModalBtn) cancelMovementModalBtn.addEventListener('click', () => {
        closeModal(stockMovementModal);
        stockMovementForm.reset();
    });
    if (stockMovementModal) stockMovementModal.addEventListener('click', (e) => {
        if (e.target === stockMovementModal) {
            closeModal(stockMovementModal);
            stockMovementForm.reset();
        }
    });
}

function setupFormHandlers() {
    // Formulário de MOVIMENTAR ESTOQUE
    if (stockMovementForm) {
        stockMovementForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = stockMovementForm.querySelector('button[type="submit"]');
            const movementData = {
                productId: document.getElementById('movementProductSelect').value,
                quantity: parseInt(document.getElementById('movementQuantityInput').value),
                type: document.getElementById('movementTypeInput').value,
                date: document.getElementById('movementDate').value
            };

            if (!movementData.productId || !movementData.quantity || movementData.quantity <= 0 || !movementData.date) {
                showToast('Preencha todos os campos corretamente.', 'error');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Salvando...";

            // TODO: (Flask) Rota: POST /api/stock/move
            try {
                const response = await fetch('/api/stock/move', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movementData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Falha ao salvar movimentação');
                }

                await initializeApp(); // Recarrega os produtos (para ver estoque atualizado)
                closeModal(stockMovementModal);
                stockMovementForm.reset();
                showToast('Movimentação registrada com sucesso!', 'success');

            } catch (error) {
                console.error(error);
                showToast(error.message, 'error');
            } finally {
                 submitButton.disabled = false;
                 submitButton.textContent = "Salvar Movimentação";
            }
        });
    }
}

function setupSearchInputs() {
    // Busca de Produtos
    if (productSearchInput) {
        productSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = appData.products.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.sexo.toLowerCase().includes(searchTerm) ||
                p.object.toLowerCase().includes(searchTerm)
            );
            renderProductTable(filtered);
            if (filtered.length === 0 && searchTerm.length > 0) {
                showToast('Nenhum produto encontrado.', 'error');
            }
        });
    }

    // Busca de Estoque
    if (stockSearchInput) {
        stockSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = appData.products.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.sexo.toLowerCase().includes(searchTerm) ||
                p.size.toLowerCase().includes(searchTerm)
            );
            renderStockTable(filtered);
            if (filtered.length === 0 && searchTerm.length > 0) {
                showToast('Nenhum item encontrado no estoque.', 'error');
            }
        });
    }
}

// --- Funções de Renderização (Helpers) ---

/**
 * Renderiza a tabela de produtos (Versão de Funcionário - SEM AÇÕES)
 */
function renderProductTable(products) {
    if (!productTableBody) return;
    productTableBody.innerHTML = '';
    
    if (products.length === 0) {
         productTableBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">Nenhum produto cadastrado.</td></tr>';
         return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50';
        row.innerHTML = `
            <td class="p-4">${product.name}</td>
            <td class="p-4">${product.sexo}</td>
            <td class="p-4">${product.size}</td>
            <td class="p-4">${product.object}</td>
            <!-- Coluna de Ações foi removida -->
        `;
        productTableBody.appendChild(row);
    });
}

function renderStockTable(products) {
    if (!stockTableBody) return;
    stockTableBody.innerHTML = '';
    
    if (products.length === 0) {
         stockTableBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">Nenhum produto no estoque.</td></tr>';
         return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        const stockClass = product.quantity <= 10 ? 'text-red-600 font-bold' : '';
        row.className = 'hover:bg-slate-50';
        row.innerHTML = `
            <td class="p-4">${product.name}</td>
            <td class="p-4 ${stockClass}">${product.quantity}</td>
            <td class="p-4">${product.size}</td>
            <td class="p-4">${product.sexo}</td>
        `;
        stockTableBody.appendChild(row);
    });
}


function populateProductSelect(products) {
    const select = document.getElementById('movementProductSelect');
    if (!select) return;
    
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Selecione um produto...</option>'; 
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (${product.size}) - [${product.quantity} em estoque]`;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function openModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('hidden');
    setTimeout(() => modalElement.classList.add('open'), 10); 
}

function closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('open');
    setTimeout(() => modalElement.classList.add('hidden'), 300);
}

function openMovementModal(type) {
    if (!stockMovementModal) return;
    
    const title = stockMovementModal.querySelector('h2');
    const typeInput = document.getElementById('movementTypeInput');
    const submitButton = stockMovementModal.querySelector('button[type="submit"]');
    
    if (type === 'entrada') {
        title.textContent = "Registrar Entrada no Estoque";
        submitButton.className = "bg-green-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors";
    } else {
        title.textContent = "Registrar Saída do Estoque";
        submitButton.className = "bg-red-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700 transition-colors";
    }
    typeInput.value = type;
    
    const dateInput = document.getElementById('movementDate');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dateInput.value = now.toISOString().slice(0, 16);

    populateProductSelect(appData.products);
    openModal(stockMovementModal);
}

// --- Funções de Auth e Toast ---

function checkAuth(role) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== role) {
        sessionStorage.clear();
        window.location.href = 'Login.html';
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'Login.html';
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}