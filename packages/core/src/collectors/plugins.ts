import type { PluginFingerprint } from '../types';

/**
 * Enumerates installed navigator plugins and their exposed MIME types.
 */
export function collectPlugins(): PluginFingerprint[] | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  try {
    const raw = navigator.plugins;
    if (!raw) {
      return undefined;
    }

    const plugins: PluginFingerprint[] = [];

    for (let i = 0; i < raw.length; i += 1) {
      const plugin = raw[i];
      if (!plugin) {
        continue;
      }

      const mimeTypes: PluginFingerprint['mimeTypes'] = [];
      for (let j = 0; j < plugin.length; j += 1) {
        const mimeType = plugin[j];
        if (!mimeType) {
          continue;
        }
        mimeTypes.push({ type: mimeType.type, suffixes: mimeType.suffixes });
      }

      plugins.push({
        name: plugin.name,
        description: plugin.description,
        mimeTypes,
      });
    }

    return plugins.length ? plugins : undefined;
  } catch (error) {
    void error;
    return undefined;
  }
}
