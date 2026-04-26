import {
  isValidE164PhoneNumber,
  inferAndFormatPhoneNumber,
  parseAndValidateCSV,
  generateCorrectedCSV,
} from './csvParser';

describe('csvParser', () => {
  describe('isValidE164PhoneNumber', () => {
    it('should validate correct E.164 phone numbers', () => {
      expect(isValidE164PhoneNumber('+14155552671')).toBe(true);
      expect(isValidE164PhoneNumber('+442071838750')).toBe(true);
      expect(isValidE164PhoneNumber('+919876543210')).toBe(true);
    });

    it('should reject invalid E.164 phone numbers', () => {
      expect(isValidE164PhoneNumber('4155552671')).toBe(false); // Missing +
      expect(isValidE164PhoneNumber('+0155552671')).toBe(false); // Starts with 0
      expect(isValidE164PhoneNumber('+1')).toBe(false); // Too short
      expect(isValidE164PhoneNumber('+123456789012345678')).toBe(false); // Too long
      expect(isValidE164PhoneNumber('invalid')).toBe(false);
      expect(isValidE164PhoneNumber('')).toBe(false);
    });
  });

  describe('inferAndFormatPhoneNumber', () => {
    it('should format 10-digit US numbers', () => {
      expect(inferAndFormatPhoneNumber('4155552671')).toBe('+14155552671');
      expect(inferAndFormatPhoneNumber('415-555-2671')).toBe('+14155552671');
      expect(inferAndFormatPhoneNumber('(415) 555-2671')).toBe('+14155552671');
    });

    it('should handle numbers with country code', () => {
      expect(inferAndFormatPhoneNumber('14155552671')).toBe('+14155552671');
      expect(inferAndFormatPhoneNumber('+14155552671')).toBe('+14155552671');
    });

    it('should use custom country code', () => {
      expect(inferAndFormatPhoneNumber('2071838750', '44')).toBe('+442071838750');
    });

    it('should return null for invalid numbers', () => {
      expect(inferAndFormatPhoneNumber('123')).toBe(null); // Too short
      expect(inferAndFormatPhoneNumber('invalid')).toBe(null);
      expect(inferAndFormatPhoneNumber('')).toBe(null);
    });

    it('should handle numbers with spaces and special characters', () => {
      expect(inferAndFormatPhoneNumber('+1 (415) 555-2671')).toBe('+14155552671');
      expect(inferAndFormatPhoneNumber('1-415-555-2671')).toBe('+14155552671');
    });
  });

  describe('parseAndValidateCSV', () => {
    it('should parse valid CSV with required columns', async () => {
      const csvContent = `name,phone
John Doe,+14155552671
Jane Smith,4155552672`;
      
      const file = new File([csvContent], 'contacts.csv', { type: 'text/csv' });
      const result = await parseAndValidateCSV(file);

      expect(result.valid).toHaveLength(2);
      expect(result.valid[0]).toEqual({
        name: 'John Doe',
        phone: '+14155552671',
      });
      expect(result.valid[1]).toEqual({
        name: 'Jane Smith',
        phone: '+14155552672',
      });
      expect(result.summary.validRows).toBe(2);
      expect(result.summary.invalidRows).toBe(0);
    });

    it('should capture metadata columns', async () => {
      const csvContent = `name,phone,company,notes
John Doe,+14155552671,Acme Inc,VIP customer`;
      
      const file = new File([csvContent], 'contacts.csv', { type: 'text/csv' });
      const result = await parseAndValidateCSV(file);

      expect(result.valid).toHaveLength(1);
      expect(result.valid[0].metadata).toEqual({
        company: 'Acme Inc',
        notes: 'VIP customer',
      });
    });

    it('should detect missing required columns', async () => {
      const csvContent = `name,email
John Doe,john@example.com`;
      
      const file = new File([csvContent], 'contacts.csv', { type: 'text/csv' });
      const result = await parseAndValidateCSV(file);

      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].error).toContain('Required column "phone" is missing');
    });

    it('should validate phone number format', async () => {
      const csvContent = `name,phone
John Doe,invalid-phone
Jane Smith,+14155552672`;
      
      const file = new File([csvContent], 'contacts.csv', { type: 'text/csv' });
      const result = await parseAndValidateCSV(file);

      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].row).toBe(2);
      expect(result.invalid[0].field).toBe('phone');
      expect(result.invalid[0].error).toContain('Invalid phone number format');
    });

    it('should detect duplicate phone numbers', async () => {
      const csvContent = `name,phone
John Doe,+14155552671
Jane Smith,+14155552671`;
      
      const file = new File([csvContent], 'contacts.csv', { type: 'text/csv' });
      const result = await parseAndValidateCSV(file);

      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].error).toContain('Duplicate phone number');
      expect(result.summary.duplicates).toBe(1);
    });

    it('should validate required name field', async () => {
      const csvContent = `name,phone
,+14155552671
Jane Smith,+14155552672`;
      
      const file = new File([csvContent], 'contacts.csv', { type: 'text/csv' });
      const result = await parseAndValidateCSV(file);

      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].field).toBe('name');
      expect(result.invalid[0].error).toContain('Name is required');
    });

    it('should handle empty CSV', async () => {
      const csvContent = `name,phone`;
      
      const file = new File([csvContent], 'contacts.csv', { type: 'text/csv' });
      
      await expect(parseAndValidateCSV(file)).rejects.toThrow('CSV file is empty');
    });

    it('should infer country code for US numbers', async () => {
      const csvContent = `name,phone
John Doe,4155552671`;
      
      const file = new File([csvContent], 'contacts.csv', { type: 'text/csv' });
      const result = await parseAndValidateCSV(file, '1');

      expect(result.valid).toHaveLength(1);
      expect(result.valid[0].phone).toBe('+14155552671');
    });

    it('should handle case-insensitive headers', async () => {
      const csvContent = `Name,Phone
John Doe,+14155552671`;
      
      const file = new File([csvContent], 'contacts.csv', { type: 'text/csv' });
      const result = await parseAndValidateCSV(file);

      expect(result.valid).toHaveLength(1);
      expect(result.valid[0].name).toBe('John Doe');
    });
  });

  describe('generateCorrectedCSV', () => {
    it('should add error annotations to CSV', async () => {
      const csvContent = `name,phone
John Doe,invalid
Jane Smith,+14155552672`;
      
      const file = new File([csvContent], 'contacts.csv', { type: 'text/csv' });
      const errors = [
        {
          row: 2,
          field: 'phone',
          value: 'invalid',
          error: 'Invalid phone number format',
        },
      ];

      const correctedCSV = await generateCorrectedCSV(file, errors);

      expect(correctedCSV).toContain('validation_errors');
      expect(correctedCSV).toContain('phone: Invalid phone number format');
    });

    it('should handle multiple errors per row', async () => {
      const csvContent = `name,phone
,invalid`;
      
      const file = new File([csvContent], 'contacts.csv', { type: 'text/csv' });
      const errors = [
        {
          row: 2,
          field: 'name',
          value: '',
          error: 'Name is required',
        },
        {
          row: 2,
          field: 'phone',
          value: 'invalid',
          error: 'Invalid phone number format',
        },
      ];

      const correctedCSV = await generateCorrectedCSV(file, errors);

      expect(correctedCSV).toContain('name: Name is required');
      expect(correctedCSV).toContain('phone: Invalid phone number format');
    });
  });
});
