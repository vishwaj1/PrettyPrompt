// lib/slug.ts
export function slugify(str: string) {
    return str
      .trim()
      .replace(/\s+/g, '-')       // spaces → dashes
      .replace(/[^\w-]/g, '')     // remove any non-word/dash chars
  }
  export function unslugify(slug: string) {
    // reverse if needed; here we just replace dashes with spaces and capitalize
    return slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }
  