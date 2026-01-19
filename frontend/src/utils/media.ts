const MEDIA_BASE_URL = 'http://localhost:8000';

export const buildMediaUrl = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const normalizedPath = path.replace(/\\/g, '/');
  const encodedPath = normalizedPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `${MEDIA_BASE_URL}/${encodedPath}`;
};
