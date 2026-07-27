# Documento de Requisitos do Produto (PRD) — HR LAVACAR

## 1. Visão Geral do Produto
O **HR LAVACAR** é uma plataforma de gestão integrada desenvolvida para lava-rápidos, centros de estética automotiva e oficinas de detalhamento. O sistema centraliza a recepção do cliente, vistoria/checklist do veículo, esteira de produção (Kanban), emissão de ordens de serviço (OS), recebimento financeiro (caixa), controle de estoque e comunicação automatizada via WhatsApp.

---

## 2. Público-Alvo e Níveis de Acesso

### 2.1 Perfis de Usuários
1. **Administrador (`ADMIN`)**
   - Acesso total ao sistema, incluindo métricas financeiras, abertura/fechamento de caixa, relatórios, alteração de configurações e controle de estoque.
   - **Mecanismo de Segurança por PIN**: Áreas sensíveis como o Resumo Financeiro no Dashboard e abas de Finanças/Caixa requerem desbloqueio via PIN de segurança.

2. **Funcionário (`FUNCIONARIO`)**
   - Acesso focado no pátio e recepção: visualização da esteira de produção, abertura e atualização de Ordens de Serviço, realização de vistoria/checklist e adição de veículos.
   - Ocultamento automático de informações financeiras restritas.

---

## 3. Arquitetura de Módulos e Requisitos Funcionais

### 3.1 Painel de Controle (Dashboard)
- **Métricas Operacionais**: Total de veículos em produção, prontos para retirada, entregues e agendamentos do dia.
- **Resumo Financeiro Diário**: Exibição do faturamento em OSs pagas e valores a receber no dia (exclusivo para Admin com PIN desbloqueado).
- **Ações Rápidas**: Botões de acesso direto para "Nova Ordem de Serviço", "Novo Cliente" e navegação ágil para a Esteira de Produção.
- **Alertas do Dia**: Lista resumida de itens com estoque baixo e próximos agendamentos.

### 3.2 Gestão de Ordens de Serviço (OS)
- **Cadastro e Edição**: Seleção de cliente, veículo, categoria (Pequeno, Médio, SUV/Pickup, Moto), serviços prestados, itens de estoque aplicados e observações do serviço.
- **Estágios de Status**: `AGUARDANDO`, `LAVAGEM`, `POLIMENTO`, `INSPECAO`, `PRONTO`, `ENTREGUE`.
- **Controle de Pagamento**: Marcação como `PENDENTE` ou `PAGO` com seleção da forma de pagamento (PIX, Cartão de Crédito/Débito, Dinheiro).
- **Recibo e Impressão**: Geração de comprovante em layout térmico/A4 pronto para impressão ou compartilhamento em PDF/imagem.
- **Integração WhatsApp**: Disparo rápido de mensagens parametrizadas para avisar que o veículo está pronto ou enviar o orçamento.

### 3.3 Vistoria e Checklist Veicular Visual
- **Partes do Veículo**: Inspeção detalhada de 6 áreas (Frente, Traseira, Lateral Esquerda, Lateral Direita, Teto e Interior).
- **Registro de Avarias**: Inclusão visual de pontos de avaria (riscos, amassados, trincas) com tipo e descrição.
- **Aferição de Combustível**: Nível do tanque em porcentagem.
- **Pertences e Observações**: Lista de verificação de pertences deixados no veículo (documentos, estepe, macaco, objetos pessoais).

### 3.4 Esteira de Produção (Board Kanban)
- **Quadro Visual**: Organização por colunas correspondentes ao status atual do veículo no pátio.
- **Movimentação Rápida**: Alteração de status com um único clique ou arrasto.
- **Identificação Clara**: Placa do veículo, modelo, cliente, horário de entrada e serviços pendentes em cada card.

### 3.5 Caixa e Fluxo de Finanças
- **Controle de Caixa Diário**: Registro do saldo inicial (fundo de troco), entradas de pagamentos de OSs e saídas de despesas operacionais.
- **Detalhamento por Meio de Pagamento**: Relatório de recebimentos discriminado por PIX, Cartão e Dinheiro.
- **Proteção por PIN**: Garantia de privacidade financeira no ambiente do pátio.

### 3.6 Gestão de Clientes e Frota
- **Base de Clientes**: Nome, telefone (WhatsApp), e-mail e histórico completo de ordens de serviço.
- **Cadastro de Veículos**: Placa, modelo, marca, cor, ano e categoria.
- **Boas-Vindas**: Envio de mensagem automática de recepção para novos clientes via WhatsApp.

### 3.7 Controle de Estoque
- **Insumos e Produtos**: Cadastro de shampoo automotivo, ceras, pretinho, flanelas, etc.
- **Baixa Automática/Manual**: Monitoramento da quantidade em estoque com definição de estoque mínimo.
- **Indicadores de Reposição**: Destaque para itens zerados ou abaixo do limite crítico.

### 3.8 Configurações e Tabela de Preços
- **Serviços**: Tabela configurável de preços por categoria veicular.
- **Templates de WhatsApp**: Personalização de mensagens pré-formatadas para orçamentos, confirmações de agendamento e aviso de veículo pronto.

---

## 4. Requisitos de Interface e Experiência do Usuário (UX/UI)

1. **Responsividade Integrada**:
   - **Desktop**: Menu lateral fixo (`Sidebar Navigation`) com navegação estruturada.
   - **Mobile**: Barra de navegação inferior fixa (`Mobile Bottom Navigation Bar`) com acesso rápido a Início, Produção, OSs, Clientes, Caixa e Ajustes.
2. **Prevenção de Sobreposição em Dispositivos Móveis**:
   - Margens de compensação (`pb-20`) para evitar que a barra de navegação inferior cubra botões de ação fixos em modais e fichas de OS.
3. **Design e Acessibilidade**:
   - Esquema de cores de alto contraste, tipografia legível e ícones do `lucide-react`.

---

## 5. Estrutura Técnica de Arquivos
- `src/App.tsx`: Gerenciador de estado global, controle de abas, modal de PIN e fluxos principais.
- `src/components/Navigation.tsx`: Componente de navegação híbrido (Sidebar Desktop + Bottom Bar Mobile).
- `src/components/Dashboard.tsx`: Métricas do dia, atalhos rápidos e resumo financeiro.
- `src/components/ServiceOrders/`: Componentes de lista, criação/edição (`ServiceOrderModal`) e recibo (`ServiceOrderReceipt`).
- `src/components/Checklist/`: Checklist visual do veículo e mapa de avarias (`ChecklistModal`).
- `src/components/Production/`: Quadro Kanban da esteira de trabalho (`ProductionBoard`).
- `src/components/Finance/`: Gestão do caixa diário e movimentações (`CashRegister`).
- `src/components/Clients/`: Gestão e cadastro de clientes (`ClientModal`).
- `src/types.ts`: Tipagem TypeScript para modelos do sistema (OS, Cliente, Veículo, Checklist, Caixa, Estoque).
