export const defaults = {
    name: 'Produto de exemplo',
    sku: 'DEMO-001',
    category: 'Acessórios',
    price: 100,
    productCost: 60,
    supplierFreight: 5,
    packaging: 1,
    otherUnit: 0,
    feePercent: 14,
    fixedFee: 0,
    shippingSeller: 0,
    logistics: 'tradicional',
    flexDelivery: 0,
    flexCollection: 0,
    flexExtra: 0,
    buyerShipping: 0,
    taxPercent: 0,
    taxBasePercent: 100,
    returnsPercent: 0,
    lossPercent: 0,
    fixedMonthly: 50,
    monthlySales: 30,
    targetMargin: 15,
    cash: 100,
    supplierOrderCost: 65,
    concurrentOrders: 3,
    releaseDays: 14,
    supplierDays: 0,
};
export function calculate(i) {
    // Receitas e Impostos
    const price = Math.max(0, i.price || 0);
    const fee = price * (Math.max(0, i.feePercent || 0) / 100);
    const tax = price * (Math.max(0, i.taxBasePercent || 0) / 100) * (Math.max(0, i.taxPercent || 0) / 100);
    // Logística
    const logistics = i.logistics === 'flex'
        ? Math.max(0, i.flexDelivery || 0) + Math.max(0, i.flexCollection || 0) + Math.max(0, i.flexExtra || 0)
        : i.logistics === 'propria'
            ? Math.max(0, i.shippingSeller || 0)
            : Math.max(0, i.shippingSeller || 0);
    // Margem de Segurança (Devoluções/Perdas)
    const reserve = price * ((Math.max(0, i.returnsPercent || 0) + Math.max(0, i.lossPercent || 0)) / 100);
    // Custos Variáveis
    const variable = [
        i.productCost,
        i.supplierFreight,
        i.packaging,
        i.otherUnit,
        i.fixedFee,
        fee,
        logistics,
        tax,
        reserve,
    ].reduce((s, n) => s + Math.max(0, n || 0), 0);
    // Indicadores de Lucratividade
    const contribution = price - variable;
    const fixedPerUnit = i.monthlySales > 0 ? Math.max(0, i.fixedMonthly || 0) / i.monthlySales : 0;
    const operating = contribution - fixedPerUnit;
    const margin = price > 0 ? (operating / price) * 100 : 0;
    const totalCost = variable + fixedPerUnit;
    const markup = totalCost > 0 ? price / totalCost : 0;
    // Cálculos de Ponto de Equilíbrio e Preço Alvo
    const fixedPriceCost = Math.max(0, i.productCost) +
        Math.max(0, i.supplierFreight) +
        Math.max(0, i.packaging) +
        Math.max(0, i.otherUnit) +
        Math.max(0, i.fixedFee) +
        logistics;
    const rate = (Math.max(0, i.feePercent) +
        (Math.max(0, i.taxPercent) * Math.max(0, i.taxBasePercent)) / 100 +
        Math.max(0, i.returnsPercent) +
        Math.max(0, i.lossPercent)) /
        100;
    const breakEven = rate < 1 ? (fixedPriceCost + fixedPerUnit) / (1 - rate) : Infinity;
    const target = Math.max(0, Math.min(99.9, i.targetMargin || 0)) / 100;
    const targetPrice = (1 - rate - target) > 0 ? (fixedPriceCost + fixedPerUnit) / (1 - rate - target) : Infinity;
    // Capital de Giro
    const capitalPerOrder = Math.max(0, i.supplierOrderCost || 0);
    const capitalNeeded = capitalPerOrder * Math.max(0, i.concurrentOrders || 0);
    const availableOrders = capitalPerOrder > 0 ? Math.floor(Math.max(0, i.cash || 0) / capitalPerOrder) : 0;
    const shortfall = Math.max(0, capitalNeeded - Math.max(0, i.cash || 0));
    const roi = capitalPerOrder > 0 ? (operating / capitalPerOrder) * 100 : 0;
    return {
        price,
        fee,
        tax,
        reserve,
        logistics,
        variable,
        contribution,
        fixedPerUnit,
        operating,
        margin,
        markup,
        totalCost,
        breakEven,
        targetPrice,
        capitalNeeded,
        capitalPerOrder,
        availableOrders,
        shortfall,
        roi,
        rate,
        fixedPriceCost,
    };
}
export function simulate(i, qty) {
    const r = calculate(i);
    return {
        qty,
        revenue: r.price * qty,
        costs: r.variable * qty + i.fixedMonthly,
        fees: r.fee * qty,
        profit: r.operating * qty,
        margin: r.margin,
        capital: r.capitalPerOrder * Math.min(qty, Math.max(1, i.concurrentOrders || 1)),
    };
}
export function supplierBreakEven(monthlyFee, savingsPerUnit) {
    return savingsPerUnit > 0 ? Math.ceil(Math.max(0, monthlyFee) / savingsPerUnit) : Infinity;
}
