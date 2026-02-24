// --- State Management ---
const INITIAL_STATE = {
    totalBudgetLimit: 2000000,
    allocated: { 'Venue': 600000, 'Catering': 400000, 'Marketing': 300000, 'Talent': 300000, 'Tech': 400000 },
    expenses: [
        { id: '101', category: 'Venue', desc: 'Main Hall Deposit', amount: 300000 },
        { id: '102', category: 'Tech', desc: 'LED Wall Hire', amount: 150000 }
    ],
    sponsorship: 800000
};

let state = JSON.parse(localStorage.getItem('team_event_pro')) || INITIAL_STATE;
let charts = {};
let isSidebarOpen = false;

// --- Sidebar Interaction ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menuIcon = document.getElementById('menu-icon');
    
    isSidebarOpen = !isSidebarOpen;
    
    if (isSidebarOpen) {
        sidebar.style.transform = 'translateX(0)';
        overlay.classList.remove('hidden');
        menuIcon.setAttribute('data-lucide', 'x');
    } else {
        sidebar.style.transform = 'translateX(-100%)';
        overlay.classList.add('hidden');
        menuIcon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
}

// --- Page Navigation ---
function navigate(pageId) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.remove('hidden');
    document.getElementById('btn-' + pageId).classList.add('active');
    
    // Auto-close sidebar on mobile after clicking link
    if (window.innerWidth < 1024 && isSidebarOpen) toggleSidebar();
    
    if(pageId === 'network') fetchExternalPartners();
    updateDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- External Data Fetching (Member 3 Task) ---
async function fetchExternalPartners() {
    const grid = document.getElementById('partner-grid');
    grid.innerHTML = Array(6).fill(0).map(() => `<div class="minimal-card p-6 md:p-10 h-48 loading-skeleton rounded-sm"></div>`).join('');
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
        
        grid.innerHTML = data.slice(0, 6).map(partner => `
            <div class="minimal-card p-6 md:p-10 rounded-sm">
                <p class="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-4">Partner #${partner.id}</p>
                <h4 class="text-lg md:text-xl font-black mb-1 text-white">${partner.name}</h4>
                <p class="text-xs text-neutral-500 mb-6 font-medium">${partner.company.name}</p>
                <div class="flex items-center gap-2 text-[10px] font-bold text-blue-500">
                    <i data-lucide="verified" class="w-3 h-3"></i> VERIFIED VENDOR
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    } catch (error) {
        grid.innerHTML = `<p class="text-red-500 font-bold p-10">Error fetching external partner data.</p>`;
    }
}

// --- Initialization & UI Rendering ---
function init() {
    lucide.createIcons();
    populateConfigForm();
    populateCategorySelects();
    updateDashboard();
}

function toggleModal(id) {
    const m = document.getElementById(id);
    m.classList.toggle('hidden');
    m.classList.toggle('flex');
    
    if (!m.classList.contains('hidden')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function populateConfigForm() {
    const container = document.getElementById('allocationInputs');
    if (!container) return;
    container.innerHTML = Object.entries(state.allocated).map(([cat, val]) => `
        <div class="p-4 md:p-5 bg-neutral-950 rounded-sm border border-neutral-900">
            <label class="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">${cat}</label>
            <input type="number" data-cat="${cat}" class="alloc-input w-full bg-transparent border-none p-0 text-white font-black text-base md:text-lg focus:ring-0" value="${val}">
        </div>
    `).join('');
    document.getElementById('configTotalBudget').value = state.totalBudgetLimit;
    document.getElementById('configSponsorship').value = state.sponsorship;
}

function populateCategorySelects() {
    const s = document.getElementById('expCategory');
    if (!s) return;
    s.innerHTML = Object.keys(state.allocated).map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function updateDashboard() {
    const totalUtilized = state.expenses.reduce((a, b) => a + b.amount, 0);
    const balance = state.totalBudgetLimit - totalUtilized;
    const catTotals = {};
    Object.keys(state.allocated).forEach(cat => catTotals[cat] = 0);
    state.expenses.forEach(ex => catTotals[ex.category] += ex.amount);

    // KPI Cards rendering - Use fluid text sizes to fit on mobile
    const kpiContainer = document.getElementById('kpi-container');
    if(kpiContainer) {
        const kpis = [
            { l: 'Budget Limit', v: state.totalBudgetLimit },
            { l: 'Capital Utilized', v: totalUtilized },
            { l: 'Sponsorship', v: state.sponsorship },
            { l: 'Net Available', v: balance, u: balance < 0 }
        ];
        kpiContainer.innerHTML = kpis.map(k => `
            <div class="minimal-card p-5 md:p-12 rounded-sm">
                <p class="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-3 md:mb-6">${k.l}</p>
                <h3 class="text-xl md:text-3xl font-black ${k.u ? 'text-red-500' : 'text-white'}">₹${Math.abs(k.v).toLocaleString('en-IN')}</h3>
            </div>
        `).join('');
    }

    // Ledger rendering
    const body = document.getElementById('transaction-body');
    if(body) {
        body.innerHTML = state.expenses.slice().reverse().map(ex => `
            <tr class="border-b border-neutral-900 group hover:bg-neutral-900/50 transition-all">
                <td class="px-6 md:px-10 py-5 md:py-7 font-mono text-[10px] text-neutral-600">REF-${ex.id}</td>
                <td class="px-6 md:px-10 py-5 md:py-7 text-[10px] font-black text-white uppercase tracking-widest">${ex.category}</td>
                <td class="px-6 md:px-10 py-5 md:py-7 text-neutral-500 font-medium">${ex.desc}</td>
                <td class="px-6 md:px-10 py-5 md:py-7 text-right font-black text-white">₹${ex.amount.toLocaleString('en-IN')}</td>
                <td class="px-6 md:px-10 py-5 md:py-7 text-center">
                    <button onclick="deleteExpense('${ex.id}')" class="text-neutral-800 hover:text-white transition-colors p-2"><i data-lucide="x" class="w-3 h-3 mx-auto"></i></button>
                </td>
            </tr>
        `).join('');
        document.getElementById('transaction-count').innerText = `${state.expenses.length} RECORDS`;
        lucide.createIcons();
    }

    renderCharts(catTotals);
    localStorage.setItem('team_event_pro', JSON.stringify(state));
}

function renderCharts(catTotals) {
    const labels = Object.keys(state.allocated);
    const ctxA = document.getElementById('allocationChart');
    const ctxC = document.getElementById('categoryChart');
    if(!ctxA || !ctxC) return;

    if (charts.A) charts.A.destroy();
    charts.A = new Chart(ctxA, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Allocated', data: labels.map(l => state.allocated[l]), backgroundColor: '#111', barThickness: 8 },
                { label: 'Utilized', data: labels.map(l => catTotals[l]), backgroundColor: '#fff', barThickness: 8 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#444', font: { size: 8, weight: 800 } } } }
        }
    });

    if (charts.C) charts.C.destroy();
    charts.C = new Chart(ctxC, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: labels.map(l => catTotals[l] || 1),
                backgroundColor: ['#fff', '#999', '#666', '#333', '#111'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '90%', plugins: { legend: { display: false } } }
    });
}

// --- Event Listeners ---
document.getElementById('configForm').addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelectorAll('.alloc-input').forEach(i => state.allocated[i.dataset.cat] = parseFloat(i.value) || 0);
    state.totalBudgetLimit = parseFloat(document.getElementById('configTotalBudget').value) || 0;
    state.sponsorship = parseFloat(document.getElementById('configSponsorship').value) || 0;
    toggleModal('configModal');
    updateDashboard();
});

document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    state.expenses.push({
        id: Math.floor(100+Math.random()*899).toString(),
        category: document.getElementById('expCategory').value,
        desc: document.getElementById('expDesc').value,
        amount: parseFloat(document.getElementById('expAmount').value)
    });
    e.target.reset();
    toggleModal('expenseModal');
    updateDashboard();
});

function deleteExpense(id) { 
    state.expenses = state.expenses.filter(ex => ex.id !== id); 
    updateDashboard(); 
}

function resetAllData() { 
    if(confirm('PURGE DATA?')) { 
        state = JSON.parse(JSON.stringify(INITIAL_STATE)); 
        localStorage.clear();
        updateDashboard(); 
    } 
}

window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.style.transform = 'translateX(0)';
        overlay.classList.add('hidden');
        isSidebarOpen = false;
    } else if (!isSidebarOpen) {
        document.getElementById('sidebar').style.transform = 'translateX(-100%)';
    }
});

// Initialize the app on load
window.onload = init;