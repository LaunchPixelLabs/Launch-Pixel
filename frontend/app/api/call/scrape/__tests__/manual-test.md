# Manual Testing Guide for POST /api/call/scrape

## Prerequisites
- Backend server running on configured port
- Valid ELEVENLABS_API_KEY in environment (optional, for KB updates)

## Test Cases

### Test 1: Basic URL Scraping (No Agent ID)
```bash
curl -X POST http://localhost:3000/api/call/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "scraped_text": "...",
  "url": "https://example.com",
  "length": <number>,
  "sections_found": [...],
  "message": "Successfully scraped content from https://example.com. Found: ...",
  "knowledge_base_updated": false
}
```

### Test 2: URL Scraping with Agent ID (Knowledge Base Update)
```bash
curl -X POST http://localhost:3000/api/call/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "agentId": "your-agent-id-here"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "scraped_text": "...",
  "url": "https://example.com",
  "length": <number>,
  "sections_found": [...],
  "message": "Successfully scraped content from https://example.com. Found: ...",
  "knowledge_base_updated": true
}
```

### Test 3: Missing URL (Validation Error)
```bash
curl -X POST http://localhost:3000/api/call/scrape \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "error": "URL is required"
}
```
**Expected Status:** 400

### Test 4: Invalid URL Format
```bash
curl -X POST http://localhost:3000/api/call/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "not-a-valid-url"
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid URL format"
}
```
**Expected Status:** 400

### Test 5: Unreachable URL
```bash
curl -X POST http://localhost:3000/api/call/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://this-domain-does-not-exist-12345.com"
  }'
```

**Expected Response:**
```json
{
  "error": "Failed to scrape website",
  "details": "..."
}
```
**Expected Status:** 500

### Test 6: Website with Rich Content (Section Detection)
```bash
curl -X POST http://localhost:3000/api/call/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.example-business.com"
  }'
```

**Verify:**
- `sections_found` array contains detected sections
- `scraped_text` is limited to 10,000 characters
- No script or style content in `scraped_text`
- Message includes list of found sections

## Verification Checklist

- [ ] URL validation works correctly
- [ ] HTML is fetched with proper User-Agent header
- [ ] Script tags are removed from content
- [ ] Style tags are removed from content
- [ ] Plain text is extracted (no HTML tags)
- [ ] Text is limited to 10,000 characters
- [ ] Section detection works (pricing, about, services, FAQ, contact)
- [ ] Knowledge base update works when agentId provided
- [ ] Knowledge base update fails gracefully if API key missing
- [ ] Error responses have appropriate status codes
- [ ] Response structure matches specification

## Requirements Coverage

This endpoint satisfies Requirements 3.1-3.7:
- ✅ 3.1: URL validation in request body
- ✅ 3.2: HTML fetching with User-Agent header
- ✅ 3.3: Script tag removal
- ✅ 3.4: Style tag removal
- ✅ 3.5: Plain text extraction with 10k limit
- ✅ 3.6: Section detection (pricing, about, services, FAQ, contact)
- ✅ 3.7: ElevenLabs knowledge base integration when agentId provided
