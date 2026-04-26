# Manual Testing Guide for POST /api/call/train

This document provides manual testing instructions for the document upload and training endpoint.

## Prerequisites

1. Start the development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Ensure you have the following environment variables set in `frontend/.env.local`:
   ```
   ELEVENLABS_API_KEY=your_api_key_here
   ```

3. Create an agent first using the `/api/call/agent` endpoint to get an `agentId`

## Test Cases

### Test 1: Upload PDF Document

**Request:**
```bash
curl -X POST http://localhost:3000/api/call/train \
  -F "file=@/path/to/document.pdf" \
  -F "agentId=your_agent_id_here"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully processed document.pdf",
  "document": {
    "filename": "document.pdf",
    "fileType": "pdf",
    "fileSize": 1024000,
    "contentLength": 5000,
    "wordCount": 750,
    "preview": "This is a preview of the first 200 characters..."
  },
  "knowledge_base_updated": true,
  "agent_id": "your_agent_id_here"
}
```

**Status Code:** 200

---

### Test 2: Upload DOCX Document

**Request:**
```bash
curl -X POST http://localhost:3000/api/call/train \
  -F "file=@/path/to/document.docx" \
  -F "agentId=your_agent_id_here"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully processed document.docx",
  "document": {
    "filename": "document.docx",
    "fileType": "docx",
    "fileSize": 512000,
    "contentLength": 3000,
    "wordCount": 450,
    "preview": "This is a preview of the first 200 characters..."
  },
  "knowledge_base_updated": true,
  "agent_id": "your_agent_id_here"
}
```

**Status Code:** 200

---

### Test 3: Upload TXT Document

**Request:**
```bash
curl -X POST http://localhost:3000/api/call/train \
  -F "file=@/path/to/document.txt" \
  -F "agentId=your_agent_id_here"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully processed document.txt",
  "document": {
    "filename": "document.txt",
    "fileType": "txt",
    "fileSize": 2048,
    "contentLength": 2000,
    "wordCount": 300,
    "preview": "This is a preview of the first 200 characters..."
  },
  "knowledge_base_updated": true,
  "agent_id": "your_agent_id_here"
}
```

**Status Code:** 200

---

### Test 4: Upload Without Agent ID

**Request:**
```bash
curl -X POST http://localhost:3000/api/call/train \
  -F "file=@/path/to/document.pdf"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully processed document.pdf",
  "document": {
    "filename": "document.pdf",
    "fileType": "pdf",
    "fileSize": 1024000,
    "contentLength": 5000,
    "wordCount": 750,
    "preview": "This is a preview of the first 200 characters..."
  },
  "knowledge_base_updated": false,
  "agent_id": null
}
```

**Status Code:** 200

**Note:** Document is processed but not added to knowledge base without agentId

---

### Test 5: Missing File

**Request:**
```bash
curl -X POST http://localhost:3000/api/call/train \
  -F "agentId=your_agent_id_here"
```

**Expected Response:**
```json
{
  "error": "No file uploaded",
  "message": "Please select a file to upload"
}
```

**Status Code:** 400

---

### Test 6: File Too Large (>10MB)

**Request:**
```bash
# Create a large file for testing
dd if=/dev/zero of=large.pdf bs=1M count=15

curl -X POST http://localhost:3000/api/call/train \
  -F "file=@large.pdf" \
  -F "agentId=your_agent_id_here"
```

**Expected Response:**
```json
{
  "error": "File too large",
  "message": "File size exceeds 10MB limit. Please upload a smaller file."
}
```

**Status Code:** 400

---

### Test 7: Unsupported File Format

**Request:**
```bash
curl -X POST http://localhost:3000/api/call/train \
  -F "file=@/path/to/image.jpg" \
  -F "agentId=your_agent_id_here"
```

**Expected Response:**
```json
{
  "error": "Unsupported file format",
  "message": "Only PDF, DOCX, and TXT files are supported. You uploaded: jpg"
}
```

**Status Code:** 400

---

### Test 8: Empty Document

**Request:**
```bash
# Create an empty text file
touch empty.txt

curl -X POST http://localhost:3000/api/call/train \
  -F "file=@empty.txt" \
  -F "agentId=your_agent_id_here"
```

**Expected Response:**
```json
{
  "error": "No content extracted",
  "message": "The document appears to be empty or unreadable. Please check the file and try again."
}
```

**Status Code:** 400

---

### Test 9: Invalid Agent ID

**Request:**
```bash
curl -X POST http://localhost:3000/api/call/train \
  -F "file=@/path/to/document.pdf" \
  -F "agentId=invalid_agent_id"
```

**Expected Response:**
```json
{
  "error": "Failed to update knowledge base",
  "message": "ElevenLabs API error: 404",
  "details": "Error: ElevenLabs API error: 404"
}
```

**Status Code:** 500

---

### Test 10: Document with Special Characters

**Request:**
```bash
# Create a text file with special characters
echo "Price: $99.99 & up! Email: test@example.com 世界 🌍" > special.txt

curl -X POST http://localhost:3000/api/call/train \
  -F "file=@special.txt" \
  -F "agentId=your_agent_id_here"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully processed special.txt",
  "document": {
    "filename": "special.txt",
    "fileType": "txt",
    "fileSize": 60,
    "contentLength": 55,
    "wordCount": 8,
    "preview": "Price: $99.99 & up! Email: test@example.com 世界 🌍"
  },
  "knowledge_base_updated": true,
  "agent_id": "your_agent_id_here"
}
```

**Status Code:** 200

---

## Testing with Postman

1. Open Postman
2. Create a new POST request to `http://localhost:3000/api/call/train`
3. Go to the "Body" tab
4. Select "form-data"
5. Add key "file" with type "File" and select your document
6. Add key "agentId" with type "Text" and enter your agent ID
7. Click "Send"

## Testing from Frontend

You can test the endpoint from the dashboard UI:

1. Navigate to `http://localhost:3000/call/dashboard`
2. Go to the "Train" tab
3. Use the document upload dropzone to drag and drop a file
4. Or click to browse and select a file
5. The file will be automatically uploaded and processed
6. Check the browser console for detailed logs

## Verification Steps

After uploading a document:

1. **Check Console Logs:**
   - Look for `[Train API] Processing document upload: ...`
   - Look for `[Train API] Extracted X characters from ...`
   - Look for `[Train API] Added document ... to agent ... knowledge base`

2. **Verify Knowledge Base Update:**
   - Make a test call to the agent
   - Ask questions related to the uploaded document content
   - The agent should be able to answer based on the document

3. **Check File Processing:**
   - Verify the response includes correct file metadata
   - Verify the preview contains actual content from the document
   - Verify word count is reasonable for the document size

## Common Issues

### Issue: "Missing ELEVENLABS_API_KEY"
**Solution:** Add `ELEVENLABS_API_KEY` to your `.env.local` file

### Issue: "Failed to extract text from PDF"
**Solution:** Ensure the PDF is not password-protected or corrupted

### Issue: "Failed to extract text from DOCX"
**Solution:** Ensure the DOCX file is a valid Microsoft Word document

### Issue: "ElevenLabs API error: 401"
**Solution:** Check that your API key is valid and has the correct permissions

### Issue: "ElevenLabs API error: 404"
**Solution:** Verify the agent ID exists and is correct

## Sample Test Files

Create these sample files for testing:

**sample.txt:**
```
This is a sample document for testing the document upload feature.
It contains information about our company and services.
We offer consulting, development, and support services.
Contact us at info@example.com for more information.
```

**sample-long.txt:**
```
[Generate a file with 1000+ words of content]
```

## Performance Testing

Test with various file sizes:
- Small: < 100 KB
- Medium: 1-5 MB
- Large: 8-10 MB (near limit)

Measure:
- Upload time
- Processing time
- Response time
- Memory usage

## Security Testing

1. **File Type Validation:**
   - Try uploading executable files (.exe, .sh)
   - Try uploading archive files (.zip, .tar)
   - Try uploading image files (.jpg, .png)

2. **File Size Validation:**
   - Try uploading files exactly at 10MB
   - Try uploading files just over 10MB
   - Try uploading very large files (100MB+)

3. **Content Validation:**
   - Try uploading files with malicious content
   - Try uploading files with SQL injection attempts
   - Try uploading files with XSS attempts

All should be rejected with appropriate error messages.
