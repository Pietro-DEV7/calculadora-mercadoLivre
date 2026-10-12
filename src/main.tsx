import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Activity, Calculator, Package, Wallet, Truck, Users, Download,
  Printer, RotateCcw, Trash2, Moon, Sun, PlusCircle, AlertTriangle
} from 'lucide-react';
import {
  calculate, defaults, simulate, type Inputs
} from './calculations';
import './styles.css';

type Supplier = {
  id: number;
  name: string;
  product: string;
  cost: number;
  freight: number;
  monthly: number;
  fee: number;
  dispatch: number;
  delivery: number;
  integration: string;
  flex: string;
  notes: string;
};

type SupplierFieldKey =
  | 'cost'
  | 'freight'
  | 'monthly'
  | 'fee'
  | 'dispatch'
  | 'delivery';

const money = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : 'Não calculável';

const pct = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%'
    : '—';

const supplierFields: { label: string; key: SupplierFieldKey }[] = [
  { label: 'Custo unitário (R$)', key: 'cost' },
  { label: 'Frete por unidade (R$)', key: 'freight' },
  { label: 'Mensalidade (R$)', key: 'monthly' },
  { label: 'Taxa por pedido (R$)', key: 'fee' },
  { label: 'Prazo de despacho (dias)', key: 'dispatch' },
  { label: 'Prazo de entrega (dias)', key: 'delivery' },
];

function App() {
  // === ESTADOS ===
  const [data, setData] = useState<Inputs>(() => {
    try {
      return {
        ...defaults,
        ...JSON.parse(localStorage.getItem('mlprofit-data') || '{}'),
      };
    } catch {
      return defaults;
    }
  });

  const [dark, setDark] = useState(false);
  const [qty, setQty] = useState(10);
  const [tab, setTab] = useState('calculadora');

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mlprofit-suppliers') || '[]');
    } catch {
      return [];
    }
  });

  const [supplier, setSupplier] = useState<Omit<Supplier, 'id'>>({
    name: '',
    product: '',
    cost: 0,
    freight: 0,
    monthly: 0,
    fee: 0,
    dispatch: 1,
    delivery: 5,
    integration: 'não confirmada',
    flex: 'não confirmada',
    notes: '',
  });

  // === EFEITOS ===
  useEffect(() => {
    localStorage.setItem('mlprofit-data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('mlprofit-suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  // === CÁLCULOS ===
  const r = useMemo(() => calculate(data), [data]);
  const sim = useMemo(() => simulate(data, qty), [data, qty]);

  const chartData = useMemo(() => {
    return [1, 5, 10, 20, 30, 50, 100].map(q => {
      const s = simulate(data, q);
      return {
        vendas: q,
        receita: s.revenue,
        lucro: s.profit,
        custos: s.costs + s.fees
      };
    });
  }, [data]);

  // === FUNÇÕES AUXILIARES ===
  const set = (key: keyof Inputs, value: string | number) => {
    setData((previous) => ({ ...previous, [key]: value }));
  };

  const field = (
    label: string,
    key: keyof Inputs,
    opts: { type?: string; min?: number; step?: string; placeholder?: string; hint?: string; } = {}
  ) => (
    <label className="field" key={String(key)}>
      <span>{label}</span>
      <input
        type={opts.type || 'number'}
        min={opts.min ?? 0}
        step={opts.step || '0.01'}
        value={(data[key] as string | number) ?? ''}
        onChange={(e) =>
          set(
            key,
            opts.type === 'text'
              ? e.target.value
              : e.target.value === '' ? 0 : Number(e.target.value)
          )
        }
        placeholder={opts.placeholder || '0,00'}
      />
      {opts.hint && <small>{opts.hint}</small>}
    </label>
  );

  const select = (label: string, key: keyof Inputs, options: { value: string; label: string }[]) => (
    <label className="field" key={String(key)}>
      <span>{label}</span>
      <select value={String(data[key])} onChange={(e) => set(key, e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );

  const exportCsv = () => {
    const rows = [
      ['Indicador', 'Valor'],
      ['Produto', String(data.name)],
      ['Preço de venda', r.price],
      ['Lucro operacional', r.operating],
      ['Margem (%)', r.margin],
      ['Tarifa', r.fee],
      ['Impostos', r.tax],
      ['Preço de equilíbrio', r.breakEven]
    ];
    const csv = '\ufeff' + rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ml-profit.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => confirm('Restaurar valores de exemplo?') && setData(defaults);
  
  const clear = () => {
    if (confirm('Apagar os campos e os dados locais?')) {
      setData({ ...defaults, name: '', price: 0, productCost: 0, fixedMonthly: 0, monthlySales: 0 });
      setSuppliers([]);
      localStorage.clear();
    }
  };

  // === RENDERIZAÇÃO ===
  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Activity size={23} /></div>
          <div><strong>ML Profit</strong><small>Calculadora de lucro</small></div>
        </div>

        <div className="nav-label">FERRAMENTAS</div>
        {(
          [
            ['calculadora', Calculator, 'Calculadora'],
            ['capital', Wallet, 'Capital de giro'],
            ['fornecedores', Users, 'Fornecedores'],
          ] as const
        ).map(([id, Icon, label]) => (
          <button className={`nav-item ${tab === id ? 'active' : ''}`} key={id} onClick={() => setTab(id)}>
            <Icon size={18} /> {label}
          </button>
        ))}

        <div className="sidebar-note">
          <AlertTriangle size={17} />
          <span>Tarifas e impostos devem ser confirmados pelo vendedor.</span>
        </div>
        <button className="theme-button" onClick={() => setDark(!dark)}>
          {dark ? <Sun size={17} /> : <Moon size={17} />} {dark ? 'Tema claro' : 'Tema escuro'}
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">PAINEL FINANCEIRO</div>
            <h1>
              {tab === 'calculadora' ? 'Calculadora de lucro' : tab === 'capital' ? 'Capital de giro' : 'Comparação de fornecedores'}
            </h1>
            <p>Entenda os números antes de anunciar seu produto.</p>
          </div>
          <div className="top-actions">
            <button className="button secondary" onClick={exportCsv}><Download size={16} /> Exportar CSV</button>
            <button className="button secondary" onClick={() => window.print()}><Printer size={16} /> Relatório</button>
          </div>
        </header>

        {/* ABA: CALCULADORA */}
        {tab === 'calculadora' && (
          <>
            <div className="stats">
              <Stat icon={<Wallet />} label="Lucro / venda" value={money(r.operating)} sub="Após custos fixos rateados" tone={r.operating >= 0 ? 'good' : 'bad'} />
              <Stat icon={<Activity />} label="Margem" value={pct(r.margin)} sub="Lucro ÷ preço de venda" tone={r.margin >= data.targetMargin ? 'good' : 'bad'} />
              <Stat icon={<Package />} label="Preço alvo" value={money(r.targetPrice)} sub={`Para margem de ${data.targetMargin}%`} tone="neutral" />
              <Stat icon={<Truck />} label="Capital necessário" value={money(r.capitalNeeded)} sub={`${data.concurrentOrders} pedidos simultâneos`} tone="neutral" />
            </div>

            <div className="content-grid">
              <div className="panel form-panel">
                <div className="panel-heading">
                  <div><h2>Dados da venda</h2><p>Altere os campos para atualizar em tempo real.</p></div>
                  <span className="tag">{data.name || 'Novo produto'}</span>
                </div>

                <section className="form-section">
                  <h3>01 <span>Produto</span></h3>
                  <div className="fields two">
                    {field('Nome do produto', 'name', { type: 'text' })}
                    {field('SKU / código', 'sku', { type: 'text' })}
                    {field('Preço de venda (R$)', 'price')}
                    {field('Custo do produto (R$)', 'productCost')}
                    {field('Frete do fornecedor (R$)', 'supplierFreight')}
                    {field('Embalagem (R$)', 'packaging')}
                  </div>
                </section>

                <section className="form-section">
                  <h3>02 <span>Tarifas e logística</span></h3>
                  <div className="fields two">
                    {field('Tarifa de venda (%)', 'feePercent')}
                    {field('Tarifa fixa (R$)', 'fixedFee')}
                    {field('Frete vendedor (R$)', 'shippingSeller')}
                    {select('Logística', 'logistics', [
                      { value: 'tradicional', label: 'Envios Tradicional' },
                      { value: 'flex', label: 'Envios Flex' }
                    ])}
                  </div>
                </section>

                <section className="form-section">
                  <h3>03 <span>Impostos e operação</span></h3>
                  <div className="fields two">
                    {field('Impostos (%)', 'taxPercent')}
                    {field('Custos fixos mensais (R$)', 'fixedMonthly')}
                    {field('Vendas mensais', 'monthlySales', { step: '1' })}
                    {field('Margem-alvo (%)', 'targetMargin')}
                  </div>
                </section>

                <div className="form-actions">
                  <button className="button secondary" onClick={reset}><RotateCcw size={16} /> Restaurar exemplo</button>
                  <button className="button danger-outline" onClick={clear}><Trash2 size={16} /> Limpar dados</button>
                </div>
              </div>

              <div className="right-column">
                <div className="panel result-panel">
                  <div className="panel-heading">
                    <div><h2>Resumo da unidade</h2></div>
                    <span className={`status ${r.operating >= 0 ? 'positive' : 'negative'}`}>
                      {r.operating >= 0 ? 'Lucro' : 'Prejuízo'}
                    </span>
                  </div>
                  <div className="profit-number">
                    <small>Lucro operacional unitário</small>
                    <strong className={r.operating >= 0 ? 'green' : 'red'}>{money(r.operating)}</strong>
                  </div>
                  <Cost label="Custo do produto" value={data.productCost} />
                  <Cost label={`Tarifa (${data.feePercent}%)`} value={r.fee} />
                  <Cost label="Impostos" value={r.tax} />
                  <Cost label="Custo fixo rateado" value={r.fixedPerUnit} />
                  <div className="total-row final">
                    <span>Custo Total</span>
                    <strong>{money(r.totalCost)}</strong>
                  </div>
                  <div className="total-row final">
                    <span>Ponto de Equilíbrio</span>
                    <strong>{money(r.breakEven)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel volume-panel">
              <div className="panel-heading">
                <div><h2>Simulador de volume</h2></div>
                <label className="qty-select">
                  Vendas <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                    {[1, 5, 10, 30, 50, 100].map((n) => (<option key={n} value={n}>{n}</option>))}
                  </select>
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                  <Cost label="Receita Bruta" value={sim.revenue} />
                  <Cost label="Custos (Var + Fixos)" value={sim.costs} />
                  <Cost label="Tarifas" value={sim.fees} />
                  <div className="total-row final" style={{ marginTop: '1rem' }}>
                    <span>Lucro Mensal Projetado</span>
                    <strong className={sim.profit >= 0 ? 'green' : 'red'}>{money(sim.profit)}</strong>
                  </div>
                </div>
                <div style={{ height: '200px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="vendas" style={{ fontSize: '12px' }} />
                      <YAxis style={{ fontSize: '12px' }} />
                      <Tooltip formatter={(val: number) => money(val)} labelFormatter={(lbl) => `${lbl} Vendas`} />
                      <Legend />
                      <Area type="monotone" dataKey="lucro" name="Lucro Estimado" stroke="#10b981" fillOpacity={1} fill="url(#colorLucro)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ABA: CAPITAL DE GIRO */}
        {tab === 'capital' && (
          <div className="capital-layout">
            <div className="panel">
              <h2>Necessidade de Capital</h2>
              <p className="muted">Simule o capital necessário para sustentar pedidos.</p>
              <div className="fields" style={{marginTop: '15px'}}>
                {field('Pedidos Simultâneos', 'concurrentOrders', { step: '1' })}
                {field('Custo do Pedido no Fornecedor (R$)', 'supplierOrderCost')}
                {field('Caixa Disponível (R$)', 'cash')}
              </div>
              <div className="capital-result">
                <small>Capital Total Necessário</small>
                <strong className={r.capitalNeeded > data.cash ? 'red' : 'green'}>{money(r.capitalNeeded)}</strong>
                <span>Saldo projetado: {money(data.cash - r.capitalNeeded)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ABA: FORNECEDORES */}
        {tab === 'fornecedores' && (
          <div className="supplier-layout">
            <div className="panel">
              <h2>Cadastrar novo</h2>
              <div className="fields two">
                <label className="field">
                  <span>Nome do fornecedor</span>
                  <input type="text" value={supplier.name} onChange={e => setSupplier({ ...supplier, name: e.target.value })} />
                </label>
                <label className="field">
                  <span>Produto</span>
                  <input type="text" value={supplier.product} onChange={e => setSupplier({ ...supplier, product: e.target.value })} />
                </label>
                
                {supplierFields.map(f => (
                  <label className="field" key={f.key}>
                    <span>{f.label}</span>
                    <input type="number" min="0" step="0.01" value={supplier[f.key]} onChange={e => setSupplier({ ...supplier, [f.key]: Number(e.target.value) })} />
                  </label>
                ))}

                <label className="field">
                  <span>Integração</span>
                  <select value={supplier.integration} onChange={e => setSupplier({ ...supplier, integration: e.target.value })}>
                    <option>não confirmada</option>
                    <option>confirmada</option>
                    <option>indisponível</option>
                  </select>
                </label>

                <label className="field">
                  <span>Flex</span>
                  <select value={supplier.flex} onChange={e => setSupplier({ ...supplier, flex: e.target.value })}>
                    <option>não confirmada</option>
                    <option>confirmada</option>
                    <option>indisponível</option>
                  </select>
                </label>
                <label className="field full">
                  <span>Observações</span>
                  <textarea value={supplier.notes} onChange={e => setSupplier({ ...supplier, notes: e.target.value })} />
                </label>
              </div>
              <button className="button primary" onClick={() => {
                if (!supplier.name.trim()) { alert('Informe o nome do fornecedor.'); return; }
                setSuppliers([...suppliers, { ...supplier, id: Date.now() }]);
                setSupplier({ name: '', product: '', cost: 0, freight: 0, monthly: 0, fee: 0, dispatch: 1, delivery: 5, integration: 'não confirmada', flex: 'não confirmada', notes: '' });
              }}>
                <PlusCircle size={17} /> Adicionar fornecedor
              </button>
            </div>

            <div className="panel">
              <h2>Comparativo</h2>
              {suppliers.length === 0 ? (
                <div className="empty">
                  <Users size={30} />
                  <strong>Nenhum fornecedor cadastrado</strong>
                  <span>Adicione fornecedores para comparar o custo estimado por unidade.</span>
                </div>
              ) : (
                <div className="supplier-list">
                  {suppliers.map(s => {
                    const unit = s.cost + s.freight + s.fee + (data.monthlySales > 0 ? s.monthly / data.monthlySales : 0);
                    return (
                      <div className="supplier-card" key={s.id}>
                        <div className="supplier-head">
                          <div>
                            <strong>{s.name}</strong>
                            <small>{s.product || 'Produto não informado'}</small>
                          </div>
                          <strong>{money(unit)}<small> custo/unid</small></strong>
                        </div>
                        <div className="supplier-meta">
                          <span>Mensal: {money(s.monthly)}</span>
                          <span>Despacho: {s.dispatch} d</span>
                          <span>Entrega: {s.delivery} d</span>
                        </div>
                        <div className="supplier-meta">
                          <span>Int: {s.integration}</span>
                          <span>Flex: {s.flex}</span>
                        </div>
                        <p className="helper">Mensalidade rateada ({data.monthlySales} un/mês).</p>
                        <button className="text-button" onClick={() => setSuppliers(suppliers.filter(x => x.id !== s.id))}>Remover</button>
                      </div>
                    )
                  })}
                </div>
              )}
              
              <div className="inline-warning" style={{ marginTop: '20px' }}>
                A mensalidade é rateada pelo volume mensal configurado. Vendas necessárias para compensar o custo fixo variam conforme a margem do produto.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// === COMPONENTES AUXILIARES ===

function Stat({ icon, label, value, sub, tone }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  sub: string; 
  tone: 'good' | 'bad' | 'neutral' 
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">{icon}</div>
        <div className="stat-label">{label}</div>
      </div>
      <strong className={tone === 'good' ? 'green' : tone === 'bad' ? 'red' : ''}>
        {value}
      </strong>
      <small>{sub}</small>
    </div>
  );
}

function Cost({ label, value }: { label: string; value: number }) {
  return (
    <div className="cost-row">
      <span>{label}</span>
      <strong>{money(value)}</strong>
    </div>
  );
}

// === INICIALIZAÇÃO ===

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}