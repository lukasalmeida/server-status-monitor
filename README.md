# Server Status Monitor

Extensão para GNOME Shell que mostra em tempo real o estado de disponibilidade de um servidor diretamente na top bar, com indicador visual minimalista e atualizações periódicas sem bloquear a interface.

## Visão geral

O projeto foi pensado para monitorar um host ou serviço na rede e indicar rapidamente se ele está:

- 🟢 Online
- 🔴 Offline
- ⚪ Aguardando / erro

A extensão usa `ping` em subprocesso assíncrono (`Gio.Subprocess`) para evitar bloqueio da interface do GNOME e mantém o estado visual atualizado em intervalos configuráveis.

## Tecnologias

- GNOME Shell 45+
- JavaScript (ES Modules)
- GJS / SpiderMonkey
- GTK 4 + Libadwaita
- GSettings
- Gio.Subprocess + GLib.timeout_add_seconds

## Estrutura do projeto

```text
server-status-monitor/
├── schemas/
│   └── org.gnome.shell.extensions.server-status-monitor.gschema.xml
├── extension.js
├── prefs.js
├── metadata.json
├── jsconfig.json
├── context.md
├── README.md
└── package.json
```

## Configuração

A extensão salva as opções em GSettings usando o esquema:

- `org.gnome.shell.extensions.server-status-monitor`

Chaves disponíveis:

- `host`: endereço IP ou hostname para monitorar
- `check-interval`: intervalo em segundos entre as verificações

## Instalação local

No diretório do projeto:

```bash
glib-compile-schemas schemas/
ln -s "$(pwd)" ~/.local/share/gnome-shell/extensions/server-status-monitor@lukasalmeida.github.io
```

Ative a extensão:

```bash
gnome-extensions enable server-status-monitor@lukasalmeida.github.io
```

Para desativar:

```bash
gnome-extensions disable server-status-monitor@lukasalmeida.github.io
```

## Desenvolvimento

### Validar esquema GSettings

```bash
glib-compile-schemas schemas/
```

### Ver logs da extensão

```bash
journalctl -f -o cat /usr/bin/gnome-shell | grep "server-status-monitor"
```

### Empacotar para publicação

```bash
gnome-extensions pack --force
```

## Observações importantes

- Nenhuma operação I/O síncrona deve ser executada na thread principal da interface.
- Recursos criados em `enable()` precisam ser limpos em `disable()`.
- O monitoramento deve ser assíncrono e seguro para a UI.

## Licença

Este projeto é um trabalho em desenvolvimento e pode ser distribuído/alterado livremente conforme os termos do repositório do autor.

Se quiser, posso também gerar um README mais profissional com badges, seções de screenshots e instruções de uso detalhadas para publicação no GitHub.
