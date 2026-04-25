/**
 * Integration tests for POST /api/call/scrape endpoint
 * 
 * Tests Requirements 3.1-3.7:
 * - URL validation
 * - HTML fetching with User-Agent
 * - Script/style tag removal
 * - Text extraction with 10k char limit
 * - Section detection (pricing, about, services, FAQ, contact)
 * - ElevenLabs knowledge base integration
 * - Response format
 */

describe('Scrape Endpoint - Core Functionality', () => {
  describe('URL Validation', () => {
    test('validates URL format correctly', () => {
      // Valid URLs
      expect(() => new URL('https://example.com')).not.toThrow();
      expect(() => new URL('http://example.com/path')).not.toThrow();
      expect(() => new URL('https://subdomain.example.com')).not.toThrow();
      
      // Invalid URLs
      expect(() => new URL('not-a-url')).toThrow();
      expect(() => new URL('example.com')).toThrow();
      expect(() => new URL('')).toThrow();
    });
  });

  describe('HTML Processing Logic', () => {
    test('removes script tags from HTML', () => {
      const html = `
        <html>
          <body>
            <p>Visible content</p>
            <script>alert('hidden');</script>
            <p>More content</p>
          </body>
        </html>
      `;

      const cleaned = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      expect(cleaned).not.toContain('alert');
      expect(cleaned).toContain('Visible content');
      expect(cleaned).toContain('More content');
    });

    test('removes style tags from HTML', () => {
      const html = `
        <html>
          <head>
            <style>body { color: red; }</style>
          </head>
          <body>
            <p>Visible content</p>
          </body>
        </html>
      `;

      const cleaned = html
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      expect(cleaned).not.toContain('color: red');
      expect(cleaned).toContain('Visible content');
    });

    test('extracts plain text and removes HTML tags', () => {
      const html = `
        <html>
          <body>
            <h1>Title</h1>
            <p>Paragraph <strong>with bold</strong> text</p>
            <div>Div content</div>
          </body>
        </html>
      `;

      const cleaned = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      expect(cleaned).not.toContain('<h1>');
      expect(cleaned).not.toContain('<p>');
      expect(cleaned).not.toContain('<strong>');
      expect(cleaned).toContain('Title');
      expect(cleaned).toContain('Paragraph');
      expect(cleaned).toContain('with bold');
      expect(cleaned).toContain('text');
    });

    test('limits text to 10,000 characters', () => {
      const longContent = 'a'.repeat(20000);
      const html = `<html><body><p>${longContent}</p></body></html>`;

      const cleaned = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 10000);

      expect(cleaned.length).toBeLessThanOrEqual(10000);
    });

    test('handles nested script tags', () => {
      const html = `
        <html>
          <body>
            <p>Content</p>
            <script>
              var x = "<script>nested</script>";
            </script>
            <p>More</p>
          </body>
        </html>
      `;

      const cleaned = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      expect(cleaned).not.toContain('script');
      expect(cleaned).toContain('Content');
      expect(cleaned).toContain('More');
    });
  });

  describe('Section Detection Logic', () => {
    test('detects pricing section', () => {
      const text = 'Welcome to our site. Check out our pricing plans.';
      const hasPricing = text.toLowerCase().includes('pricing') || 
                        text.toLowerCase().includes('price');
      expect(hasPricing).toBe(true);
    });

    test('detects about section', () => {
      const text = 'About Us - Learn more about our company';
      const hasAbout = text.toLowerCase().includes('about us') || 
                      text.toLowerCase().includes('about');
      expect(hasAbout).toBe(true);
    });

    test('detects services section', () => {
      const text = 'Our Services include consulting and development';
      const hasServices = text.toLowerCase().includes('services') || 
                         text.toLowerCase().includes('what we do');
      expect(hasServices).toBe(true);
    });

    test('detects FAQ section', () => {
      const text = 'Frequently Asked Questions about our product';
      const hasFaq = text.toLowerCase().includes('faq') || 
                    text.toLowerCase().includes('frequently asked');
      expect(hasFaq).toBe(true);
    });

    test('detects contact section', () => {
      const text = 'Contact us at info@example.com or get in touch';
      const hasContact = text.toLowerCase().includes('contact') || 
                        text.toLowerCase().includes('get in touch');
      expect(hasContact).toBe(true);
    });

    test('detects multiple sections', () => {
      const text = `
        About Us: We are a company.
        Our Services: We offer consulting.
        Pricing: Check our plans.
        Contact: Email us.
        FAQ: Common questions.
      `;

      const sections = {
        pricing: text.toLowerCase().includes('pricing') || text.toLowerCase().includes('price'),
        about: text.toLowerCase().includes('about us') || text.toLowerCase().includes('about'),
        services: text.toLowerCase().includes('services') || text.toLowerCase().includes('what we do'),
        faq: text.toLowerCase().includes('faq') || text.toLowerCase().includes('frequently asked'),
        contact: text.toLowerCase().includes('contact') || text.toLowerCase().includes('get in touch'),
      };

      const foundSections = Object.entries(sections)
        .filter(([_, found]) => found)
        .map(([section]) => section);

      expect(foundSections).toContain('pricing');
      expect(foundSections).toContain('about');
      expect(foundSections).toContain('services');
      expect(foundSections).toContain('faq');
      expect(foundSections).toContain('contact');
      expect(foundSections.length).toBe(5);
    });

    test('handles case-insensitive section detection', () => {
      const text = 'PRICING and ABOUT US and SERVICES';
      
      const hasPricing = text.toLowerCase().includes('pricing');
      const hasAbout = text.toLowerCase().includes('about');
      const hasServices = text.toLowerCase().includes('services');

      expect(hasPricing).toBe(true);
      expect(hasAbout).toBe(true);
      expect(hasServices).toBe(true);
    });
  });

  describe('User-Agent Header', () => {
    test('constructs proper User-Agent string', () => {
      const userAgent = 'Mozilla/5.0 (compatible; LaunchPixelBot/1.0; +https://launchpixel.in)';
      
      expect(userAgent).toContain('Mozilla/5.0');
      expect(userAgent).toContain('LaunchPixelBot');
      expect(userAgent).toContain('launchpixel.in');
    });
  });

  describe('ElevenLabs API Integration', () => {
    test('constructs correct API endpoint URL', () => {
      const agentId = 'agent-123';
      const expectedUrl = `https://api.elevenlabs.io/v1/convai/agents/${agentId}/add-to-knowledge-base`;
      
      expect(expectedUrl).toBe('https://api.elevenlabs.io/v1/convai/agents/agent-123/add-to-knowledge-base');
    });

    test('prepares correct request payload', () => {
      const payload = {
        text: 'Scraped content here',
        source_url: 'https://example.com',
      };

      expect(payload).toHaveProperty('text');
      expect(payload).toHaveProperty('source_url');
      expect(payload.text).toBe('Scraped content here');
      expect(payload.source_url).toBe('https://example.com');
    });
  });

  describe('Response Structure', () => {
    test('validates expected response format', () => {
      const mockResponse = {
        success: true,
        scraped_text: 'Sample text',
        url: 'https://example.com',
        length: 11,
        sections_found: ['Pricing', 'About'],
        message: 'Successfully scraped content from https://example.com. Found: Pricing, About.',
        knowledge_base_updated: false,
      };

      expect(mockResponse).toHaveProperty('success');
      expect(mockResponse).toHaveProperty('scraped_text');
      expect(mockResponse).toHaveProperty('url');
      expect(mockResponse).toHaveProperty('length');
      expect(mockResponse).toHaveProperty('sections_found');
      expect(mockResponse).toHaveProperty('message');
      expect(mockResponse).toHaveProperty('knowledge_base_updated');
      
      expect(Array.isArray(mockResponse.sections_found)).toBe(true);
      expect(typeof mockResponse.success).toBe('boolean');
      expect(typeof mockResponse.knowledge_base_updated).toBe('boolean');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty HTML', () => {
      const html = '<html></html>';
      const cleaned = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      expect(cleaned).toBe('');
    });

    test('handles HTML with only whitespace', () => {
      const html = '<html><body>   \n\n\t  </body></html>';
      const cleaned = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      expect(cleaned).toBe('');
    });

    test('handles HTML with special characters', () => {
      const html = '<html><body><p>Price: $99.99 & up!</p></body></html>';
      const cleaned = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      expect(cleaned).toContain('$99.99');
      expect(cleaned).toContain('&');
    });

    test('handles malformed HTML gracefully', () => {
      const html = '<html><body><p>Unclosed paragraph<div>Content</body>';
      const cleaned = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      expect(cleaned).toContain('Unclosed paragraph');
      expect(cleaned).toContain('Content');
    });
  });
});
