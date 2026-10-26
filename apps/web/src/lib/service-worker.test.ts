import { describe, expect, it, vi } from 'vitest';
import { registerServiceWorker } from './service-worker';

class FakeEvents {
  private listeners = new Map<string, Array<() => void>>();

  addEventListener(type: string, callback: () => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), callback]);
  }

  emit(type: string) {
    for (const callback of this.listeners.get(type) ?? []) callback();
  }
}

class FakeWorker extends FakeEvents {
  state = 'installing';
  postMessage = vi.fn();
}

function setup({
  controller = null as object | null,
  waiting = null as FakeWorker | null,
} = {}) {
  const registration = Object.assign(new FakeEvents(), {
    installing: null as FakeWorker | null,
    waiting,
  });
  const container = Object.assign(new FakeEvents(), {
    controller,
    register: vi.fn().mockResolvedValue(registration),
  });
  const promptRefresh = vi.fn<(accept: () => void) => void>();
  const reload = vi.fn();

  registerServiceWorker(container as unknown as ServiceWorkerContainer, {
    promptRefresh,
    reload,
  });

  return { container, registration, promptRefresh, reload };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('registerServiceWorker', () => {
  it('does not reload when a first install claims the page', async () => {
    const { container, promptRefresh, reload } = setup();
    await flush();

    container.controller = {};
    container.emit('controllerchange');

    expect(promptRefresh).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('reloads once after the visitor accepts an update', async () => {
    const { container, registration, promptRefresh, reload } = setup({
      controller: {},
    });
    await flush();

    const worker = new FakeWorker();
    registration.installing = worker;
    registration.emit('updatefound');
    worker.state = 'installed';
    worker.emit('statechange');

    expect(promptRefresh).toHaveBeenCalledTimes(1);
    container.emit('controllerchange');
    expect(reload).not.toHaveBeenCalled();

    promptRefresh.mock.calls[0][0]();
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

    container.emit('controllerchange');
    container.emit('controllerchange');
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('offers an update that was already waiting at page load', async () => {
    const waiting = new FakeWorker();
    const { promptRefresh } = setup({ controller: {}, waiting });
    await flush();

    expect(promptRefresh).toHaveBeenCalledTimes(1);
    promptRefresh.mock.calls[0][0]();
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });
});
