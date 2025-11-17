document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = usernameInput.value;
            const password = passwordInput.value;

            // TODO: Substitua esta lógica de simulação por uma chamada fetch('/api/login')
            // O backend (Flask) deve validar o usuário e retornar o 'role' (admin ou employee)

            // --- LÓGICA DE SIMULAÇÃO ---
            if (username === 'Administrador' && password === 'Impacto22') {
                // Login de Admin
                sessionStorage.setItem('userRole', 'admin');
                sessionStorage.setItem('username', username);
                window.location.href = 'index.html'; // Redireciona para o dashboard principal
            
            } else if (username && password) {
                // Simula login de funcionário (qualquer outra conta)
                // No seu backend, você verificaria se é um usuário válido com 'role' de funcionário
                sessionStorage.setItem('userRole', 'employee');
                sessionStorage.setItem('username', username);
                window.location.href = 'Funcionario.html'; // Redireciona para o dashboard limitado
            
            } else {
                showToast('Usuário ou senha inválidos', 'error');
            }
            // --- FIM DA LÓGICA DE SIMULAÇÃO ---
        });
    }
});


// Função de Toast (copiada para o login)
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