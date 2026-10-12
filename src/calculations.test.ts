import {describe,it,expect} from 'vitest'; import {calculate,defaults,supplierBreakEven} from './calculations';
describe('cálculos financeiros',()=>{
 it('calcula lucro considerando tarifas e custos',()=>{const r=calculate({...defaults,price:100,productCost:50,supplierFreight:5,packaging:0,otherUnit:0,feePercent:10,fixedFee:2,shippingSeller:0,logistics:'tradicional',taxPercent:0,returnsPercent:0,lossPercent:0,fixedMonthly:0,monthlySales:10});expect(r.operating).toBeCloseTo(33);});
 it('identifica prejuízo',()=>expect(calculate({...defaults,price:20,productCost:60,fixedMonthly:0}).operating).toBeLessThan(0));
 it('margem e markup são métricas diferentes',()=>{const r=calculate({...defaults,price:100,productCost:50,fixedMonthly:0,monthlySales:1,feePercent:0});expect(r.margin).toBe(35);expect(r.markup).toBeGreaterThan(1);});
 it('rateia custos fixos',()=>expect(calculate({...defaults,fixedMonthly:90,monthlySales:30}).fixedPerUnit).toBe(3));
 it('evita divisão por zero e campos vazios',()=>{const r=calculate({...defaults,price:0,monthlySales:0,cash:0});expect(r.margin).toBe(0);expect(r.availableOrders).toBe(0);});
 it('estima preço para margem-alvo',()=>{const i={...defaults,productCost:50,supplierFreight:0,packaging:0,otherUnit:0,fixedFee:0,feePercent:10,taxPercent:0,returnsPercent:0,lossPercent:0,fixedMonthly:0,monthlySales:10,targetMargin:20};const r=calculate(i);expect((r.targetPrice*(1-.1)-50)/r.targetPrice*100).toBeCloseTo(20);});
 it('compara mensalidade pela economia real',()=>expect(supplierBreakEven(100,5)).toBe(20));
});
