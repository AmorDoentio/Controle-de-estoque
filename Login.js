document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    // Pega o botão de submit
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = usernameInput.value;
            const password = passwordInput.value;

            // Desabilita o botão para evitar cliques duplos e dá feedback
            submitButton.disabled = true;
            submitButton.textContent = 'Verificando...';

            // TODO: Substitua esta lógica de simulação por uma chamada fetch('/api/login')
            // O backend (Flask) deve validar o usuário e retornar o 'role' (admin ou employee)

            // --- LÓGICA DE SIMULAÇÃO (CORRIGIDA E MELHORADA) ---
            if (username === 'Administrador' && password === 'Impacto22') {
                // Login de Admin
                showToast('Login com sucesso! Carregando...', 'success');
                sessionStorage.setItem('userRole', 'admin');
                sessionStorage.setItem('username', username);
                // Adiciona um pequeno atraso para o usuário ver o toast antes de redirecionar
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redireciona para o dashboard principal
                }, 500); // 0.5 segundos
            
            } else if (username === 'funcionario' && password === '123') { 
                // Login de Funcionário (PARA TESTE)
                showToast('Login com sucesso! Carregando...', 'success');
                sessionStorage.setItem('userRole', 'employee');
                sessionStorage.setItem('username', username);
                // Adiciona um pequeno atraso
                setTimeout(() => {
                    window.location.href = 'Funcionario.html'; // Redireciona para o dashboard limitado
                }, 500); // 0.5 segundos
            
            } else {
                // Login Inválido
                showToast('Usuário ou senha inválidos', 'error');
                // Reabilita o botão se o login falhar
                submitButton.disabled = false;
                submitButton.textContent = 'Entrar';
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
