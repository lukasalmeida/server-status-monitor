# Contexto do Projeto: Server Status Monitor (GNOME Extension)

## 📌 Visão Geral
O **Server Status Monitor** é uma extensão *open-source* para o ambiente de trabalho **GNOME Shell (v45+)**. O objetivo principal da extensão é fornecer uma indicação visual e minimalista sobre a disponibilidade/saúde de um servidor ou serviço na rede diretamente no painel superior (top bar) do GNOME, posicionado próximo aos ícones de status de rede/sistema.

- **Indicador Visual Esperado:** `🟢 ` (Online) | `🔴 ` (Offline) | `⚪ ` (Aguardando/Erro)
- **Modo de Operação:** Checagem periódica não bloqueante via requisições assíncronas do sistema (`ping`).

---

## 🛠️ Stack Tecnológica & Ferramentas

* **Ambiente Alvo:** GNOME Shell 45, 46, 47+
* **Linguagem:** JavaScript (ES6+ / ESM) executado sobre **GJS** (SpiderMonkey Engine).
* **Interface Visual de Preferências:** GTK 4 + Libadwaita (`Adw`).
* **Gerenciamento de Estado/Configurações:** GSettings (`GLib.Settings`).
* **Execução Assíncrona:** `Gio.Subprocess` + `GLib.timeout_add_seconds`.
* **IDE Recomendada:** JetBrains WebStorm (com suporte a JSDoc / Type Definitions para GJS).

---

## 📐 Identificadores do Projeto

* **Nome do Projeto:** `Server Status Monitor`
* **UUID da Extensão:** `server-status-monitor@lukasalmeida.github.io` *(substituir pelo domínio/usuário final)*
* **Esquema GSettings:** `org.gnome.shell.extensions.server-status-monitor`
* **Repositório Git:** `gnome-shell-extension-server-status-monitor`

---

## 📁 Estrutura de Arquivos

```text
server-status-monitor/
├── schemas/
│   └── org.gnome.shell.extensions.server-status-monitor.gschema.xml  # Esquema de configurações GSettings
├── extension.js                                                      # Ciclo de vida principal da extensão
├── prefs.js                                                          # Interface GTK4/Libadwaita de configurações
├── metadata.json                                                     # Metadados de publicação no extensions.gnome.org
├── jsconfig.json                                                     # Configurações de autocompletar e IDE (WebStorm)
└── context.md                                                        # Este documento de contexto

```

---

## ⚙️ Regras de Arquitetura e Boas Práticas (GNOME 45+)

1. **Padrão ES Modules (ESM):**
* Utilização estrita de `import ... from 'resource:///...'` e `import ... from 'gi://...'`.
* Exportação default herdando de `Extension` em `extension.js` e `ExtensionPreferences` em `prefs.js`.


2. **Gerenciamento de Memória & Ciclo de Vida Limpo:**
* Todo recurso iniciado em `enable()` (como `GLib.timeout_add_seconds`, escutadores de sinais em `GSettings` e elementos visuais) **DEVE** ser devidamente cancelado, desconectado ou destruído no método `disable()`.
* Vazamentos de memória (*memory leaks*) ou timers pendentes após a desativação causam rejeição automática no processo de revisão do portal do GNOME.


3. **Operações Não Bloqueantes (Thread Safe UI):**
* Nenhuma chamada I/O ou de rede pode ser executada de forma síncrona na thread principal da UI.
* O comando de rede (`ping`) deve obrigatoriamente usar `Gio.Subprocess` com chamada de callback `wait_async`.


4. **Persistência de Dados (GSettings):**
* Alterações feitas na tela de preferências (`prefs.js`) são salvas diretamente no `GSettings` e escutadas em tempo real em `extension.js` pelo sinal `'changed'`.



---

## 🧪 Comandos Úteis para Desenvolvimento Local

### 1. Compilar os Esquemas GSettings (Obrigatório após alterar o XML)

```bash
glib-compile-schemas schemas/

```

### 2. Criar Link Simbólico no Ambiente Local

```bash
ln -s "$(pwd)" ~/.local/share/gnome-shell/extensions/server-status-monitor@lukasalmeida.github.io

```

### 3. Ativar/Desativar Extensão via CLI

```bash
# Ativar
gnome-extensions enable server-status-monitor@lukasalmeida.github.io

# Desativar
gnome-extensions disable server-status-monitor@lukasalmeida.github.io

```

### 4. Visualizar Logs da Extensão em Tempo Real

```bash
journalctl -f -o cat /usr/bin/gnome-shell | grep "server-status-monitor"

```

### 5. Empacotamento Nativo para Publicação

```bash
gnome-extensions pack --force

```

---

## 🚀 Checklist para Publicação na Loja do GNOME (EGO)

* [ ] UUID válido e exclusivo formatado como `nome@dominio.com`.
* [ ] Atributos `shell-version` atualizados no `metadata.json`.
* [ ] Ausência de chamadas I/O síncronas.
* [ ] Limpeza total de listeners/timers no método `disable()`.
* [ ] Compilação válida dos esquemas `GSettings`.
* [ ] Arquivo `.zip` gerado sem incluir diretórios pai (conteúdo empacotado na raiz do zip).

```

```