import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
// Se o componente App não estiver neste arquivo, descomente a linha abaixo:
// import App from './App';
// Função para formatar valores monetários (corrige o erro "Não é possível encontrar o nome 'money'")
function money(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}
_jsx("div", { className: "inline-warning", style: { marginTop: '20px' }, children: "A mensalidade \u00E9 rateada pelo volume mensal configurado. Vendas necess\u00E1rias para compensar o custo fixo variam conforme a margem do produto." });
div >
;
div >
;
main >
;
div >
;
;
// === COMPONENTES AUXILIARES ===
function Stat({ icon, label, value, sub, tone }) {
    return (_jsxs("div", { className: "stat-card", children: [_jsxs("div", { className: "stat-top", children: [_jsx("div", { className: "stat-icon", children: icon }), _jsx("div", { className: "stat-label", children: label })] }), _jsx("strong", { className: tone === 'good' ? 'green' : tone === 'bad' ? 'red' : '', children: value }), _jsx("small", { children: sub })] }));
}
function Cost({ label, value }) {
    return (_jsxs("div", { className: "cost-row", children: [_jsx("span", { children: label }), _jsx("strong", { children: money(value) })] }));
}
// === INICIALIZAÇÃO ===
const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(_jsx(App, {}));
}
