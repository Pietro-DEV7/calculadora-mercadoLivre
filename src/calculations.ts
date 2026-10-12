export type Inputs = {name:string; sku:string; category:string; price:number; productCost:number; supplierFreight:number; packaging:number; otherUnit:number; feePercent:number; fixedFee:number; shippingSeller:number; logistics:string; flexDelivery:number; flexCollection:number; flexExtra:number; buyerShipping:number; taxPercent:number; taxBasePercent:number; returnsPercent:number; lossPercent:number; fixedMonthly:number; monthlySales:number; targetMargin:number; cash:number; supplierOrderCost:number; concurrentOrders:number; releaseDays:number; supplierDays:number};
export const defaults: Inputs = {name:'Produto de exemplo',sku:'DEMO-001',category:'Acessórios',price:100,productCost:60,supplierFreight:5,packaging:1,otherUnit:0,feePercent:14,fixedFee:0,shippingSeller:0,logistics:'tradicional',flexDelivery:0,flexCollection:0,flexExtra:0,buyerShipping:0,taxPercent:0,taxBasePercent:100,returnsPercent:0,lossPercent:0,fixedMonthly:50,monthlySales:30,targetMargin:15,cash:100,supplierOrderCost:65,concurrentOrders:3,releaseDays:14,supplierDays:0};
export type Result = ReturnType<typeof calculate>;
export function calculate(i:Inputs){
 const price=Math.max(0,i.price||0), fee=price*Math.max(0,i.feePercent||0)/100, tax=price*Math.max(0,i.taxBasePercent||0)/100*Math.max(0,i.taxPercent||0)/100;
 const logistics=i.logistics==='flex'?Math.max(0,i.flexDelivery||0)+Math.max(0,i.flexCollection||0)+Math.max(0,i.flexExtra||0):i.logistics==='propria'?Math.max(0,i.shippingSeller||0):Math.max(0,i.shippingSeller||0);
 const reserve=price*(Math.max(0,i.returnsPercent||0)+Math.max(0,i.lossPercent||0))/100;
 const variable=[i.productCost,i.supplierFreight,i.packaging,i.otherUnit,i.fixedFee,fee,logistics,tax,reserve].reduce((s,n)=>s+Math.max(0,n||0),0);
 const contribution=price-variable, fixedPerUnit=(i.monthlySales>0?Math.max(0,i.fixedMonthly||0)/i.monthlySales:0), operating=contribution-fixedPerUnit, margin=price>0?operating/price*100:0, totalCost=variable+fixedPerUnit, markup=totalCost>0?price/totalCost:0;
 const fixedPriceCost=Math.max(0,i.productCost)+Math.max(0,i.supplierFreight)+Math.max(0,i.packaging)+Math.max(0,i.otherUnit)+Math.max(0,i.fixedFee)+logistics;
 const rate=(Math.max(0,i.feePercent)+Math.max(0,i.taxPercent)*Math.max(0,i.taxBasePercent)/100+Math.max(0,i.returnsPercent)+Math.max(0,i.lossPercent))/100;
 const breakEven=rate<1?(fixedPriceCost+fixedPerUnit)/(1-rate):Infinity;
 const target=Math.max(0,Math.min(99.9,i.targetMargin||0))/100;
 const targetPrice=(1-rate-target)>0?(fixedPriceCost+fixedPerUnit)/(1-rate-target):Infinity;
 const capitalPerOrder=Math.max(0,i.supplierOrderCost||0), capitalNeeded=capitalPerOrder*Math.max(0,i.concurrentOrders||0), availableOrders=capitalPerOrder>0?Math.floor(Math.max(0,i.cash||0)/capitalPerOrder):0;
 return {price,fee,tax,reserve,logistics,variable,contribution,fixedPerUnit,operating,margin,markup,totalCost,breakEven,targetPrice,capitalNeeded,capitalPerOrder,availableOrders,shortfall:Math.max(0,capitalNeeded-Math.max(0,i.cash||0)), roi:capitalPerOrder>0?operating/capitalPerOrder*100:0,rate,fixedPriceCost};
}
export function simulate(i:Inputs, qty:number){const r=calculate(i); return {qty,revenue:r.price*qty,costs:r.variable*qty+i.fixedMonthly,fees:r.fee*qty,profit:r.operating*qty,margin:r.margin,capital:r.capitalPerOrder*Math.min(qty,Math.max(1,i.concurrentOrders||1))};}
export function supplierBreakEven(monthlyFee:number, savingsPerUnit:number){return savingsPerUnit>0?Math.ceil(Math.max(0,monthlyFee)/savingsPerUnit):Infinity;}
