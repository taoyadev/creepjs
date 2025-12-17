import type { WebGLFingerprint } from '../types';

/**
 * Collect WebGL fingerprint including GPU info and parameters
 */
export function collectWebGLFingerprint(): WebGLFingerprint | undefined {
  if (typeof document === 'undefined') return undefined;

  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) return undefined;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = (gl.getParameter(gl.VENDOR) as string | null) ?? 'unknown';
    const renderer =
      (gl.getParameter(gl.RENDERER) as string | null) ?? 'unknown';
    const version = (gl.getParameter(gl.VERSION) as string | null) ?? 'unknown';
    const shadingLanguageVersion =
      (gl.getParameter(gl.SHADING_LANGUAGE_VERSION) as string | null) ??
      'unknown';

    const result: WebGLFingerprint = {
      vendor,
      renderer,
      version,
      shadingLanguageVersion,
    };

    // Get unmasked vendor/renderer if available
    if (debugInfo) {
      const unmaskedVendor = gl.getParameter(
        debugInfo.UNMASKED_VENDOR_WEBGL
      ) as string | null;
      const unmaskedRenderer = gl.getParameter(
        debugInfo.UNMASKED_RENDERER_WEBGL
      ) as string | null;
      if (unmaskedVendor) {
        result.unmaskedVendor = unmaskedVendor;
      }
      if (unmaskedRenderer) {
        result.unmaskedRenderer = unmaskedRenderer;
      }
    }

    // Collect some WebGL parameters
    const parameters: Record<string, unknown> = {};
    const paramEntries: Array<[string, number]> = [
      ['MAX_TEXTURE_SIZE', gl.MAX_TEXTURE_SIZE],
      ['MAX_VERTEX_ATTRIBS', gl.MAX_VERTEX_ATTRIBS],
      ['MAX_VERTEX_UNIFORM_VECTORS', gl.MAX_VERTEX_UNIFORM_VECTORS],
      ['MAX_VARYING_VECTORS', gl.MAX_VARYING_VECTORS],
      ['MAX_FRAGMENT_UNIFORM_VECTORS', gl.MAX_FRAGMENT_UNIFORM_VECTORS],
      ['MAX_VIEWPORT_DIMS', gl.MAX_VIEWPORT_DIMS],
      ['MAX_RENDERBUFFER_SIZE', gl.MAX_RENDERBUFFER_SIZE],
    ];

    for (const [name, enumValue] of paramEntries) {
      try {
        parameters[name] = gl.getParameter(enumValue) as unknown;
      } catch (_parameterError) {
        void _parameterError;
        // Ignore parameter read errors
      }
    }

    result.parameters = parameters;

    return result;
  } catch (error) {
    console.error('WebGL fingerprinting error:', error);
    return undefined;
  }
}
