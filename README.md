# ⏱️ Ponto - Controle de Jornada de Trabalho

Um aplicativo web moderno e intuitivo para controlar sua jornada de trabalho. Registre entrada e saída, acompanhe suas horas trabalhadas e gere relatórios detalhados.

## ✨ Funcionalidades

### 📍 Marcação Rápida
- **Botão de Entrada/Saída**: Registre sua marcação com um único clique
- **Relógio em Tempo Real**: Visualize a hora atual atualizada constantemente
- **Status Visual**: Indicador de status mostrando se você está trabalhando ou fora
- **Última Marcação**: Exibição da última marcação registrada

### 📊 Painel Hoje
- Lista completa das marcações do dia atual
- Visualização de entrada/saída com ícones identificadores
- Cálculo automático de horas trabalhadas
- Opções para editar ou deletar marcações individuais
- Botão para limpar todas as marcações do dia

### 📅 Histórico
- Visualização de todas as marcações registradas
- Filtro por data específica
- Filtro por mês
- Exibição de horas trabalhadas por dia

### 📈 Relatórios
- **Relatório Semanal**: Total de horas da semana, saldo com esperado
- **Relatório Mensal**: Total de horas do mês, dias trabalhados, saldo
- **Resumo Geral**: Total de horas acumuladas, média diária, total de marcações
- **Exportação CSV**: Exporte dados em formato CSV
- **Impressão**: Imprima os relatórios

### ⚙️ Configurações
- **Jornada Padrão**: Configure o número de horas de trabalho esperadas por dia
- **Intervalo**: Configure a duração do intervalo (lunch break) descontado das horas
- **Backup de Dados**: 
  - Exporte todos os dados em formato JSON
  - Importe dados de backups anteriores
- **Segurança**: Opção para limpar todos os dados

## 🚀 Como Usar

### Instalação
1. Clone o repositório
2. Abra o arquivo `index.html` em seu navegador
3. Pronto! A aplicação já está funcionando localmente

### Primeiros Passos
1. **Faça sua primeira marcação**: Clique no botão "ENTRADA" para registrar que você começou a trabalhar
2. **Registre sua saída**: Clique no botão "SAÍDA" quando terminar o trabalho
3. **Configure suas preferências**: Acesse a aba "Configurações" para personalizar sua jornada padrão e intervalo

### Usando as Abas

#### Hoje
- Visualize todas as suas marcações do dia
- Edite marcações clicando em "✏️ Editar Marcações"
- Delete marcações individuais ou limpe todo o dia

#### Histórico
- Visualize marcações de dias anteriores
- Use filtros para encontrar datas específicas ou períodos

#### Relatórios
- Acompanhe seu progresso semanal e mensal
- Veja se está atingindo suas metas de horas
- Exporte dados em CSV para análise em planilha

#### Configurações
- Ajuste a jornada esperada (padrão: 8 horas)
- Configure o tempo de intervalo (padrão: 60 minutos)
- Faça backup e restauração de dados
- Limpe todos os dados se necessário

## 💾 Armazenamento de Dados

Todos os dados são armazenados no **localStorage** do navegador, o que significa:
- ✅ Dados persistem entre sessões
- ✅ Sem necessidade de servidor ou banco de dados
- ✅ Privacidade total - dados não são enviados para ninguém
- ⚠️ Os dados são específicos do navegador e dispositivo

### Backup e Restauração
Você pode:
1. **Exportar**: Baixe um arquivo JSON com todos os seus dados
2. **Importar**: Restaure dados de um backup anterior
3. **Exportar CSV**: Exporte para usar em planilhas

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- 🖥️ Computadores (Desktop)
- 📱 Tablets
- 📲 Smartphones

## 🎨 Design

- **Interface Moderna**: Design limpo e intuitivo
- **Tema Gradiente**: Cores vibrantes e agradáveis
- **Modo Claro**: Otimizado para leitura durante todo o dia
- **Ícones Visuais**: Ícones que facilitam a compreensão das ações

## 🔧 Configurações Padrão

| Configuração | Padrão |
|---|---|
| Horas de trabalho por dia | 8 horas |
| Duração do intervalo | 60 minutos |
| Tipo de armazenamento | localStorage |

## 💡 Dicas de Uso

1. **Marcações precisas**: Clique no botão assim que chegar ou sair do trabalho
2. **Editar marcações**: Use a aba "Hoje" para corrigir horários se necessário
3. **Acompanhar metas**: Verifique os relatórios para saber se está atingindo suas metas
4. **Fazer backups**: Exporte seus dados regularmente como medida de segurança

## 🌟 Funcionalidades Avançadas

- **Cálculo automático de horas**: O app calcula automaticamente o tempo trabalhado, desconsiderando o intervalo
- **Análise de saldo**: Veja se você trabalhou mais ou menos que o esperado
- **Saldo acumulado**: Acompanhe saldo semanal e mensal
- **Média diária**: Visualize sua produtividade média

## 🔒 Privacidade e Segurança

- Todos os dados são armazenados localmente no seu navegador
- Nenhuma informação é enviada para servidores externos
- Você tem controle total sobre seus dados
- Pode deletar tudo a qualquer momento

## 🐛 Troubleshooting

### Dados não aparecem após recarregar
- Verifique se o localStorage não foi limpado
- Verifique se o navegador permite localStorage

### Horários incorretos
- Use "✏️ Editar Marcações" para corrigir manualmente
- Garanta que seu relógio do sistema está correto

### Não consegue fazer backup/restauração
- Certifique-se que o arquivo JSON está no formato correto
- Tente exportar novamente e depois restaurar

## 📄 Licença

Este projeto é de código aberto e está disponível para uso pessoal e profissional.

## 👨‍💻 Desenvolvido com

- HTML5
- CSS3
- JavaScript Vanilla (sem dependências)

---

**Desenvolvido para facilitar o controle de jornada de trabalho de forma simples e eficiente! ⏱️**
