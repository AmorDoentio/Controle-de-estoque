// --- Variáveis Globais do App ---
// Contém o estado principal do aplicativo, preenchido pelo backend
let appData = {
    products: [],
    movements: []
};

// --- Seletores do DOM ---
let navLinks, pages;
let productModal, stockMovementModal, deleteConfirmModal;
let openProductModalBtn, cancelProductModalBtn;
let openEntryModalBtn, openExitModalBtn, cancelMovementModalBtn;
let cancelDeleteBtn;
let productForm, stockMovementForm, deleteConfirmForm;
let productTableBody, stockTableBody, reportTableBody; // reportTableBody adicionado
let productSearchInput, stockSearchInput, reportSearchInput; // Todos os 3 inputs
let dashboardTotalItems, dashboardTotalValue;
let prodObjectSelect, prodSizeSelect;

// --- Inicialização do App ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Seleciona todos os elementos do DOM ---
    findAllElements();

    // --- Configura os listeners de navegação (abas) ---
    setupNavigation();

    // --- Configura todos os modais (abrir/fechar) ---
    setupModalLogic();

    // --- Configura botões (IA, conta, etc.) ---
    setupButtonListeners();

    // --- Configura os formulários de envio (Adicionar, Excluir, Movimentar) ---
    setupFormHandlers();

    // --- Configura os inputs de busca (Produto, Estoque, Relatório) ---
    setupSearchInputs();

    // --- Configura o formulário dinâmico de Objeto/Tamanho ---
    setupDynamicFormLogic();

    // --- Carrega os dados iniciais do backend ---
    initializeApp();
});

// --- Funções Principais de Carregamento ---

/**
 * Puxa todos os dados do backend e atualiza a UI.
 * Esta é a função principal de inicialização e atualização.
 */
async function initializeApp() {
    await fetchProducts();
    await fetchMovements();
    
    // Agora que os dados estão em appData, renderiza tudo
    renderAll();
}

/**
 * Busca produtos do backend e armazena em appData.
 */
async function fetchProducts() {
    // TODO: Seu backend (Flask) precisa desta rota: GET /api/products
    // Ela deve retornar um JSON array, ex: [{ id: 1, name: "Camisa", ... }]
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Falha ao buscar produtos');
        appData.products = await response.json();
    } catch (error) {
        console.error(error);
        showToast('Não foi possível carregar os produtos.', 'error');
        appData.products = []; // Garante que seja um array
    }
}

/**
 * Busca movimentações do backend e armazena em appData.
 */
async function fetchMovements() {
    // TODO: Seu backend (Flask) precisa desta rota: GET /api/movements
    // Ela deve retornar um JSON array, ex: [{ id: 1, productName: "Camisa", ... }]
    try {
        const response = await fetch('/api/movements');
        if (!response.ok) throw new Error('Falha ao buscar relatórios');
        appData.movements = await response.json();
    } catch (error) {
        console.error(error);
        showToast('Não foi possível carregar os relatórios.', 'error');
        appData.movements = []; // Garante que seja um array
    }
}

/**
 * Atualiza todas as tabelas e o dashboard com os dados de appData.
 */
function renderAll() {
    // Passa os dados para as funções de renderização
    renderProductTable(appData.products);
    renderStockTable(appData.products);
    renderReportTable(appData.movements);
    updateDashboard(appData.products);
    populateProductSelect(appData.products);
}

// --- Funções de Configuração de Eventos ---

function findAllElements() {
    // Navegação
    navLinks = document.querySelectorAll('.nav-link');
    pages = document.querySelectorAll('.page-content');
    
    // Dashboard
    dashboardTotalItems = document.getElementById('dashboardTotalItems');
    dashboardTotalValue = document.getElementById('dashboardTotalValue');

    // Modais
    productModal = document.getElementById('productModal');
    stockMovementModal = document.getElementById('stockMovementModal');
    deleteConfirmModal = document.getElementById('deleteConfirmModal');
    
    // Formulários
    productForm = document.getElementById('productForm');
    stockMovementForm = document.getElementById('stockMovementForm');
    deleteConfirmForm = document.getElementById('deleteConfirmForm');

    // Botões dos Modais
    openProductModalBtn = document.getElementById('openProductModalBtn');
    cancelProductModalBtn = document.getElementById('cancelModalBtn');
    openEntryModalBtn = document.getElementById('openEntryModalBtn');
    openExitModalBtn = document.getElementById('openExitModalBtn');
    cancelMovementModalBtn = document.getElementById('cancelMovementModalBtn');
    cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    // Tabelas
    productTableBody = document.getElementById('productTableBody');
    stockTableBody = document.getElementById('stockTableBody');
    reportTableBody = document.getElementById('reportTableBody');

    // Inputs de Busca
    productSearchInput = document.getElementById('productSearchInput');
    stockSearchInput = document.getElementById('stockSearchInput');
    reportSearchInput = document.getElementById('reportSearchInput');
    
    // Selects Dinâmicos
    prodObjectSelect = document.getElementById('prodObject');
    prodSizeSelect = document.getElementById('prodSize');
}

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
    // Modal de Produto
    if (openProductModalBtn) openProductModalBtn.addEventListener('click', () => openModal(productModal));
    if (cancelProductModalBtn) cancelProductModalBtn.addEventListener('click', () => {
        closeModal(productModal);
        productForm.reset(); 
        resetDynamicForm(); 
    });
    if (productModal) productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModal(productModal);
            productForm.reset();
            resetDynamicForm();
        }
    });

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

    // Modal de Exclusão
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => {
        closeModal(deleteConfirmModal);
        deleteConfirmForm.reset();
    });
    if (deleteConfirmModal) deleteConfirmModal.addEventListener('click', (e) => {
        if (e.target === deleteConfirmModal) {
            closeModal(deleteConfirmModal);
            deleteConfirmForm.reset();
        }
    });
}

function setupButtonListeners() {
    // Botões da Conta
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if(changePasswordBtn) changePasswordBtn.addEventListener('click', () => showToast('Função "Trocar Senha" ainda não implementada.', 'error'));
    if(logoutBtn) logoutBtn.addEventListener('click', () => showToast('Função "Trocar Usuário" ainda não implementada.', 'error'));

    // Botões de IA (Simulado)
    const analyzeReportBtn = document.getElementById('analyzeReportBtn');
    if (analyzeReportBtn) {
        analyzeReportBtn.addEventListener('click', () => {
            const reportContainer = document.getElementById('reportAnalysisContainer');
            const reportLoading = document.getElementById('reportAnalysisLoading');
            const reportResult = document.getElementById('reportAnalysisResult');

            if (reportContainer) reportContainer.classList.remove('hidden'); 
            if (reportLoading) reportLoading.classList.remove('hidden'); 
            if (reportResult) reportResult.innerHTML = "";
            analyzeReportBtn.disabled = true;

            setTimeout(() => {
                if (reportResult) {
                    reportResult.innerHTML = `<p><strong>Análise (Simulada):</strong></p><p>A "Camisa" é o item com maior giro.</p>`;
                }
                if (reportLoading) reportLoading.classList.add('hidden');
                analyzeReportBtn.disabled = false;
            }, 1500);
        });
    }
}

/**
 * Configura os 3 formulários principais (Adicionar, Excluir, Movimentar)
 */
function setupFormHandlers() {
    // --- 1. Formulário de ADICIONAR PRODUTO ---
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newProduct = {
                // O backend deve gerar o ID
                name: document.getElementById('prodName').value,
                sexo: document.getElementById('prodSexo').value,
                object: document.getElementById('prodObject').value,
                size: document.getElementById('prodSize').value,
                price: parseFloat(document.getElementById('prodPrice').value) || 0,
                quantity: parseInt(document.getElementById('prodQuantity').value) || 0,
            };

            // TODO: Seu backend (Flask) precisa desta rota: POST /api/products
            // O body será o JSON 'newProduct'
            try {
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProduct)
                });
                if (!response.ok) throw new Error('Falha ao adicionar produto');

                await initializeApp(); // Recarrega todos os dados
                closeModal(productModal);
                productForm.reset();
                resetDynamicForm();
                showToast('Produto adicionado com sucesso!', 'success');
            } catch (error) {
                console.error(error);
                showToast(error.message, 'error');
            }
        });
    }

    // --- 2. Formulário de EXCLUIR PRODUTO ---
    if (deleteConfirmForm) {
        deleteConfirmForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('deleteProductId').value;
            const password = document.getElementById('deletePasswordInput').value;

            // TODO: Seu backend (Flask) precisa desta rota: DELETE /api/products/<id>
            // O body enviará a senha para verificação
            try {
                const response = await fetch(`/api/products/${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: password }) // Envia a senha para o backend
                });
                
                if (response.status === 401) { // Unauthorized
                    showToast('Senha incorreta!', 'error');
                } else if (!response.ok) {
                    throw new Error('Falha ao excluir produto');
                } else {
                    await initializeApp(); // Recarrega todos os dados
                    closeModal(deleteConfirmModal);
                    deleteConfirmForm.reset();
                    showToast('Produto excluído com sucesso!', 'success');
                }
            } catch (error) {
                console.error(error);
                showToast(error.message, 'error');
            }
        });
    }

    // --- 3. Formulário de MOVIMENTAR ESTOQUE ---
    if (stockMovementForm) {
        stockMovementForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = stockMovementForm.querySelector('button[type="submit"]');
            const movementData = {
                productId: document.getElementById('movementProductSelect').value,
                quantity: parseInt(document.getElementById('movementQuantityInput').value),
                type: document.getElementById('movementTypeInput').value,
                date: document.getElementById('movementDate').value // Pega a data manual
            };

            if (!movementData.productId || !movementData.quantity || movementData.quantity <= 0 || !movementData.date) {
                showToast('Preencha todos os campos corretamente.', 'error');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Salvando...";

            // TODO: Seu backend (Flask) precisa desta rota: POST /api/stock/move
            // O body será o JSON 'movementData'
            try {
                const response = await fetch('/api/stock/move', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movementData)
                });

                if (!response.ok) {
                    // Tenta ler a mensagem de erro do backend (ex: "Estoque negativo")
                    const error = await response.json();
                    throw new Error(error.message || 'Falha ao salvar movimentação');
                }

                await initializeApp(); // Recarrega tudo
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

/**
 * Configura os 3 inputs de busca (filtram os dados de appData)
 */
function setupSearchInputs() {
    // 1. Busca de Produtos
    if (productSearchInput) {
        productSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = appData.products.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.sexo.toLowerCase().includes(searchTerm) ||
                p.object.toLowerCase().includes(searchTerm)
            );
            renderProductTable(filtered); // Renderiza a tabela com os dados filtrados
            
            if (filtered.length === 0 && searchTerm.length > 0) {
                showToast('Nenhum produto encontrado.', 'error');
            }
        });
    }

    // 2. Busca de Estoque
    if (stockSearchInput) {
        stockSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = appData.products.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.sexo.toLowerCase().includes(searchTerm) ||
                p.size.toLowerCase().includes(searchTerm)
            );
            renderStockTable(filtered); // Renderiza a tabela com os dados filtrados
            
            if (filtered.length === 0 && searchTerm.length > 0) {
                showToast('Nenhum item encontrado no estoque.', 'error');
            }
        });
    }

    // 3. Busca de Relatórios
    if (reportSearchInput) {
        reportSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = appData.movements.filter(m =>
                m.productName.toLowerCase().includes(searchTerm) ||
                m.type.toLowerCase().includes(searchTerm)
            );
            renderReportTable(filtered); // Renderiza a tabela com os dados filtrados
            
            if (filtered.length === 0 && searchTerm.length > 0) {
                showToast('Nenhuma movimentação encontrada.', 'error');
            }
        });
    }
}

/**
 * Configura a lógica do formulário de produto (Objeto -> Tamanho)
 */
function setupDynamicFormLogic() {
    if (prodObjectSelect) {
        prodObjectSelect.addEventListener('change', () => {
            const selection = prodObjectSelect.value;
            prodSizeSelect.innerHTML = ''; 
            prodSizeSelect.disabled = true;

            let options = [];

            if (selection === 'Calça' || selection === 'Bermuda') {
                options = ['38', '40', '42'];
                prodSizeSelect.disabled = false;
            } else if (selection === 'Camisa') {
                options = ['P', 'M', 'G'];
                prodSizeSelect.disabled = false;
            } else {
                options = ['Selecione um objeto primeiro'];
            }

            options.forEach(optionValue => {
                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                prodSizeSelect.appendChild(option);
            });
        });
    }
}

// --- Funções de Renderização (Helpers) ---

function renderProductTable(products) {
    if (!productTableBody) return;
    productTableBody.innerHTML = '';
    
    if (products.length === 0) {
         productTableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-500">Nenhum produto cadastrado.</td></tr>';
         return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50';
        // O ID do produto (vindo do backend) é essencial para o botão de excluir
        row.innerHTML = `
            <td class="p-4">${product.name}</td>
            <td class="p-4">${product.sexo}</td>
            <td class="p-4">${product.size}</td>
            <td class="p-4">${product.object}</td>
            <td class="p-4">
                <button class="edit-btn text-blue-600 hover:text-blue-800 font-medium mr-3" data-id="${product.id}">Editar</button>
                <button class="delete-btn text-red-600 hover:text-red-800 font-medium" data-id="${product.id}">Excluir</button>
            </td>
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

function renderReportTable(movements) {
    if (!reportTableBody) return;
    reportTableBody.innerHTML = '';
    
    if (movements.length === 0) {
         reportTableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-500">Nenhuma movimentação registrada.</td></tr>';
         return;
    }

    // Ordena por data (mais recente primeiro)
    movements.sort((a, b) => new Date(b.date) - new Date(a.date));

    movements.forEach(move => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50';
        const typeClass = move.type === 'entrada' ? 'text-green-600' : 'text-red-600';
        const typeText = move.type === 'entrada' ? 'Entrada' : 'Saída';
        const formattedDate = new Date(move.date).toLocaleString('pt-BR');

        row.innerHTML = `
            <td class="p-4">${move.productName}</td>
            <td class="p-4 ${typeClass} font-medium">${typeText}</td>
            <td class="p-4 ${typeClass} font-medium">${move.type === 'entrada' ? '+' : '-'}${move.quantityChanged}</td>
            <td class="p-4">${formattedDate}</td>
            <td class="p-4 font-bold">${move.newQuantity}</td>
        `;
        reportTableBody.appendChild(row);
    });
}


function populateProductSelect(products) {
    const select = document.getElementById('movementProductSelect');
    if (!select) return;
    
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Selecione um produto...</option>'; 
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id; // Usa o ID do backend
        option.textContent = `${product.name} (${product.size}) - [${product.quantity} em estoque]`;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function updateDashboard(products) {
    if (!dashboardTotalItems || !dashboardTotalValue) return;

    const totalItems = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    dashboardTotalItems.textContent = totalItems;

    const totalValue = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.price || 0)), 0);
    dashboardTotalValue.textContent = totalValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
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
    
    // NOVO: Define a data e hora atual como padrão
    const dateInput = document.getElementById('movementDate');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Ajusta para o fuso horário local
    dateInput.value = now.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM

    populateProductSelect(appData.products);
    openModal(stockMovementModal);
}

function resetDynamicForm() {
    if (prodSizeSelect) {
        prodSizeSelect.innerHTML = '<option value="">Selecione um objeto primeiro</option>';
        prodSizeSelect.disabled = true;
    }
    if (prodObjectSelect) {
        prodObjectSelect.value = ""; 
    }
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
