import Papa from 'papaparse';

export interface Contact {
  name: string;
  phone: string;
  metadata?: Record<string, any>;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

export interface ParseResult {
  valid: Contact[];
  invalid: ValidationError[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicates: number;
  };
}

/**
 * Validates phone number format (E.164 format)
 * E.164 format: +[country code][number]
 * Example: +14155552671
 */
export function isValidE164PhoneNumber(phone: string): boolean {
  // E.164 format: +[1-9][0-9]{1,14}
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

/**
 * Attempts to infer country code and format phone number to E.164
 * @param phone - Phone number to format
 * @param defaultCountryCode - Default country code to use (e.g., "1" for US)
 * @returns Formatted phone number or null if invalid
 */
export function inferAndFormatPhoneNumber(
  phone: string,
  defaultCountryCode: string = "1"
): string | null {
  // Remove all non-digit characters except leading +
  const hasPlus = phone.trim().startsWith('+');
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (!digitsOnly) {
    return null;
  }

  // If already has country code (starts with +), format and validate
  if (hasPlus) {
    const formatted = `+${digitsOnly}`;
    return isValidE164PhoneNumber(formatted) ? formatted : null;
  }

  // If number starts with country code (e.g., 14155552671)
  if (digitsOnly.length > 10) {
    const formatted = `+${digitsOnly}`;
    return isValidE164PhoneNumber(formatted) ? formatted : null;
  }

  // If number is 10 digits (US format without country code)
  if (digitsOnly.length === 10) {
    const formatted = `+${defaultCountryCode}${digitsOnly}`;
    return isValidE164PhoneNumber(formatted) ? formatted : null;
  }

  // If number is less than 10 digits, it's likely invalid
  if (digitsOnly.length < 10) {
    return null;
  }

  // Try with default country code
  const formatted = `+${defaultCountryCode}${digitsOnly}`;
  return isValidE164PhoneNumber(formatted) ? formatted : null;
}

/**
 * Parses and validates CSV file for contact import
 * @param file - CSV file to parse
 * @param defaultCountryCode - Default country code for phone number inference
 * @returns Promise with parse results
 */
export async function parseAndValidateCSV(
  file: File,
  defaultCountryCode: string = "1"
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const validContacts: Contact[] = [];
    const errors: ValidationError[] = [];
    const seenPhones = new Set<string>();
    let duplicateCount = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: (results) => {
        const data = results.data as any[];
        
        // Validate required columns
        if (data.length === 0) {
          reject(new Error('CSV file is empty'));
          return;
        }

        const firstRow = data[0];
        const headers = Object.keys(firstRow);
        
        if (!headers.includes('name')) {
          errors.push({
            row: 0,
            field: 'name',
            value: '',
            error: 'Required column "name" is missing from CSV'
          });
        }
        
        if (!headers.includes('phone')) {
          errors.push({
            row: 0,
            field: 'phone',
            value: '',
            error: 'Required column "phone" is missing from CSV'
          });
        }

        // If required columns are missing, return early
        if (errors.length > 0) {
          resolve({
            valid: [],
            invalid: errors,
            summary: {
              totalRows: data.length,
              validRows: 0,
              invalidRows: data.length,
              duplicates: 0
            }
          });
          return;
        }

        // Process each row
        data.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // +2 because index is 0-based and we skip header
          const rowErrors: ValidationError[] = [];

          // Validate name
          const name = row.name?.trim();
          if (!name) {
            rowErrors.push({
              row: rowNumber,
              field: 'name',
              value: row.name || '',
              error: 'Name is required'
            });
          }

          // Validate and format phone number
          const rawPhone = row.phone?.trim();
          if (!rawPhone) {
            rowErrors.push({
              row: rowNumber,
              field: 'phone',
              value: '',
              error: 'Phone number is required'
            });
          } else {
            const formattedPhone = inferAndFormatPhoneNumber(rawPhone, defaultCountryCode);
            
            if (!formattedPhone) {
              rowErrors.push({
                row: rowNumber,
                field: 'phone',
                value: rawPhone,
                error: `Invalid phone number format. Expected E.164 format (e.g., +14155552671)`
              });
            } else {
              // Check for duplicates
              if (seenPhones.has(formattedPhone)) {
                duplicateCount++;
                rowErrors.push({
                  row: rowNumber,
                  field: 'phone',
                  value: formattedPhone,
                  error: 'Duplicate phone number in CSV'
                });
              } else {
                seenPhones.add(formattedPhone);
                
                // If no errors, add to valid contacts
                if (rowErrors.length === 0) {
                  // Extract metadata (all columns except name and phone)
                  const metadata: Record<string, any> = {};
                  Object.keys(row).forEach(key => {
                    if (key !== 'name' && key !== 'phone' && row[key]) {
                      metadata[key] = row[key];
                    }
                  });

                  validContacts.push({
                    name,
                    phone: formattedPhone,
                    metadata: Object.keys(metadata).length > 0 ? metadata : undefined
                  });
                }
              }
            }
          }

          // Add row errors to main errors array
          errors.push(...rowErrors);
        });

        resolve({
          valid: validContacts,
          invalid: errors,
          summary: {
            totalRows: data.length,
            validRows: validContacts.length,
            invalidRows: errors.length,
            duplicates: duplicateCount
          }
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

/**
 * Generates a corrected CSV with error annotations
 * @param originalFile - Original CSV file
 * @param errors - Validation errors
 * @returns CSV string with error annotations
 */
export async function generateCorrectedCSV(
  originalFile: File,
  errors: ValidationError[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    Papa.parse(originalFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const headers = results.meta.fields || [];
        
        // Add error column if not present
        const newHeaders = [...headers, 'validation_errors'];
        
        // Create error map by row number
        const errorMap = new Map<number, string[]>();
        errors.forEach(error => {
          if (!errorMap.has(error.row)) {
            errorMap.set(error.row, []);
          }
          errorMap.get(error.row)!.push(`${error.field}: ${error.error}`);
        });

        // Add error annotations to rows
        const annotatedData = data.map((row: any, index: number) => {
          const rowNumber = index + 2;
          const rowErrors = errorMap.get(rowNumber) || [];
          
          return {
            ...row,
            validation_errors: rowErrors.length > 0 ? rowErrors.join('; ') : ''
          };
        });

        // Generate CSV string
        const csv = Papa.unparse({
          fields: newHeaders,
          data: annotatedData
        });

        resolve(csv);
      },
      error: (error) => {
        reject(new Error(`CSV generation error: ${error.message}`));
      }
    });
  });
}

/**
 * Downloads a CSV file
 * @param csvContent - CSV content as string
 * @param filename - Filename for download
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
