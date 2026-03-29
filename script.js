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

// --- Theme Cycle ---
const themes = ['oled', 'coffee', 'light', 'notebook', 'vibrant'];
let currentThemeIdx = 0;

function cycleTheme() {
    const body = document.body;
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    const theme = themes[currentThemeIdx];
    
    body.classList.remove('theme-oled', 'theme-coffee', 'theme-light', 'theme-notebook', 'theme-vibrant');
    if (theme !== 'oled') {
        body.classList.add(`theme-${theme}`);
    }
    
    localStorage.setItem('eventpro_theme', theme);
    
    const btn = document.getElementById('themeToggle');
    if (btn) {
        const span = btn.querySelector('span');
        if (span) span.innerText = `Theme: ${theme.toUpperCase()}`;
    }
}

// On load, apply theme from localStorage
const savedTheme = localStorage.getItem('eventpro_theme') || 'oled';
if (savedTheme && savedTheme !== 'oled') {
    document.body.classList.add(`theme-${savedTheme}`);
    currentThemeIdx = themes.indexOf(savedTheme);
}
setTimeout(() => {
    const btn = document.getElementById('themeToggle');
    if (btn) {
        const span = btn.querySelector('span');
        if (span) span.innerText = `Theme: ${savedTheme.toUpperCase()}`;
    }
}, 100);
// --- State Management ---
const INITIAL_STATE = {
    totalBudgetLimit: 2000000,
    allocated: { 'Venue': 600000, 'Catering': 400000, 'Marketing': 300000, 'Talent': 300000, 'Tech': 400000 },
    expenses: [
        { id: '101', category: 'Venue', desc: 'Main Hall Deposit', amount: 300000 },
        { id: '102', category: 'Tech', desc: 'LED Wall Hire', amount: 150000 }
    ],
    sponsorship: 800000,
    resources: {
        avSystems: 92,
        network: 65,
        staffCurrent: 48,
        staffTotal: 50
    },
    inventory: [
        { id: '1011', name: 'Main PA System', assignee: 'Sound Team', status: 'Active' },
        { id: '1012', name: 'Stage Monitors', assignee: 'Stage Crew', status: 'Idle' }
    ]
};

const EVENT_TEMPLATES = {
    'wedding': {
        totalBudgetLimit: 3000000,
        sponsorship: 500000,
        allocated: { 'Venue': 1000000, 'Catering': 800000, 'Decor': 500000, 'Photography': 300000, 'Entertainment': 400000 },
        expenses: [
            { id: '401', category: 'Venue', desc: 'Resort Booking', amount: 500000 },
            { id: '402', category: 'Catering', desc: 'Tasting Advance', amount: 50000 },
            { id: '403', category: 'Photography', desc: 'Pre-wedding Shoot', amount: 150000 }
        ],
        resources: { avSystems: 20, network: 10, staffCurrent: 15, staffTotal: 25 },
        inventory: [
            { id: 'W01', name: 'Floral Arches', assignee: 'Decor Team', status: 'Active' },
            { id: 'W02', name: 'DJ Console', assignee: 'Entertainment', status: 'Idle' }
        ]
    },
    'concert': {
        totalBudgetLimit: 15000000,
        sponsorship: 8000000,
        allocated: { 'Talent': 6000000, 'Production': 4000000, 'Marketing': 2000000, 'Venue': 1500000, 'Security': 1500000 },
        expenses: [
            { id: '501', category: 'Talent', desc: 'Headliner Advance', amount: 2000000 },
            { id: '502', category: 'Venue', desc: 'Stadium Booking', amount: 750000 },
            { id: '503', category: 'Production', desc: 'Line Array Booking', amount: 500000 }
        ],
        resources: { avSystems: 95, network: 40, staffCurrent: 120, staffTotal: 150 },
        inventory: [
            { id: 'C01', name: 'Line Array PA', assignee: 'Audio Team', status: 'Active' },
            { id: 'C02', name: 'Moving Heads', assignee: 'Lighting Dept', status: 'Active' }
        ]
    },
    'tech': {
        totalBudgetLimit: 5000000,
        sponsorship: 2000000,
        allocated: { 'Venue': 1500000, 'Tech/WiFi': 1000000, 'Catering': 1000000, 'Marketing': 800000, 'Speakers': 700000 },
        expenses: [
            { id: '601', category: 'Venue', desc: 'Convention Center', amount: 750000 },
            { id: '602', category: 'Tech/WiFi', desc: 'High Density APs', amount: 400000 },
            { id: '603', category: 'Marketing', desc: 'Social Ads', amount: 200000 }
        ],
        resources: { avSystems: 40, network: 98, staffCurrent: 45, staffTotal: 50 },
        inventory: [
            { id: 'T01', name: 'Enterprise Routers', assignee: 'IT Team', status: 'Active' },
            { id: 'T02', name: 'Clickers', assignee: 'Stage Mgmt', status: 'Idle' }
        ]
    },
    'gala': {
        totalBudgetLimit: 2000000,
        sponsorship: 2000000,
        allocated: { 'Venue': 800000, 'Catering': 600000, 'Entertainment': 300000, 'Awards': 150000, 'Transport': 150000 },
        expenses: [
            { id: '701', category: 'Venue', desc: 'Banquet Hall', amount: 400000 },
            { id: '702', category: 'Awards', desc: 'Glass Trophies', amount: 75000 }
        ],
        resources: { avSystems: 30, network: 15, staffCurrent: 20, staffTotal: 30 },
        inventory: [
            { id: 'G01', name: 'LED Screens', assignee: 'Visuals', status: 'Active' },
            { id: 'G02', name: 'Podium', assignee: 'Stage Crew', status: 'Maintenance' }
        ]
    }
};

function applyTemplate(id) {
    if(confirm('Applying a new template will completely overwrite your current dashboard state. Are you sure you want to proceed?')) {
        state = JSON.parse(JSON.stringify(EVENT_TEMPLATES[id]));
        populateConfigForm();
        populateCategorySelects();
        populateResourceForm();
        updateDashboard();
        toggleModal('templateModal');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if(isSidebarOpen) toggleSidebar();
    }
}

function getDynamicDays() {
    if (!state.startDate || !state.endDate) {
        state.startDate = new Date().toISOString().split('T')[0];
        let d = new Date(); d.setDate(d.getDate() + 30);
        state.endDate = d.toISOString().split('T')[0];
    }
    const start = new Date(state.startDate);
    const end = new Date(state.endDate);
    const now = new Date();
    
    let eventDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (eventDays <= 0) eventDays = 1;
    
    let daysElapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    if (daysElapsed < 0) daysElapsed = 0;
    if (daysElapsed > eventDays) daysElapsed = eventDays;
    
    let calcDaysElapsed = daysElapsed === 0 ? 1 : daysElapsed;
    return { eventDays, daysElapsed, calcDaysElapsed };
}

function calculateForecast(totalUtilized) {
    const { eventDays, calcDaysElapsed } = getDynamicDays();
    return (totalUtilized / calcDaysElapsed) * eventDays;
}

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

let partnersData = [];

// --- External Data Fetching (Member 3 Task) ---
async function fetchExternalPartners() {
    const grid = document.getElementById('partner-grid');
    grid.innerHTML = Array(6).fill(0).map(() => `<div class="minimal-card p-6 md:p-10 h-48 loading-skeleton rounded-sm"></div>`).join('');
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
        partnersData = data;
        
        grid.innerHTML = data.slice(0, 6).map(partner => `
            <div onclick="showPartner(${partner.id})" class="minimal-card p-6 md:p-10 rounded-sm cursor-pointer hover:border-white transition-all group">
                <p class="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-4">Partner #${partner.id}</p>
                <h4 class="text-lg md:text-xl font-black mb-1 text-white group-hover:text-blue-500 transition-colors">${partner.name}</h4>
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

function showPartner(id) {
    const p = partnersData.find(x => x.id === id);
    if(!p) return;
    document.getElementById('partnerName').innerText = p.name;
    document.getElementById('partnerCompany').innerText = p.company.name;
    document.getElementById('partnerEmail').innerText = p.email;
    document.getElementById('partnerEmailBtn').href = `mailto:${p.email}`;
    document.getElementById('partnerPhone').innerText = p.phone;
    document.getElementById('partnerPhoneBtn').href = `tel:${p.phone}`;
    document.getElementById('partnerWebsite').innerText = p.website;
    document.getElementById('partnerWebsiteBtn').href = `http://${p.website}`;
    toggleModal('partnerModal');
}

// --- Initialization & UI Rendering ---
function init() {
    lucide.createIcons();
    populateConfigForm();
    populateCategorySelects();
    populateResourceForm();
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
    
    if (!state.startDate || !state.endDate) { getDynamicDays(); }
    document.getElementById('configStartDate').value = state.startDate;
    document.getElementById('configEndDate').value = state.endDate;
}

function populateCategorySelects() {
    const s = document.getElementById('expCategory');
    if (!s) return;
    s.innerHTML = Object.keys(state.allocated).map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function populateResourceForm() {
    if (!state.resources) state.resources = { avSystems: 92, network: 65, staffCurrent: 48, staffTotal: 50 };
    const rAv = document.getElementById('resAvSystems');
    if (rAv) rAv.value = state.resources.avSystems;
    const rNet = document.getElementById('resNetwork');
    if (rNet) rNet.value = state.resources.network;
    const rStaffCurr = document.getElementById('resStaffingCurrent');
    if (rStaffCurr) rStaffCurr.value = state.resources.staffCurrent;
    const rStaffTot = document.getElementById('resStaffingTotal');
    if (rStaffTot) rStaffTot.value = state.resources.staffTotal;
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
        const { eventDays, calcDaysElapsed, daysElapsed } = getDynamicDays();
        const forecast = calculateForecast(totalUtilized);
        const variance = state.totalBudgetLimit > 0 ? ((state.totalBudgetLimit - forecast) / state.totalBudgetLimit) * 100 : 0;
        const dailyBurnRate = calcDaysElapsed > 0 ? (totalUtilized / calcDaysElapsed) : 0;
        const fundingCoverage = totalUtilized > 0 ? (state.sponsorship / totalUtilized) : (state.sponsorship > 0 ? 999 : 0);
        const cashRunway = dailyBurnRate > 0 ? (state.sponsorship / dailyBurnRate) : 0;
        
        const kpis = [
            { l: 'Budget Limit', v: '₹' + state.totalBudgetLimit.toLocaleString('en-IN') },
            { l: 'Capital Utilized', v: '₹' + totalUtilized.toLocaleString('en-IN') },
            { l: 'Projected Final Cost', v: '₹' + Math.round(forecast).toLocaleString('en-IN'), u: forecast > state.totalBudgetLimit },
            { l: 'Budget Variance', v: Math.abs(variance).toFixed(1) + '%', u: variance < 0 },
            { l: 'Sponsorship', v: '₹' + state.sponsorship.toLocaleString('en-IN') },
            { l: 'Net Available', v: '₹' + Math.abs(balance).toLocaleString('en-IN'), u: balance < 0 },
            { l: 'Funding Coverage', v: fundingCoverage > 900 ? '∞' : fundingCoverage.toFixed(2) + 'x', u: fundingCoverage < 1 },
            { l: 'Cash Runway', v: cashRunway > 0 ? Math.round(cashRunway) + ' Days' : 'N/A', u: cashRunway < 30 }
        ];
        kpiContainer.innerHTML = kpis.map(k => `
            <div class="minimal-card p-4 md:p-6 rounded-sm">
                <p class="text-neutral-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">${k.l}</p>
                <h3 class="text-xl md:text-2xl font-black ${k.u ? 'text-red-500' : 'text-white'}">${k.v}</h3>
            </div>
        `).join('');
    }

    // Ledger rendering
    const body = document.getElementById('transaction-body');
    if(body) {
        body.innerHTML = state.expenses.slice().reverse().map(ex => `
            <tr class="border-b border-neutral-900 group hover:bg-neutral-900/50 transition-all">
                <td class="px-4 md:px-6 py-3 md:py-4 font-mono text-xs md:text-sm font-black text-neutral-400">REF-${ex.id}</td>
                <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-black text-white uppercase tracking-wider">${ex.category}</td>
                <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-neutral-300 font-medium">${ex.desc}</td>
                <td class="px-4 md:px-6 py-3 md:py-4 text-sm md:text-base text-right font-black text-white">₹${ex.amount.toLocaleString('en-IN')}</td>
                <td class="px-4 md:px-6 py-3 md:py-4 text-center">
                    <button onclick="deleteExpense('${ex.id}')" class="text-neutral-800 hover:text-white transition-colors p-2"><i data-lucide="x" class="w-3 h-3 mx-auto"></i></button>
                </td>
            </tr>
        `).join('');
        document.getElementById('transaction-count').innerText = `${state.expenses.length} RECORDS`;
        lucide.createIcons();
    }

    // Render Resources
    if (!state.resources) state.resources = { avSystems: 92, network: 65, staffCurrent: 48, staffTotal: 50 };
    const hwContainer = document.getElementById('hardware-utilization-container');
    if (hwContainer) {
        const staffPercent = state.resources.staffTotal > 0 ? (state.resources.staffCurrent / state.resources.staffTotal) * 100 : 0;
        hwContainer.innerHTML = `
            <div>
                <div class="flex justify-between text-[10px] md:text-xs font-bold mb-3 uppercase tracking-widest">
                    <span>AV Systems</span>
                    <span>${state.resources.avSystems}% Utilization</span>
                </div>
                <div class="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-white h-full" style="width: ${state.resources.avSystems}%"></div>
                </div>
            </div>
            <div>
                <div class="flex justify-between text-[10px] md:text-xs font-bold mb-3 uppercase tracking-widest">
                    <span>Network Infrastructure</span>
                    <span>${state.resources.network}% Utilization</span>
                </div>
                <div class="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-neutral-600 h-full" style="width: ${state.resources.network}%"></div>
                </div>
            </div>
            <div class="pt-2">
                <div class="flex justify-between text-[10px] md:text-xs font-bold mb-3 uppercase tracking-widest">
                    <span>Staff Deployment</span>
                    <span>${state.resources.staffCurrent} / ${state.resources.staffTotal} Active</span>
                </div>
                <div class="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-blue-500 h-full" style="width: ${Math.min(staffPercent, 100)}%"></div>
                </div>
            </div>
        `;
    }
    // Render Resources Inventory
    if (!state.inventory) state.inventory = [];
    const invBody = document.getElementById('inventory-body');
    if (invBody) {
        invBody.innerHTML = state.inventory.slice().reverse().map(inv => `
            <tr class="border-b border-neutral-900 group hover:bg-neutral-900/50 transition-all">
                <td class="px-4 md:px-6 py-3 md:py-4 font-mono text-xs md:text-sm text-neutral-400">AST-${inv.id}</td>
                <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-black text-white uppercase tracking-wider">${inv.name}</td>
                <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-neutral-300 font-medium">${inv.assignee}</td>
                <td class="px-4 md:px-6 py-3 md:py-4 text-center font-black text-xs md:text-sm ${inv.status === 'Active' ? 'text-emerald-500' : inv.status === 'Maintenance' ? 'text-red-500' : 'text-neutral-500'}">${inv.status}</td>
            </tr>
        `).join('');
        const invCount = document.getElementById('inventory-count');
        if (invCount) invCount.innerText = `${state.inventory.length} RECORDS`;
    }

    renderCharts(catTotals);
    
    // Save state to Firestore for the authenticated user
    if (auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).set(state)
            .catch(err => console.error("Error saving to Firestore:", err));
    }
}

function renderCharts(catTotals) {
    if (typeof Chart === 'undefined') return;
    
    Chart.defaults.color = '#737373';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.font.weight = 'bold';

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

    // Burn Rate Chart (Line)
    const ctxB = document.getElementById('burnRateChart');
    if (ctxB) {
        if (charts.B) charts.B.destroy();
        const { eventDays, daysElapsed, calcDaysElapsed } = getDynamicDays();
        let labels = [], historical = [], projection = [];
        const avg = Object.values(catTotals).reduce((a,b)=>a+b,0) / calcDaysElapsed;
        
        for (let i = 1; i <= daysElapsed; i += Math.ceil(daysElapsed/5)) {
            labels.push('Day ' + i);
            historical.push(avg * i);
            projection.push(null);
        }
        if (historical.length) projection[projection.length - 1] = historical[historical.length - 1];
        else { labels.push('Day 0'); historical.push(0); projection.push(0); }
        
        for (let i = daysElapsed + Math.ceil((eventDays - daysElapsed)/4); i <= eventDays; i += Math.ceil((eventDays - daysElapsed)/4)) {
            labels.push('Day ' + i);
            historical.push(null);
            projection.push(avg * i);
        }

        charts.B = new Chart(ctxB, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Actual Spend', data: historical, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, borderWidth: 3 },
                    { label: 'Projected', data: projection, borderColor: '#737373', borderDash: [5, 5], tension: 0.4, borderWidth: 2 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }, plugins: { legend: { labels: { color: '#a3a3a3', font: { size: 12, weight: 'bold' } } } } }
        });
    }

    // Variance Chart (Bar)
    const ctxV = document.getElementById('varianceChart');
    if (ctxV) {
        if (charts.V) charts.V.destroy();
        const varLabels = Object.keys(catTotals);
        const varData = varLabels.map(cat => state.allocated[cat] - catTotals[cat]);
        const bgColors = varData.map(v => v >= 0 ? '#10b981' : '#f43f5e');
        
        charts.V = new Chart(ctxV, {
            type: 'bar',
            data: {
                labels: varLabels,
                datasets: [{ label: 'Budget Variance', data: varData, backgroundColor: bgColors, borderRadius: 4 }]
            },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' } }, y: { grid: { display: false } } }, plugins: { legend: { display: false } } }
        });
    }

    // Deployment Chart
    const ctxD = document.getElementById('deploymentChart');
    if (ctxD) {
        if (charts.D) charts.D.destroy();
        const depStatusCounts = { 'Active': 0, 'Maintenance': 0, 'Idle': 0 };
        if (state.inventory) {
            state.inventory.forEach(i => depStatusCounts[i.status] = (depStatusCounts[i.status] || 0) + 1);
        }
        if (Object.values(depStatusCounts).reduce((a,b)=>a+b,0) === 0) depStatusCounts['Active'] = 1; // placeholder
        charts.D = new Chart(ctxD, {
            type: 'doughnut',
            data: {
                labels: Object.keys(depStatusCounts),
                datasets: [{
                    data: Object.values(depStatusCounts),
                    backgroundColor: ['#10b981', '#f43f5e', '#525252'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { legend: { position: 'bottom', labels: { color: '#737373', boxWidth: 10, font: {size: 10, weight: 'bold'} } } } }
        });
    }
}

let expandedChartInstance = null;

function openExpandedChart(chartKey, title) {
    if (!charts[chartKey]) return;
    
    document.getElementById('expandedChartTitle').innerText = title;
    
    const m = document.getElementById('chartExpandedModal');
    m.classList.remove('hidden');
    m.classList.add('flex');
    document.body.style.overflow = 'hidden';

    const ctx = document.getElementById('expandedChartCanvas').getContext('2d');
    if (expandedChartInstance) {
        expandedChartInstance.destroy();
    }
    
    const originalConfig = charts[chartKey].config;
    
    const newConfig = {
        type: originalConfig.type,
        data: JSON.parse(JSON.stringify(originalConfig.data)),
        options: JSON.parse(JSON.stringify(originalConfig.options))
    };

    newConfig.options.responsive = true;
    newConfig.options.maintainAspectRatio = false;
    
    if (!newConfig.options.plugins) newConfig.options.plugins = {};
    if (!newConfig.options.plugins.legend) newConfig.options.plugins.legend = {};
    
    newConfig.options.plugins.legend.display = true;
    newConfig.options.plugins.legend.labels = { color: '#a3a3a3', font: { size: 14, weight: 'bold' }, padding: 20 };
    
    if (chartKey === 'A') {
        if (newConfig.options.scales && newConfig.options.scales.y) newConfig.options.scales.y.display = true;
    } else if (chartKey === 'C' || chartKey === 'D') {
        newConfig.options.plugins.legend.position = 'right';
        newConfig.options.cutout = '60%'; // nicer in large view
    } else if (chartKey === 'V') {
        if (newConfig.options.scales && newConfig.options.scales.y) newConfig.options.scales.y.display = true;
    }

    // Force animation on newly opened modal for better effect
    newConfig.options.animation = {
        duration: 800,
        easing: 'easeOutQuart'
    };

    expandedChartInstance = new Chart(ctx, newConfig);
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function closeExpandedChart() {
    const m = document.getElementById('chartExpandedModal');
    m.classList.add('hidden');
    m.classList.remove('flex');
    document.body.style.overflow = '';
}

// --- Event Listeners ---
document.getElementById('configForm').addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelectorAll('.alloc-input').forEach(i => state.allocated[i.dataset.cat] = parseFloat(i.value) || 0);
    state.totalBudgetLimit = parseFloat(document.getElementById('configTotalBudget').value) || 0;
    state.sponsorship = parseFloat(document.getElementById('configSponsorship').value) || 0;
    state.startDate = document.getElementById('configStartDate').value || state.startDate;
    state.endDate = document.getElementById('configEndDate').value || state.endDate;
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
    
    // Trigger coin animation
    const coin = document.createElement('div');
    coin.textContent = '₹';
    coin.className = 'coin-anim';
    // Get button coordinates (approximate center of form)
    const rect = e.target.querySelector('button[type="submit"]').getBoundingClientRect();
    coin.style.left = `${rect.left + rect.width / 2}px`;
    coin.style.top = `${rect.top}px`;
    document.body.appendChild(coin);
    setTimeout(() => coin.remove(), 1000);

    e.target.reset();
    toggleModal('expenseModal');
    updateDashboard();
});

const assetForm = document.getElementById('assetForm');
if (assetForm) {
    assetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!state.inventory) state.inventory = [];
        state.inventory.push({
            id: Math.floor(1000+Math.random()*8999).toString(),
            name: document.getElementById('assetName').value,
            assignee: document.getElementById('assetAssignee').value,
            status: document.getElementById('assetStatus').value
        });
        e.target.reset();
        toggleModal('assetModal');
        updateDashboard();
    });
}

const resForm = document.getElementById('resourceForm');
if (resForm) {
    resForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!state.resources) state.resources = {};
        state.resources.avSystems = parseFloat(document.getElementById('resAvSystems').value) || 0;
        state.resources.network = parseFloat(document.getElementById('resNetwork').value) || 0;
        state.resources.staffCurrent = parseInt(document.getElementById('resStaffingCurrent').value, 10) || 0;
        state.resources.staffTotal = parseInt(document.getElementById('resStaffingTotal').value, 10) || 0;
        toggleModal('resourceModal');
        updateDashboard();
    });
}

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

// --- Team Members ---
const teamMembers = {
    'm1': { name: 'Arnav Gupta', reg: '24BCE1204', bg: 'bg-blue-600', initial: 'M1' },
    'm2': { name: 'Kushagra', reg: '24BCE1204', bg: 'bg-emerald-600', initial: 'M2' },
    'm3': { name: 'Sarthak', reg: '24BCE1204', bg: 'bg-purple-600', initial: 'M3' }
};

function showTeamMember(id) {
    const member = teamMembers[id];
    if (!member) return;
    
    document.getElementById('tmName').textContent = member.name;
    document.getElementById('tmRegNo').textContent = `REG NO: ${member.reg}`;
    
    const avatar = document.getElementById('tmAvatar');
    avatar.textContent = member.initial;
    avatar.className = `w-16 h-16 mx-auto rounded-full flex items-center justify-center text-xl font-black mb-4 border-2 border-black ring-1 ring-neutral-800 ${member.bg}`;
    
    const m = document.getElementById('teamModal');
    m.classList.remove('hidden');
    m.classList.add('flex');
    setTimeout(() => {
        m.classList.remove('opacity-0');
        document.getElementById('teamModalContent').classList.remove('scale-95');
    }, 10);
}

function closeTeamModal() {
    const m = document.getElementById('teamModal');
    m.classList.add('opacity-0');
    document.getElementById('teamModalContent').classList.add('scale-95');
    setTimeout(() => {
        m.classList.add('hidden');
        m.classList.remove('flex');
    }, 300);
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
        
        const { calcDaysElapsed } = getDynamicDays();
        const forecast = calculateForecast(totalUtilized);
        const variance = state.totalBudgetLimit > 0 ? ((state.totalBudgetLimit - forecast) / state.totalBudgetLimit) * 100 : 0;
        const dailyBurnRate = calcDaysElapsed > 0 ? (totalUtilized / calcDaysElapsed) : 0;
        const fundingCoverage = totalUtilized > 0 ? (state.sponsorship / totalUtilized) : (state.sponsorship > 0 ? 999 : 0);
        const cashRunway = dailyBurnRate > 0 ? (state.sponsorship / dailyBurnRate) : 0;

        const kpis = [
            ['Budget Limit', state.totalBudgetLimit],
            ['Capital Utilized', totalUtilized],
            ['Projected Final Cost', Math.round(forecast)],
            ['Budget Variance (%)', Number(variance.toFixed(1))],
            ['Sponsorship', state.sponsorship],
            ['Net Available', balance],
            ['Funding Coverage', Number(fundingCoverage.toFixed(2))],
            ['Cash Runway (Days)', Math.round(cashRunway)]
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
        const burnCanvas = document.getElementById('burnRateChart');
        const varianceCanvas = document.getElementById('varianceChart');

        if (allocationCanvas && categoryCanvas) {
            const dataA = allocationCanvas.toDataURL('image/png');
            const dataC = categoryCanvas.toDataURL('image/png');
            const imgIdA = workbook.addImage({ base64: dataA.split(',')[1], extension: 'png' });
            const imgIdC = workbook.addImage({ base64: dataC.split(',')[1], extension: 'png' });

            ws.addImage(imgIdA, { tl: { col: 3, row: 0 }, ext: { width: 520, height: 260 } });
            ws.addImage(imgIdC, { tl: { col: 3, row: 15 }, ext: { width: 360, height: 260 } });
            
            if (burnCanvas) {
                const dataB = burnCanvas.toDataURL('image/png');
                const imgIdB = workbook.addImage({ base64: dataB.split(',')[1], extension: 'png' });
                ws.addImage(imgIdB, { tl: { col: 12, row: 0 }, ext: { width: 520, height: 260 } });
            }
            if (varianceCanvas) {
                const dataV = varianceCanvas.toDataURL('image/png');
                const imgIdV = workbook.addImage({ base64: dataV.split(',')[1], extension: 'png' });
                ws.addImage(imgIdV, { tl: { col: 12, row: 15 }, ext: { width: 520, height: 260 } });
            }
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