export function getTimestampedFileName(originalName: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  return `${baseName}_${timestamp}.${extension}`;
}
