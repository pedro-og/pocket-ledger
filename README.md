# Pocket Ledger

**Pocket Ledger** é uma aplicação projetada para facilitar o planejamento financeiro através de uma ferramenta corriqueira do dia a dia como o WhatsApp de maneira simples e eficiente.

## 🚀 Funcionalidades

- [x] Integração com WhatsApp Web (via `wwwebjs`).
- [x] Gerenciamento de cache para sessões e autenticação.
- [x] Suporte a transações personalizadas.
- [x] Possibilidade de exportar relatórios ou dados (exemplo com `pocketbot.mp4`).

## 🛠 Tecnologias Utilizadas

- **Node.js**: Plataforma para execução de código JavaScript no backend.
- **Puppeteer**: Automação do Chromium para tarefas diversas.
- **WWWebJS**: Biblioteca para interação com o WhatsApp Web.
- **Google APIs**: Funções para integração de serviços Google.

## 📂 Estrutura do Projeto

```
pocket-ledger/
├── .wwebjs_auth/         # Diretório para autenticação do WhatsApp
├── .wwebjs_cache/        # Diretório para cache de sessões
├── node_modules/         # Dependências do projeto
├── .gitignore            # Arquivos/diretórios ignorados pelo Git
├── credentials.json      # Credenciais (exemplo: Google API)
├── index.js              # Arquivo principal do projeto
├── package.json          # Configuração e dependências do projeto
├── package-lock.json     # Controle de versão das dependências
├── pocketbot.mp4         # Arquivo multimídia exemplo
├── testGoogle.js         # Teste de integração com Google APIs
```

## ⚙️ Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/pedro-og/pocket-ledger.git
   cd pocket-ledger
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as credenciais:
   - Certifique-se de que o arquivo `credentials.json` está configurado corretamente.

4. Execute o projeto:
   ```bash
   node index.js
   ```

## 📝 Como Contribuir

1. Faça um fork do repositório.
2. Crie uma branch com a sua feature:
   ```bash
   git checkout -b minha-feature
   ```
3. Commit suas alterações:
   ```bash
   git commit -m 'Adicionei minha feature'
   ```
4. Faça o push para a branch:
   ```bash
   git push origin minha-feature
   ```
5. Abra um Pull Request.

## 🛡️ Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Feito por **Pedro Gonzaga**. 
