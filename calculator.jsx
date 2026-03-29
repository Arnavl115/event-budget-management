const { useState, useEffect } = React;

function Calculator() {
    const [isOpen, setIsOpen] = useState(false);
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');

    useEffect(() => {
        const toggleBtn = document.getElementById('btn-calculator');
        if (toggleBtn) {
            const handleToggle = () => setIsOpen(prev => !prev);
            toggleBtn.addEventListener('click', handleToggle);
            return () => toggleBtn.removeEventListener('click', handleToggle);
        }
    }, []);

    // Also inject lucide icons on render
    useEffect(() => {
        if (window.lucide && isOpen) {
            window.lucide.createIcons();
        }
    }, [isOpen, display, equation]);

    if (!isOpen) return null;

    const handleNum = (num) => {
        setDisplay(prev => {
            if (prev === '0' || prev === 'Error') return String(num);
            return prev + num;
        });
    };

    const handleOp = (op) => {
        // Evaluate if there's already an equation pending
        if (equation && display !== '0' && display !== 'Error') {
            try {
                const expr = (equation + ' ' + display).replace(/×/g, '*').replace(/÷/g, '/');
                const result = eval(expr);
                setEquation(result + ' ' + op);
                setDisplay('0');
            } catch (e) {
                setDisplay('Error');
                setEquation('');
            }
        } else {
            // Just set the operator
            setEquation(display + ' ' + op);
            setDisplay('0');
        }
    };

    const handleCalc = () => {
        if (!equation) return;
        try {
            const expr = (equation + ' ' + display).replace(/×/g, '*').replace(/÷/g, '/');
            const result = eval(expr);
            // Format to 4 decimal places if needed to avoid long floats
            const formatted = Number.isInteger(result) ? result : parseFloat(result.toFixed(4));
            setDisplay(String(formatted));
            setEquation('');
        } catch(e) {
            setDisplay('Error');
            setEquation('');
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setEquation('');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200] w-72 minimal-card p-6 rounded-sm bg-[#050505] shadow-2xl shadow-black/50 border border-neutral-800 flex flex-col cursor-default">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-900">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Calculator</span>
                <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                    <i data-lucide="x" className="w-4 h-4"></i>
                </button>
            </div>
            
            <div className="bg-neutral-900 p-4 rounded-sm border border-neutral-800 mb-4 flex flex-col items-end h-20 justify-end overflow-hidden">
                <div className="text-[10px] text-neutral-500 font-mono h-4 min-w-[1px]">{equation}</div>
                <div className="text-3xl font-black text-white tracking-tighter mt-1 truncate w-full text-right">{display}</div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
                <button onClick={handleClear} className="col-span-2 bg-red-500/10 text-red-500 border border-red-900/30 py-3 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">AC</button>
                <button onClick={() => handleOp('÷')} className="bg-neutral-900 text-neutral-400 border border-neutral-800 py-3 rounded-sm text-lg font-black hover:bg-neutral-800 hover:text-white transition-all">÷</button>
                <button onClick={() => handleOp('×')} className="bg-neutral-900 text-neutral-400 border border-neutral-800 py-3 rounded-sm text-lg font-black hover:bg-neutral-800 hover:text-white transition-all">×</button>
                
                {[7, 8, 9].map(num => (
                    <button key={num} onClick={() => handleNum(num)} className="bg-[#0a0a0a] text-white border border-neutral-800 py-3 rounded-sm text-lg font-black hover:bg-neutral-900 transition-all">{num}</button>
                ))}
                <button onClick={() => handleOp('-')} className="bg-neutral-900 text-neutral-400 border border-neutral-800 py-3 rounded-sm text-lg font-black hover:bg-neutral-800 hover:text-white transition-all">-</button>
                
                {[4, 5, 6].map(num => (
                    <button key={num} onClick={() => handleNum(num)} className="bg-[#0a0a0a] text-white border border-neutral-800 py-3 rounded-sm text-lg font-black hover:bg-neutral-900 transition-all">{num}</button>
                ))}
                <button onClick={() => handleOp('+')} className="bg-neutral-900 text-neutral-400 border border-neutral-800 py-3 rounded-sm text-lg font-black hover:bg-neutral-800 hover:text-white transition-all">+</button>
                
                {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => handleNum(num)} className="bg-[#0a0a0a] text-white border border-neutral-800 py-3 rounded-sm text-lg font-black hover:bg-neutral-900 transition-all">{num}</button>
                ))}
                
                <button onClick={handleCalc} className="row-span-2 bg-white text-black py-3 rounded-sm text-lg font-black hover:bg-neutral-200 transition-all">=</button>
                
                <button onClick={() => handleNum(0)} className="col-span-2 bg-[#0a0a0a] text-white border border-neutral-800 py-3 rounded-sm text-lg font-black hover:bg-neutral-900 transition-all">0</button>
                <button onClick={() => handleNum('.')} className="bg-[#0a0a0a] text-white border border-neutral-800 py-3 rounded-sm text-lg font-black hover:bg-neutral-900 transition-all">.</button>
            </div>
        </div>
    );
}

const rootBox = document.getElementById('react-calculator-root');
if (rootBox) {
    const root = ReactDOM.createRoot(rootBox);
    root.render(<Calculator />);
}
