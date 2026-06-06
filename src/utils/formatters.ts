import { format } from 'date-fns';

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined) return '--';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(isoString: string): string {
  try {
    return format(new Date(isoString), 'MMM d, yyyy');
  } catch (e) {
    return '--';
  }
}
