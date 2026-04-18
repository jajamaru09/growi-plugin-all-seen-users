import { createRoot, type Root } from 'react-dom/client';
import { SeenUsersAction } from './src/components/SeenUsersAction';
import type { PluginRegistration } from './src/hub-types';

const PLUGIN_NAME = 'growi-plugin-all-seen-users';
const ACTION_MOUNT_ID = 'growi-plugin-seen-users-action';

let actionRoot: Root | null = null;

function registerToHub(plugin: PluginRegistration): void {
  const hub = (window as any).growiPluginHub;
  if (hub?.register) {
    hub.register(plugin);
  } else {
    (window as any).growiPluginHub ??= { _queue: [] };
    (window as any).growiPluginHub._queue.push(plugin);
  }
}

function showAction(pageId: string): void {
  const hub = (window as any).growiPluginHub;
  hub.log(PLUGIN_NAME, 'open modal, pageId:', pageId);
  cleanupAction();
  const el = document.createElement('div');
  el.id = ACTION_MOUNT_ID;
  document.body.appendChild(el);
  actionRoot = createRoot(el);
  actionRoot.render(<SeenUsersAction pageId={pageId} onClose={cleanupAction} />);
}

function cleanupAction(): void {
  actionRoot?.unmount();
  actionRoot = null;
  document.getElementById(ACTION_MOUNT_ID)?.remove();
}

function activate(): void {
  registerToHub({
    id: PLUGIN_NAME,
    label: '閲覧者一覧',
    icon: 'group',
    order: 10,
    onPageChange: (ctx) => {
      if (ctx.mode === 'edit') {
        cleanupAction();
        return;
      }
      const hub = (window as any).growiPluginHub;
      hub.log(PLUGIN_NAME, 'page change:', ctx.pageId);
    },
    onAction: (pageId) => showAction(pageId),
    onDisable: () => {
      cleanupAction();
    },
  });
}

function deactivate(): void {
  cleanupAction();
  (window as any).growiPluginHub?.unregister(PLUGIN_NAME);
}

if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators[PLUGIN_NAME] = { activate, deactivate };
