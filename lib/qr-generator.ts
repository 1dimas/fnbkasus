import QRCode from 'qrcode';

export interface TableQrCardData {
  tableNumber: string;
  url: string;
  qrDataUrl: string;
}

export interface QrDesignConfig {
  cafeName: string;
  subtitle: string;
  instructions: string;
  theme: 'noir' | 'minimal' | 'standee';
  showUrl: boolean;
}

/**
 * Normalizes base URL and appends the table query parameter
 * Example: https://noirblanc.com/?meja=05
 */
export function buildTableOrderUrl(baseUrl: string, tableNumber: string): string {
  if (!baseUrl) return '';
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  const cleanTable = tableNumber.trim();
  const separator = cleanBase.includes('?') ? '&' : '?';
  return `${cleanBase}${separator}meja=${encodeURIComponent(cleanTable)}`;
}

/**
 * Generates high-resolution PNG Data URL for a URL
 * Uses error correction level 'H' (High - 30% recovery) so QR scans reliably even if partially smudged
 */
export async function generateQrDataUrl(
  text: string,
  width: number = 800
): Promise<string> {
  return await QRCode.toDataURL(text, {
    width,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Generates vector SVG string for maximum print sharpness
 */
export async function generateQrSvg(text: string): Promise<string> {
  return await QRCode.toString(text, {
    type: 'svg',
    margin: 2,
    errorCorrectionLevel: 'H',
  });
}

/**
 * Downloads a data URL as an image file
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads text/svg as a file
 */
export function downloadTextAsFile(content: string, filename: string, mimeType: string = 'image/svg+xml'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
