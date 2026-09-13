import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class ServerStatusMonitorExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._checkInterval = this._settings.get_int('check-interval');
    this._host = this._settings.get_string('host');

    this._button = new PanelMenu.Button(0.0, 'Server Status Monitor');
    this._button.add_style_class_name('panel-button');

    this._icon = new St.Icon({
      icon_name: 'network-transmit-symbolic',
      style_class: 'system-status-icon',
      icon_size: 16,
    });

    this._statusLabel = new St.Label({
      text: '⏳',
      y_align: Clutter.ActorAlign.CENTER,
    });

    this._button.add_child(this._icon);
    this._button.add_child(this._statusLabel);
    this._button.tooltip_text = `Server status: ${this._host}`;

    this._status = 'waiting';
    this._panelPosition = Main.panel.addToStatusArea('server-status-monitor', this._button, 0, 'right');

    this._settingsSignalIds = [
      this._settings.connect('changed::host', () => this._reloadFromSettings()),
      this._settings.connect('changed::check-interval', () => this._reloadFromSettings()),
    ];

    this._scheduleNextCheck();
    this._checkServer();
  }

  disable() {
    if (this._timeoutId) {
      GLib.source_remove(this._timeoutId);
      this._timeoutId = null;
    }

    for (const id of this._settingsSignalIds || []) {
      this._settings.disconnect(id);
    }
    this._settingsSignalIds = [];

    this._panelPosition?.destroy();
    this._button?.destroy();

    this._settings = null;
    this._status = null;
    this._host = null;
    this._checkInterval = null;
    this._panelPosition = null;
    this._button = null;
    this._icon = null;
    this._statusLabel = null;
  }

  _reloadFromSettings() {
    const nextHost = this._settings.get_string('host');
    const nextInterval = this._settings.get_int('check-interval');

    if (nextHost !== this._host || nextInterval !== this._checkInterval) {
      this._host = nextHost;
      this._checkInterval = nextInterval;
      this._button.tooltip_text = `Server status: ${this._host}`;

      if (this._timeoutId) {
        GLib.source_remove(this._timeoutId);
        this._timeoutId = null;
      }

      this._scheduleNextCheck();
      this._checkServer();
    }
  }

  _scheduleNextCheck() {
    if (this._timeoutId) {
      GLib.source_remove(this._timeoutId);
    }

    this._timeoutId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      Math.max(5, this._checkInterval),
      () => {
        this._checkServer();
        return GLib.SOURCE_CONTINUE;
      }
    );
  }

  _checkServer() {
    if (!this._host || !this._host.trim()) {
      this._updateStatus('waiting', 'No host configured');
      return;
    }

    const args = ['ping', '-c', '1', '-W', '2', this._host];
    const subprocess = Gio.Subprocess.new(
      args,
      Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
    );

    subprocess.wait_async(null, (_, result) => {
      try {
        const ok = subprocess.wait_finish(result);
        const success = ok && subprocess.get_successful();
        this._updateStatus(success ? 'online' : 'offline', this._host);
      } catch (error) {
        this._updateStatus('waiting', error.message);
      }
    });
  }

  _updateStatus(state, host) {
    if (!this._statusLabel) {
      return;
    }

    this._status = state;
    const statusMap = {
      online: { label: '🟢', icon: 'network-transmit-symbolic' },
      offline: { label: '🔴', icon: 'network-error-symbolic' },
      waiting: { label: '⚪', icon: 'network-offline-symbolic' },
    };

    const next = statusMap[state] || statusMap.waiting;
    this._statusLabel.text = next.label;
    this._icon.icon_name = next.icon;
    this._button.tooltip_text = `Server status: ${host}`;
  }
}
