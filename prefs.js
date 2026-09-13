import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ServerStatusMonitorPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage({
      title: 'General',
      icon_name: 'preferences-system-symbolic',
    });

    const group = new Adw.PreferencesGroup({
      title: 'Monitoring',
    });

    const hostRow = new Adw.ActionRow({
      title: 'Host',
      subtitle: 'IP or domain to monitor',
    });

    const hostEntry = new Gtk.Entry({
      hexpand: true,
      text: settings.get_string('host'),
    });

    settings.bind('host', hostEntry, 'text', Gio.SettingsBindFlags.DEFAULT);
    hostRow.add_suffix(hostEntry);
    hostRow.activatable_widget = hostEntry;
    group.add(hostRow);

    const intervalRow = new Adw.ActionRow({
      title: 'Interval',
      subtitle: 'Seconds between checks',
    });

    const intervalSpin = new Gtk.SpinButton({
      adjustment: new Gtk.Adjustment({
        lower: 5,
        upper: 300,
        step_increment: 5,
        value: settings.get_int('check-interval'),
      }),
      numeric: true,
      snap_to_ticks: true,
    });

    settings.bind('check-interval', intervalSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
    intervalRow.add_suffix(intervalSpin);
    intervalRow.activatable_widget = intervalSpin;
    group.add(intervalRow);

    page.add(group);
    window.add(page);
  }
}
