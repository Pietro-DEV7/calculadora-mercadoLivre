# ML Profit — Calculadora de Lucro

Aplicação web local para estimar a rentabilidade de produtos vendidos no Mercado Livre, incluindo custos por unidade, tarifas manuais, logística, impostos estimados, capital de giro e comparação de fornecedores.

## Requisitos
- Node.js 20 ou superior recomendado
- npm

## Executar
```bash
npm install
npm run dev
```
Abra o endereço local indicado pelo Vite no terminal.

## Compilar e testar
```bash
npm run build
npm test
```

## Principais fórmulas
- Tarifa percentual = preço × percentual da tarifa.
- Imposto estimado = preço × base tributável configurada × percentual de imposto.
- Custos variáveis = produto + frete fornecedor + embalagem + outros custos + tarifas + logística + impostos + reservas.
- Custo fixo por unidade = custos fixos mensais ÷ vendas mensais estimadas.
- Lucro operacional estimado = preço − custos variáveis − custo fixo rateado.
- Margem operacional = lucro operacional ÷ preço × 100.
- Markup = preço ÷ custo total considerado.
- Preço de equilíbrio e preço para margem-alvo usam uma solução algébrica com taxas percentuais e custos unitários configurados.
- Capital de giro básico = custo antecipado por pedido × pedidos simultâneos.

## Transparência e limitações
- Todos os valores preenchidos são estimativas; o produto de exemplo é hipotético.
- A aplicação **não consulta tarifas oficiais** do Mercado Livre e não inventa valores atuais. Confirme tarifa percentual, tarifa fixa, frete e condições logísticas no painel da sua conta.
- O campo de categoria é informativo; tarifas não são determinadas automaticamente pela categoria. Tipo de anúncio é um campo manual e não valida a elegibilidade comercial.
- A estimativa tributária é configurável e não substitui orientação contábil. A base e o tratamento variam conforme regime e operação.
- O custo de logística deve ser preenchido como o custo líquido efetivamente pago pelo vendedor, sem duplicar frete já informado em outro campo.
- Capital de giro é uma aproximação para pedidos simultâneos; os prazos de liberação são informados pelo usuário e não representam uma previsão oficial do Mercado Livre.
- Dados de produtos e fornecedores ficam no `localStorage` do navegador/dispositivo; não são sincronizados entre aparelhos. Use “Limpar dados” para apagar os registros da aplicação neste dispositivo.
- A comparação de fornecedores só reflete os dados fornecidos pelo usuário. Integrações e compatibilidade com Flex não são verificadas automaticamente.

## Estrutura
- `src/main.tsx`: interface, formulários, navegação, exportação CSV e impressão.
- `src/calculations.ts`: funções puras de cálculo financeiro.
- `src/calculations.test.ts`: testes automatizados dos cálculos.
- `src/styles.css`: design responsivo, tema escuro e impressão.

## Tarifas e condições a confirmar
1. Percentual da tarifa de venda aplicável ao anúncio/categoria.
2. Tarifa fixa por unidade e suas condições de incidência.
3. Frete subsidiado ou custo de envio efetivamente suportado pelo vendedor.
4. Tarifas logísticas adicionais, coleta, Flex e cobertura.
5. Impostos e base tributável corretos para o regime do vendedor.
6. Prazo real de liberação do saldo e regras aplicáveis à conta.
7. Regras vigentes do Mercado Livre para despacho, cancelamento, devolução e uso de fornecedores.
