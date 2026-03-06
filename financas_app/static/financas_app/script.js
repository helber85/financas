import {
    carregarTransacoes as apiCarregarTransacoes,
    carregarTransacaoPorId as apiCarregarTransacaoPorId,
    deletarTransacao as apiDeletarTransacao,
    cadastrarTransacao as apiCadastrarTransacao,
    atualizarTransacao as apiAtualizarTransacao,
} from './api.js';

document.addEventListener('DOMContentLoaded', () => {

    // ===============================
    // ELEMENTOS
    // ===============================

    const expenseModal = document.getElementById('expenseModal');
    const themeSwitch = document.getElementById('themeSwitch');
    const themeIcon = document.getElementById('themeIcon');

    const categoryChartCanvas = document.getElementById('categoryChart').getContext('2d');
    const savingsChartCanvas = document.getElementById('savingsChart').getContext('2d');
    const yearFilter = document.getElementById('yearFilter');
    const monthFilter = document.getElementById('monthFilter');
    const categorySearch = document.getElementById('categorySearch');
    const totalExpensesEl = document.getElementById('totalExpenses');
    const expenseForm = document.getElementById('expenseForm');
    const expenseModalLabel = document.getElementById('expenseModalLabel');
    const expenseTableBody = document.getElementById('expenseTableBody');
    const expenseCards = document.getElementById('expenseCards');
    const emptyState = document.getElementById('emptyState');

    const expenseId = document.getElementById('expenseId');
    const type = document.getElementById('type');
    const description = document.getElementById('description');
    const amount = document.getElementById('amount');
    const category = document.getElementById('category');
    const date = document.getElementById('date');

    let expenses = [];
    let categoryChart;
    let savingsChart;
    let expenseCardsList = [];

    // ===============================
    // MODAL
    // ===============================

    function openModal() {
        expenseModal.classList.remove('hidden');
        expenseModal.classList.add('flex');
        description.focus();
    }

    function closeModal() {
        expenseModal.classList.add('hidden');
        expenseModal.classList.remove('flex');
    }

    expenseModal.addEventListener('click', (e) => {
        if (e.target === expenseModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ===============================
    // UTIL
    // ===============================

    function formatCurrency(value) {
        return parseFloat(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function formatDate(dateString) {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    }

    function createCard(exp) {
        const isPositive = exp.type === 'receita' || exp.type === '+poupanca';
        const colorClass = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 ml-2 mr-2 mb-4">
                <!-- Topo -->
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-lg">
                            ${exp.description}
                        </h3>

                        <p class="text-sm text-gray-500">
                            ${exp.category}
                        </p>
                    </div>
                    <span class="font-bold text-red-600 dark:text-red-400 ${colorClass}">
                        ${isPositive ? '+' : '-'} ${formatCurrency(exp.amount)}
                    </span>
                </div>
                <!-- Info -->
                <div class="mt-3 flex justify-between text-sm text-gray-500">
                    <span class="flex items-center gap-1">
                        <i class="bi bi-arrow-down-circle"></i>
                        ${exp.type}
                    </span>
                    <span>
                        ${formatDate(exp.date)}
                    </span>
                </div>
                <!-- Ações -->
                <div class="mt-4 flex gap-4">
                    <button class="group relative w-full flex justify-center border border-transparent text-sm font-medium rounded-lg text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg shadow-blue-500/30 p-0" data-action="edit" data-id="${exp.id}">
                        <i class="bi bi-pencil-fill text-lg"></i>
                    </button>
                    <button class="group relative w-full flex justify-center border border-transparent text-sm font-medium rounded-lg text-white bg-red-800 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-lg shadow-blue-500/30 p-0" data-action="delete" data-id="${exp.id}">
                        <i class="bi bi-trash-fill text-lg"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ===============================
    // DASHBOARD (HOISTED)
    // ===============================

    function updateDashboard() {

        const selectedYear = yearFilter.value;
        const selectedMonth = monthFilter.value;
        const searchTerm = categorySearch.value.toLowerCase();

        let filteredExpenses = expenses;

        if (selectedYear) {
            filteredExpenses = filteredExpenses.filter(exp =>
                new Date(exp.date).getFullYear() == selectedYear
            );
        }

        if (selectedMonth !== "") {
            filteredExpenses = filteredExpenses.filter(exp =>
                new Date(exp.date).getMonth() == selectedMonth
            );
        }

        if (searchTerm) {
            filteredExpenses = filteredExpenses.filter(exp =>
                exp.category.toLowerCase().includes(searchTerm)
            );
        }

        // Calcula o Saldo (Receitas - Despesas), ignorando Poupança
        const total = filteredExpenses.reduce(
            (acc, exp) => {
                const val = parseFloat(exp.amount);
                // if (exp.type === '+poupanca') return acc;
                return exp.type === 'receita' || exp.type === '-poupanca' ? acc + val : acc - val;
            }, 0
        );

        totalExpensesEl.textContent = formatCurrency(total);
        
        // Filtra apenas despesas para o gráfico de categorias
        updateChart(filteredExpenses.filter(e => e.type === 'despesa'));
        updateSavingsChart(expenses);
        renderExpenses(filteredExpenses);
    }

    function updateChart(filteredExpenses) {

        const isDark = document.documentElement.classList.contains('dark');
        const labelColor = isDark ? '#f8f9fa' : '#212529';

        const expensesByCategory = filteredExpenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
            return acc;
        }, {});

        if (categoryChart) categoryChart.destroy();

        categoryChart = new Chart(categoryChartCanvas, {
            type: 'pie',
            plugins: [ChartDataLabels],
            data: {
                labels: Object.keys(expensesByCategory),
                datasets: [{
                    data: Object.values(expensesByCategory),
                    backgroundColor: [
                        '#9763ff', '#36A2EB', '#FFCE56',
                        '#4BC0C0', '#9966FF', '#FF9F40',
                        '#FF6384', '#C9CBCF', '#8BC34A',
                        '#00ACC1', '#F06292', '#FFA726'
                    ],
                    borderColor: isDark ? '#1f2937' : '#ffffff',
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: { color: labelColor }
                    },
                    datalabels: {
                        color: '#fff',
                        font: {
                            weight: 'bold'
                        },
                        formatter: (value) => {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        });
    }

    function updateSavingsChart(filteredExpenses) {
        const isDark = document.documentElement.classList.contains('dark');
        const labelColor = isDark ? '#f8f9fa' : '#212529';

        // Filtra e soma os valores das categorias específicas de poupança
        let plusSavings = 0;
        let minusSavings = 0;

        filteredExpenses.forEach(exp => {
            if (exp.type === '+poupanca') {
                plusSavings += parseFloat(exp.amount);
            } else if (exp.type === '-poupanca') {
                minusSavings += parseFloat(exp.amount);
            }
        });

        const totalSavings = plusSavings - minusSavings;

        if (savingsChart) savingsChart.destroy();

        savingsChart = new Chart(savingsChartCanvas, {
            type: 'bar',
            plugins: [ChartDataLabels],
            data: {
                labels: ['+ Poupança (Entrada)', '- Poupança (Saída)', 'Total'],
                datasets: [{
                    label: 'Valor',
                    data: [plusSavings, minusSavings, totalSavings],
                    backgroundColor: ['#9763ff', '#f88383', '#3bf6ae'], // Verde, Vermelho, Azul
                    borderColor: isDark ? '#1f2937' : '#ffffff',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        color: isDark ? '#fff' : '#000',
                        anchor: 'end',
                        align: 'top',
                        formatter: (value) => formatCurrency(value),
                        font: { weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: labelColor }
                    },
                    x: {
                        ticks: { color: labelColor }
                    }
                }
            }
        });
    }

    function renderExpenses(filteredExpenses = expenses) {

        expenseTableBody.innerHTML = '';
        expenseCards.innerHTML = '';

        if (filteredExpenses.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }

        filteredExpenses.forEach(exp => {

            let a = createCard(exp);
            expenseCards.insertAdjacentHTML("beforeend", a);

            const isPositive = exp.type === 'receita' || exp.type === '+poupanca';
            const colorClass = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

            const row = document.createElement('tr');

            row.innerHTML = `
                <td class="px-4 py-2">${exp.description}</td>
                <td class="px-4 py-2"><span class="flex items-center gap-2 ${colorClass}">${isPositive ? '<i class="bi bi-arrow-up-circle"></i>' : '<i class="bi bi-arrow-down-circle"></i>'} ${exp.type}</span></td>
                <td class="px-4 py-2 font-medium ${colorClass}">${isPositive ? '+' : '-'} ${formatCurrency(exp.amount)}</td>
                <td class="px-4 py-2">${exp.category}</td>
                <td class="px-4 py-2">${formatDate(exp.date)}</td>
                <td class="px-4 py-2 space-x-2">
                    <button class="text-blue-500 hover:text-blue-700"
                        data-action="edit" data-id="${exp.id}">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="text-red-500 hover:text-red-700"
                        data-action="delete" data-id="${exp.id}">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            `;

            expenseTableBody.appendChild(row);
        });
    }

    // ===============================
    // DARK MODE
    // ===============================

    function setTheme(theme) {

        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            themeIcon.className = 'bi bi-moon-stars-fill';
        } else {
            document.documentElement.classList.remove('dark');
            themeIcon.className = 'bi bi-brightness-high-fill';
        }

        updateDashboard();
    }

    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage.getItem('theme') || (systemPrefersDark ? 'dark' : 'light');

    setTheme(currentTheme);

    themeSwitch.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'light' : 'dark');
    });

    // ===============================
    // CRUD
    // ===============================

    document.getElementById('addExpenseBtn').addEventListener('click', () => {
        expenseForm.reset();
        expenseId.value = '';
        expenseModalLabel.textContent = 'Adicionar Despesa';
        type.value = 'despesa'; // Default
        date.value = new Date().toISOString().split('T')[0];
        openModal();
    });

    expenseForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const id = expenseId.value;

        const expenseData = {
            description: description.value,
            type: type.value,
            amount: parseFloat(amount.value),
            category: category.value,
            date: date.value
        };

        let success = false;

        if (id) {
            const updated = await apiAtualizarTransacao(id, expenseData);
            if (updated) {
                const index = expenses.findIndex(exp => exp.id == id);
                expenses[index] = updated;
                success = true;
            }
        } else {
            const created = await apiCadastrarTransacao(expenseData);
            if (created) {
                expenses.push(created);
                success = true;
            }
        }

        if (success) {
            renderAll();
            closeModal();
        }
    });

    async function handleEditExpense(id) {
        const expense = await apiCarregarTransacaoPorId(id);
        if (!expense) return;

        expenseId.value = expense.id;
        type.value = expense.type || 'despesa';
        description.value = expense.description;
        amount.value = expense.amount;
        category.value = expense.category;
        date.value = expense.date;

        expenseModalLabel.textContent = 'Editar Despesa';
        openModal();
    }

    async function handleDeleteExpense(id) {
        if (!confirm('Deseja excluir?')) return;

        const success = await apiDeletarTransacao(id);
        if (success) {
            expenses = expenses.filter(exp => exp.id != id);
            renderAll();
        }
    }

    function handleActionClick(e) {

        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const { action, id } = button.dataset;

        if (action === 'edit') handleEditExpense(id);
        if (action === 'delete') handleDeleteExpense(id);
    }

    expenseTableBody.addEventListener('click', handleActionClick);
    expenseCards.addEventListener('click', handleActionClick);


    // ===============================
    // FILTROS
    // ===============================

    function populateYearFilter() {
        const years = [...new Set(expenses.map(exp =>
            new Date(exp.date).getFullYear()
        ))];

        const currentYear = new Date().getFullYear();

        yearFilter.innerHTML = '<option value="">Todos</option>';

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            yearFilter.appendChild(option);
        });
    }

    function populateMonthFilter() {

        const months = [
            'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
            'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
        ];

        const currentMonth = new Date().getMonth();

        monthFilter.innerHTML = '<option value="">Todos</option>';

        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            if (index === currentMonth) option.selected = true;
            monthFilter.appendChild(option);
        });
    }

    function renderAll() {
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        populateYearFilter();
        populateMonthFilter();
        updateDashboard();
    }

    // ===============================
    // INIT
    // ===============================

    async function initializeApp() {
        const data = await apiCarregarTransacoes();
        if (data) expenses = data;
        renderAll();
    }

    yearFilter.addEventListener('change', updateDashboard);
    monthFilter.addEventListener('change', updateDashboard);
    categorySearch.addEventListener('input', updateDashboard);

    initializeApp();
});
