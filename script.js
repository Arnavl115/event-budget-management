// --- Firebase Config & Auth Management ---
const firebaseConfig = {
    apiKey: "AIzaSyA0lWt-z6pVY1JrZ2AsYAtAbUdosM-Fx74",
    authDomain: "eventpro-64f68.firebaseapp.com",
    projectId: "eventpro-64f68",
    storageBucket: "eventpro-64f68.firebasestorage.app",
    messagingSenderId: "351397669155",
    appId: "1:351397669155:web:c9c81270a0d267fcffc496",
    measurementId: "G-LPTVKJK3Y8"
};

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} catch (err) {
    console.warn("Firebase config might be invalid placeholders:", err);
}

const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(async user => {
    const overlay = document.getElementById('auth-overlay');
    const app = document.getElementById('app-content');
    if (user) {
        // Fetch user data from Firestore
        try {
            const docRef = db.collection('users').doc(user.uid);
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                state = docSnap.data();
            } else {
                // Initialize new user with default state
                state = JSON.parse(JSON.stringify(INITIAL_STATE));
                await docRef.set(state);
            }
        } catch (err) {
            console.error("Error fetching data from Firestore:", err);
        }
        
        overlay.classList.add('hidden');
        app.classList.remove('hidden');
        init(); 
    } else {
        overlay.classList.remove('hidden');
        app.classList.add('hidden');
    }
});

function showAuthError(msg) {
    const errorEl = document.getElementById('auth-error');
    if(errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnSignIn = document.getElementById('btn-signin');
    const btnSignUp = document.getElementById('btn-signup');
    const btnGoogle = document.getElementById('btn-google-signin');
    const btnSignOut = document.getElementById('btn-signout');
    
    if (btnSignIn) {
        btnSignIn.addEventListener('click', () => {
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            if(!email || !password) return showAuthError('Email and Password required');
            auth.signInWithEmailAndPassword(email, password).catch(err => showAuthError(err.message));
        });
    }

    if (btnSignUp) {
        btnSignUp.addEventListener('click', () => {
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            if(!email || !password) return showAuthError('Email and Password required');
            auth.createUserWithEmailAndPassword(email, password).catch(err => showAuthError(err.message));
        });
    }

    if (btnGoogle) {
        btnGoogle.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider).catch(err => showAuthError(err.message));
        });
    }

    if (btnSignOut) {
        btnSignOut.addEventListener('click', () => {
            auth.signOut().catch(err => console.error(err));
        });
    }
});

// --- Dark Mode Toggle ---
function toggleDarkMode() {
    const body = document.body;
    const btn = document.getElementById('darkModeToggle');
    const isDark = body.classList.contains('dark-mode');
    if (isDark) {
        body.classList.remove('dark-mode');
        localStorage.setItem('eventpro_theme', 'light');
        if (btn) btn.querySelector('i').setAttribute('data-lucide', 'moon');
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('eventpro_theme', 'dark');
        if (btn) btn.querySelector('i').setAttribute('data-lucide', 'sun');
    }
    lucide.createIcons();
}

// On load, apply theme from localStorage
if (localStorage.getItem('eventpro_theme') === 'dark') {
    document.body.classList.add('dark-mode');
    setTimeout(() => {
        const btn = document.getElementById('darkModeToggle');
        if (btn && btn.querySelector('i')) {
            btn.querySelector('i').setAttribute('data-lucide', 'sun');
            lucide.createIcons();
        }
    }, 100);
}
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

let state = JSON.parse(JSON.stringify(INITIAL_STATE));
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
    // Hook import input
    const importEl = document.getElementById('importFile');
    if (importEl) {
        importEl.removeEventListener('change', handleImportFile);
        importEl.addEventListener('change', handleImportFile);
    }
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
    
    // Save state to Firestore for the authenticated user
    if (auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).set(state)
            .catch(err => console.error("Error saving to Firestore:", err));
    }
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

// Initialize the app on load is now handled by Firebase Auth observer
// window.onload = init;

// --- Excel Export (with charts) ---
async function downloadSheet() {
    try {
        const totalUtilized = state.expenses.reduce((a, b) => a + b.amount, 0);
        const balance = state.totalBudgetLimit - totalUtilized;
        const catTotals = {};
        Object.keys(state.allocated).forEach(cat => catTotals[cat] = 0);
        state.expenses.forEach(ex => catTotals[ex.category] += ex.amount);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'EventPro';
        const ws = workbook.addWorksheet('Budget Overview');

        // KPIs
        ws.getCell('A1').value = 'Metric';
        ws.getCell('B1').value = 'Value (₹)';
        const kpis = [
            ['Budget Limit', state.totalBudgetLimit],
            ['Capital Utilized', totalUtilized],
            ['Sponsorship', state.sponsorship],
            ['Net Available', balance]
        ];
        let r = 2;
        kpis.forEach(k => {
            ws.getCell('A' + r).value = k[0];
            ws.getCell('B' + r).value = k[1];
            r++;
        });

        r += 1;
        ws.getCell('A' + r).value = 'Category';
        ws.getCell('B' + r).value = 'Allocated';
        ws.getCell('C' + r).value = 'Utilized';
        r++;
        const labels = Object.keys(state.allocated);
        labels.forEach(l => {
            ws.getCell('A' + r).value = l;
            ws.getCell('B' + r).value = state.allocated[l];
            ws.getCell('C' + r).value = catTotals[l] || 0;
            r++;
        });

        // Expenses sheet
        const wsExp = workbook.addWorksheet('Expenses');
        wsExp.addRow(['Ref', 'Sector', 'Description', 'Value (₹)']);
        state.expenses.forEach(ex => wsExp.addRow([`REF-${ex.id}`, ex.category, ex.desc, ex.amount]));

        // Embed charts as images (capture canvases)
        const allocationCanvas = document.getElementById('allocationChart');
        const categoryCanvas = document.getElementById('categoryChart');

        if (allocationCanvas && categoryCanvas) {
            // Convert canvases to base64 PNGs
            const dataA = allocationCanvas.toDataURL('image/png');
            const dataC = categoryCanvas.toDataURL('image/png');

            // ExcelJS expects base64 without the data: prefix
            const imgIdA = workbook.addImage({ base64: dataA.split(',')[1], extension: 'png' });
            const imgIdC = workbook.addImage({ base64: dataC.split(',')[1], extension: 'png' });

            // Place images on the Budget Overview sheet
            // Positioning: columns/rows are 0-indexed for tl in exceljs when using col/row
            ws.addImage(imgIdA, { tl: { col: 3, row: 0 }, ext: { width: 520, height: 300 } });
            ws.addImage(imgIdC, { tl: { col: 3, row: 16 }, ext: { width: 340, height: 300 } });
        }

        // Auto-width for a few columns
        [ 'A', 'B', 'C' ].forEach(col => ws.getColumn(col).width = 20);
        wsExp.getColumn(1).width = 15; wsExp.getColumn(2).width = 15; wsExp.getColumn(3).width = 40; wsExp.getColumn(4).width = 15;

        const buf = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buf], { type: 'application/octet-stream' }), `EventPro_Budget_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (err) {
        console.error('Export failed', err);
        alert('Unable to export sheet — see console for details.');
    }
}

// --- Import (xlsx / csv) ---
async function handleImportFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    try {
        if (name.endsWith('.csv')) {
            const txt = await file.text();
            importFromCSV(txt);
        } else {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            importFromWorkbook(workbook);
        }
        e.target.value = null;
        alert('Import successful — dashboard updated.');
    } catch (err) {
        console.error('Import failed', err);
        alert('Import failed — see console for details.');
    }
}

function importFromWorkbook(workbook) {
    // Parse Budget Overview
    const ws = workbook.getWorksheet('Budget Overview') || workbook.worksheets[0];
    const parsedKPIs = {};
    const parsedAlloc = {};
    if (ws) {
        let parsingMetrics = false;
        let parsingCategories = false;
        for (let r = 1; r <= ws.rowCount; r++) {
            const row = ws.getRow(r);
            const a = row.getCell(1).value;
            const b = row.getCell(2).value;
            if (!a && !b) continue;
            const aStr = (a && a.toString && a.toString().trim()) || '';
            if (aStr.toLowerCase() === 'metric') { parsingMetrics = true; parsingCategories = false; continue; }
            if (aStr.toLowerCase() === 'category') { parsingCategories = true; parsingMetrics = false; continue; }
            if (parsingMetrics && aStr) {
                parsedKPIs[aStr] = Number(b) || 0;
            }
            if (parsingCategories && aStr) {
                parsedAlloc[aStr] = Number(row.getCell(2).value) || 0;
            }
        }
    }

    // Parse Expenses sheet
    const wsExp = workbook.getWorksheet('Expenses') || workbook.worksheets.find(s => s.name && s.name.toLowerCase().includes('expense'));
    const parsedExpenses = [];
    if (wsExp) {
        for (let r = 2; r <= wsExp.rowCount; r++) {
            const row = wsExp.getRow(r);
            const ref = row.getCell(1).value;
            const sector = row.getCell(2).value;
            const desc = row.getCell(3).value;
            const val = Number(row.getCell(4).value) || 0;
            if (!ref && !sector && !desc && !val) continue;
            const idStr = (ref || '').toString().replace(/^REF-?/i, '').trim();
            parsedExpenses.push({ id: idStr || Math.floor(100+Math.random()*899).toString(), category: sector || 'Unk', desc: desc || '', amount: val });
        }
    }

    // Apply parsed data to state
    if (Object.keys(parsedAlloc).length) state.allocated = parsedAlloc;
    if (parsedKPIs['Budget Limit']) state.totalBudgetLimit = Number(parsedKPIs['Budget Limit']) || state.totalBudgetLimit;
    if (parsedKPIs['Sponsorship']) state.sponsorship = Number(parsedKPIs['Sponsorship']) || state.sponsorship;
    if (parsedExpenses.length) state.expenses = parsedExpenses;

    populateConfigForm();
    populateCategorySelects();
    updateDashboard();
}

function importFromCSV(txt) {
    // Simple CSV import: assume header Ref,Sector,Description,Value and import as expenses only
    const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const refIdx = header.indexOf('ref');
    const sectorIdx = header.indexOf('sector');
    const descIdx = header.indexOf('description');
    const valIdx = header.findIndex(h => h.includes('value') || h.includes('amount'));
    const parsedExpenses = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const ref = cols[refIdx] || '';
        const sector = cols[sectorIdx] || 'Unk';
        const desc = cols[descIdx] || '';
        const val = parseFloat((cols[valIdx] || '').replace(/[^0-9.-]/g, '')) || 0;
        if (!ref && !sector && !desc && !val) continue;
        const idStr = ref.toString().replace(/^REF-?/i, '').trim() || Math.floor(100+Math.random()*899).toString();
        parsedExpenses.push({ id: idStr, category: sector, desc, amount: val });
    }
    if (parsedExpenses.length) {
        state.expenses = parsedExpenses;
        updateDashboard();
    }
}