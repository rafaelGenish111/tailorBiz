/**
 * Image URL helper function
 * Handles both Cloudinary absolute URLs and local paths
 * 
 * @param {string|object} imagePath - Can be a string URL/path or an object with `url` property
 * @param {string} fallback - Fallback image path (default: '/assets/placeholder.png')
 * @returns {string} - Resolved image URL
 */
export const getImageUrl = (imagePath, fallback = '/assets/placeholder.png') => {
  // Handle null/undefined
  if (!imagePath) return fallback;
  
  // Handle object with url property (e.g., { url: '...', alt: '...' })
  const url = typeof imagePath === 'object' && imagePath !== null ? imagePath.url : imagePath;
  
  // Handle null/undefined after extraction
  if (!url) return fallback;
  
  // If it's already a full URL (Cloudinary or external), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a data URL, return as is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // For local paths, try to construct a valid URL
  // In production (Vercel), local file paths won't work, but we can try to use the backend API URL
  // In development, we can use window.location.origin or API URL
  
  // Try to use API URL if available (works in both dev and production)
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    // Remove trailing slash from API URL if present
    const baseUrl = apiUrl.replace(/\/$/, '');
    // Ensure path starts with /
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${normalizedPath}`;
  }
  
  // Fallback: use window.location.origin (works for public assets in both dev and production)
  // This assumes the image is served from the same domain or a public path
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${window.location.origin}${normalizedPath}`;
};

