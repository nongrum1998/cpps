import { PAGE_ROUTES } from '@utils/constants';
import { Directory, File, Paths } from 'expo-file-system';
import { Route, router } from 'expo-router';

/**
 * Writes a base64-encoded PDF to the app cache directory and navigates to the
 * PDF preview screen to display it.
 *
 * Accepts either a raw base64 string or a `data:application/pdf;base64,...`
 * data URI (the prefix is stripped automatically). The PDF is persisted as
 * `<name>.pdf` in the expo-file-system cache directory, so callers should pass
 * a unique, meaningful name per document (e.g. a payslip number). Invalid
 * filename characters are replaced with `-`.
 *
 * Side effects:
 * - Creates the cache directory if it does not exist.
 * - Creates or overwrites the cache file.
 * - Pushes the PDF preview route (`PAGE_ROUTES.PREVIEW.PDF`) with the file URI.
 *
 * @param base64Pdf - Base64-encoded PDF bytes, optionally prefixed with
 *   `data:application/pdf;base64,`.
 * @param name - File stem used for the cache file; sanitized to `\w.-` and
 *   suffixed with `.pdf`.
 * @example
 * ```ts
 * previewBase64PDF(payslip.pdf, `${payslip.payslip_no}-${payslip.payslip_date}`);
 * ```
 */
export function previewBase64PDF(base64Pdf: string, name: string) {
  const base64 = base64Pdf.replace(/^data:application\/pdf;base64,/, '');

  // Ensure the cache directory exists
  const cacheDir = new Directory(Paths.cache);
  cacheDir.create({ idempotent: true, intermediates: true });

  const pdfName = `${name}.pdf`;

  const fileName = [pdfName]
    .filter(Boolean)
    .join('-')
    .replace(/[^\w.-]+/g, '-'); // remove invalid filename characters

  const file = new File(cacheDir, fileName);

  // Create or overwrite the file
  file.create({ intermediates: true, overwrite: true });

  // Write the PDF bytes
  file.write(base64, { encoding: 'base64' });

  // Navigate to your preview screen
  router.push(PAGE_ROUTES.PREVIEW.PDF.replace(':uri', file.uri) as Route);
}
