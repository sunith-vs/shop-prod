export function getTimestampedFileName(originalName: string): string {
  const timestamp = Date.now();
  // clean file name with space removal and lowercase
    const cleanedName = originalName.replace(/\s+/g, '_').toLowerCase();

  const extension = cleanedName.split('.').pop();
  const baseName = cleanedName.split('.').slice(0, -1).join('.');
  return `${baseName}_${timestamp}.${extension}`;
}
