// Lightweight API client exposed on `window.hhApi`
// Keep this file framework-agnostic so it can be used from inline scripts.

(function () {
  const DEFAULT_BASE_URL = '/api';

  function isLocalhostHost(hostname) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  }

  function getBaseUrl() {
    const fromGlobal =
      typeof window !== 'undefined' &&
      window.HEALTHY_HARVEST_API_BASE_URL &&
      String(window.HEALTHY_HARVEST_API_BASE_URL).trim();
    if (fromGlobal) return fromGlobal;

    // Dev-friendly fallback: if the UI is served from a static dev server
    // (e.g. VS Code Live Server on :5500), the API is usually running on :5000.
    try {
      if (
        typeof window !== 'undefined' &&
        window.location &&
        window.location.protocol.startsWith('http') &&
        isLocalhostHost(window.location.hostname) &&
        window.location.port &&
        window.location.port !== '5000'
      ) {
        return `http://${window.location.hostname}:5000/api`;
      }
    } catch (e) {}

    return DEFAULT_BASE_URL;
  }

  async function request(path, options = {}) {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}${path}`, options);
    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      const message =
        (body && body.message) ||
        (body && body.error) ||
        (typeof body === 'string' ? body : '') ||
        `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return body;
  }

  async function plantCheck(file) {
    const formData = new FormData();
    formData.append('image', file);
    return request('/plant/check', { method: 'POST', body: formData });
  }

  async function plantDiagnose(files) {
    const formData = new FormData();
    const list = Array.isArray(files) ? files : [];
    // Use a stable field name (`images`) but also include a backward-compatible single field (`image`)
    // so different multer configurations can still parse uploads.
    list.forEach((file, idx) => {
      formData.append('images', file);
      if (idx === 0) formData.append('image', file);
    });
    return request('/plant/diagnose', { method: 'POST', body: formData });
  }

  async function status() {
    return request('/status');
  }

  window.hhApi = Object.freeze({
    request,
    plantCheck,
    plantDiagnose,
    status,
  });
})();
