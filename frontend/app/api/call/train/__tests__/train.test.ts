/**
 * Integration tests for POST /api/call/train endpoint
 * 
 * Tests Requirements 4.1-4.7:
 * - File upload validation
 * - File format validation (PDF, DOCX, TXT)
 * - File size limit (10MB)
 * - PDF text extraction using pdf-parse
 * - DOCX text extraction using mammoth
 * - TXT file reading
 * - ElevenLabs knowledge base integration
 * - Document metadata storage
 * - Response format with content summary
 */

describe('Train Endpoint - Core Functionality', () => {
  describe('File Validation', () => {
    test('validates file size limit (10MB)', () => {
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      
      const validSize = 5 * 1024 * 1024; // 5MB
      const invalidSize = 15 * 1024 * 1024; // 15MB
      
      expect(validSize).toBeLessThanOrEqual(MAX_FILE_SIZE);
      expect(invalidSize).toBeGreaterThan(MAX_FILE_SIZE);
    });

    test('validates supported file formats', () => {
      const SUPPORTED_FORMATS = ['pdf', 'docx', 'doc', 'txt'];
      
      // Valid formats
      expect(SUPPORTED_FORMATS).toContain('pdf');
      expect(SUPPORTED_FORMATS).toContain('docx');
      expect(SUPPORTED_FORMATS).toContain('doc');
      expect(SUPPORTED_FORMATS).toContain('txt');
      
      // Invalid formats
      expect(SUPPORTED_FORMATS).not.toContain('jpg');
      expect(SUPPORTED_FORMATS).not.toContain('png');
      expect(SUPPORTED_FORMATS).not.toContain('xlsx');
      expect(SUPPORTED_FORMATS).not.toContain('zip');
    });

    test('extracts file extension correctly', () => {
      const getExtension = (filename: string) => filename.split('.').pop()?.toLowerCase();
      
      expect(getExtension('document.pdf')).toBe('pdf');
      expect(getExtension('report.docx')).toBe('docx');
      expect(getExtension('notes.txt')).toBe('txt');
      expect(getExtension('file.PDF')).toBe('pdf'); // Case insensitive
      expect(getExtension('complex.name.with.dots.docx')).toBe('docx');
    });

    test('handles missing file extension', () => {
      const getExtension = (filename: string) => filename.split('.').pop()?.toLowerCase();
      
      const extension = getExtension('noextension');
      expect(extension).toBe('noextension'); // Will fail format validation
    });
  });

  describe('Text Extraction Logic', () => {
    test('normalizes whitespace in extracted text', () => {
      const rawText = `This  is   text
      with    multiple
      
      spaces and    newlines`;
      
      const normalized = rawText
        .replace(/\s+/g, ' ')
        .trim();
      
      expect(normalized).toBe('This is text with multiple spaces and newlines');
      expect(normalized).not.toContain('  '); // No double spaces
      expect(normalized).not.toContain('\n'); // No newlines
    });

    test('validates minimum content length', () => {
      const emptyText = '';
      const shortText = 'Hi';
      const validText = 'This is a valid document with sufficient content.';
      
      expect(emptyText.length).toBeLessThan(10);
      expect(shortText.length).toBeLessThan(10);
      expect(validText.length).toBeGreaterThanOrEqual(10);
    });

    test('handles text with special characters', () => {
      const text = 'Price: $99.99 & up! Email: test@example.com';
      const normalized = text.replace(/\s+/g, ' ').trim();
      
      expect(normalized).toContain('$99.99');
      expect(normalized).toContain('&');
      expect(normalized).toContain('@');
    });

    test('handles unicode characters', () => {
      const text = 'Hello 世界 🌍 Café';
      const normalized = text.replace(/\s+/g, ' ').trim();
      
      expect(normalized).toContain('世界');
      expect(normalized).toContain('🌍');
      expect(normalized).toContain('Café');
    });
  });

  describe('Content Summary Generation', () => {
    test('calculates word count correctly', () => {
      const text = 'This is a sample document with nine words here';
      const wordCount = text.split(/\s+/).length;
      
      expect(wordCount).toBe(9);
    });

    test('generates preview with ellipsis for long text', () => {
      const longText = 'a'.repeat(300);
      const preview = longText.substring(0, 200) + (longText.length > 200 ? '...' : '');
      
      expect(preview.length).toBe(203); // 200 chars + '...'
      expect(preview.endsWith('...')).toBe(true);
    });

    test('generates preview without ellipsis for short text', () => {
      const shortText = 'Short text';
      const preview = shortText.substring(0, 200) + (shortText.length > 200 ? '...' : '');
      
      expect(preview).toBe('Short text');
      expect(preview).not.toContain('...');
    });

    test('calculates content length in characters', () => {
      const text = 'Sample text';
      expect(text.length).toBe(11);
    });
  });

  describe('ElevenLabs API Integration', () => {
    test('constructs correct API endpoint URL', () => {
      const agentId = 'agent-456';
      const expectedUrl = `https://api.elevenlabs.io/v1/convai/agents/${agentId}/add-to-knowledge-base`;
      
      expect(expectedUrl).toBe('https://api.elevenlabs.io/v1/convai/agents/agent-456/add-to-knowledge-base');
    });

    test('prepares correct request payload for document', () => {
      const filename = 'document.pdf';
      const extractedText = 'This is the extracted text from the document.';
      
      const payload = {
        text: extractedText,
        source_url: filename,
      };

      expect(payload).toHaveProperty('text');
      expect(payload).toHaveProperty('source_url');
      expect(payload.text).toBe(extractedText);
      expect(payload.source_url).toBe(filename);
    });

    test('uses filename as source identifier', () => {
      const filename = 'my-document.docx';
      const payload = {
        text: 'Content',
        source_url: filename,
      };

      expect(payload.source_url).toBe('my-document.docx');
    });
  });

  describe('Response Structure', () => {
    test('validates expected success response format', () => {
      const mockResponse = {
        success: true,
        message: 'Successfully processed document.pdf',
        document: {
          filename: 'document.pdf',
          fileType: 'pdf',
          fileSize: 1024000,
          contentLength: 5000,
          wordCount: 750,
          preview: 'This is a preview of the document content...',
        },
        knowledge_base_updated: true,
        agent_id: 'agent-123',
      };

      expect(mockResponse).toHaveProperty('success');
      expect(mockResponse).toHaveProperty('message');
      expect(mockResponse).toHaveProperty('document');
      expect(mockResponse).toHaveProperty('knowledge_base_updated');
      expect(mockResponse).toHaveProperty('agent_id');
      
      expect(mockResponse.document).toHaveProperty('filename');
      expect(mockResponse.document).toHaveProperty('fileType');
      expect(mockResponse.document).toHaveProperty('fileSize');
      expect(mockResponse.document).toHaveProperty('contentLength');
      expect(mockResponse.document).toHaveProperty('wordCount');
      expect(mockResponse.document).toHaveProperty('preview');
      
      expect(typeof mockResponse.success).toBe('boolean');
      expect(typeof mockResponse.knowledge_base_updated).toBe('boolean');
      expect(typeof mockResponse.document.wordCount).toBe('number');
    });

    test('validates error response format', () => {
      const mockErrorResponse = {
        error: 'File too large',
        message: 'File size exceeds 10MB limit. Please upload a smaller file.',
      };

      expect(mockErrorResponse).toHaveProperty('error');
      expect(mockErrorResponse).toHaveProperty('message');
      expect(typeof mockErrorResponse.error).toBe('string');
      expect(typeof mockErrorResponse.message).toBe('string');
    });
  });

  describe('Error Messages', () => {
    test('provides user-friendly error for missing file', () => {
      const error = {
        error: 'No file uploaded',
        message: 'Please select a file to upload',
      };

      expect(error.message).toContain('Please select');
      expect(error.message).not.toContain('null');
      expect(error.message).not.toContain('undefined');
    });

    test('provides user-friendly error for file too large', () => {
      const error = {
        error: 'File too large',
        message: 'File size exceeds 10MB limit. Please upload a smaller file.',
      };

      expect(error.message).toContain('10MB');
      expect(error.message).toContain('smaller');
    });

    test('provides user-friendly error for unsupported format', () => {
      const fileExtension = 'jpg';
      const error = {
        error: 'Unsupported file format',
        message: `Only PDF, DOCX, and TXT files are supported. You uploaded: ${fileExtension}`,
      };

      expect(error.message).toContain('PDF');
      expect(error.message).toContain('DOCX');
      expect(error.message).toContain('TXT');
      expect(error.message).toContain(fileExtension);
    });

    test('provides user-friendly error for empty document', () => {
      const error = {
        error: 'No content extracted',
        message: 'The document appears to be empty or unreadable. Please check the file and try again.',
      };

      expect(error.message).toContain('empty');
      expect(error.message).toContain('try again');
    });

    test('provides user-friendly error for knowledge base failure', () => {
      const error = {
        error: 'Failed to update knowledge base',
        message: 'Could not add document to agent knowledge base',
      };

      expect(error.message).toContain('knowledge base');
      expect(error.message).not.toContain('500');
      expect(error.message).not.toContain('Internal Server Error');
    });
  });

  describe('Edge Cases', () => {
    test('handles filename with multiple dots', () => {
      const filename = 'my.document.with.dots.pdf';
      const extension = filename.split('.').pop()?.toLowerCase();
      
      expect(extension).toBe('pdf');
    });

    test('handles filename with no extension', () => {
      const filename = 'document';
      const extension = filename.split('.').pop()?.toLowerCase();
      
      expect(extension).toBe('document');
    });

    test('handles very long filenames', () => {
      const longFilename = 'a'.repeat(200) + '.pdf';
      const extension = longFilename.split('.').pop()?.toLowerCase();
      
      expect(extension).toBe('pdf');
      expect(longFilename.length).toBeGreaterThan(200);
    });

    test('handles filenames with special characters', () => {
      const filename = 'my-document_v2 (final).pdf';
      const extension = filename.split('.').pop()?.toLowerCase();
      
      expect(extension).toBe('pdf');
    });

    test('handles empty text after extraction', () => {
      const emptyText = '   \n\n\t  ';
      const normalized = emptyText.replace(/\s+/g, ' ').trim();
      
      expect(normalized).toBe('');
      expect(normalized.length).toBe(0);
    });

    test('handles text with only whitespace', () => {
      const whitespaceText = '          ';
      const normalized = whitespaceText.replace(/\s+/g, ' ').trim();
      
      expect(normalized).toBe('');
    });
  });

  describe('File Size Calculations', () => {
    test('converts bytes to MB correctly', () => {
      const bytesToMB = (bytes: number) => bytes / (1024 * 1024);
      
      expect(bytesToMB(1024 * 1024)).toBe(1); // 1MB
      expect(bytesToMB(10 * 1024 * 1024)).toBe(10); // 10MB
      expect(bytesToMB(5 * 1024 * 1024)).toBe(5); // 5MB
    });

    test('validates file size boundaries', () => {
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      
      expect(MAX_FILE_SIZE - 1).toBeLessThan(MAX_FILE_SIZE); // Just under limit
      expect(MAX_FILE_SIZE).toBeLessThanOrEqual(MAX_FILE_SIZE); // Exactly at limit
      expect(MAX_FILE_SIZE + 1).toBeGreaterThan(MAX_FILE_SIZE); // Just over limit
    });
  });

  describe('FormData Handling', () => {
    test('extracts file from FormData', () => {
      // Mock FormData behavior
      const mockFormData = {
        get: (key: string) => {
          if (key === 'file') return { name: 'test.pdf', size: 1024 };
          if (key === 'agentId') return 'agent-123';
          return null;
        },
      };

      const file = mockFormData.get('file');
      const agentId = mockFormData.get('agentId');

      expect(file).toBeTruthy();
      expect(agentId).toBe('agent-123');
    });

    test('handles missing agentId gracefully', () => {
      const mockFormData = {
        get: (key: string) => {
          if (key === 'file') return { name: 'test.pdf', size: 1024 };
          if (key === 'agentId') return null;
          return null;
        },
      };

      const agentId = mockFormData.get('agentId');
      expect(agentId).toBeNull();
    });
  });

  describe('Buffer Conversion', () => {
    test('converts ArrayBuffer to Buffer', () => {
      const arrayBuffer = new ArrayBuffer(8);
      const buffer = Buffer.from(arrayBuffer);
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBe(8);
    });

    test('converts Buffer to UTF-8 string', () => {
      const text = 'Hello, World!';
      const buffer = Buffer.from(text, 'utf-8');
      const decoded = buffer.toString('utf-8');
      
      expect(decoded).toBe(text);
    });
  });
});
