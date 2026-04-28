# CSV Parser Integration Test Guide

## Overview
This document provides manual integration testing steps for the CSV import functionality.

## Prerequisites

1. **Backend server running**:
   ```bash
   cd backend
   npm start
   ```
   Server should be running on http://localhost:5000

2. **Frontend development server running**:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend should be running on http://localhost:3000

3. **Firebase Authentication configured**:
   - User must be able to sign in via Google
   - Firebase credentials properly configured in `.env.local`

## Test Scenarios

### Test 1: Valid CSV Import (Happy Path)

**Test File**: Create `test-valid.csv`
```csv
name,phone,company
John Doe,+14155552671,Acme Inc
Jane Smith,+14155552672,Tech Corp
Bob Johnson,+14155552673,StartupXYZ
```

**Steps**:
1. Navigate to http://localhost:3000/call/dashboard
2. Sign in with Google
3. Click on "Contacts & Lists" tab
4. Click "Import CSV" button
5. Select `test-valid.csv`

**Expected Results**:
- ✅ Validation report shows: 3 total, 3 valid, 0 invalid, 0 duplicates
- ✅ "Import 3 Valid Contacts" button appears
- ✅ No error details shown
- ✅ Clicking import button successfully imports contacts
- ✅ Success message displays
- ✅ Contacts appear in the table
- ✅ Validation report closes automatically

### Test 2: CSV with Validation Errors

**Test File**: Create `test-errors.csv`
```csv
name,phone,company
John Doe,+14155552671,Acme Inc
Invalid User,invalid-phone,Bad Corp
,+14155552673,No Name Inc
Jane Smith,123,Tech Corp
```

**Steps**:
1. Navigate to Contacts tab
2. Click "Import CSV"
3. Select `test-errors.csv`

**Expected Results**:
- ✅ Validation report shows: 4 total, 1 valid, 3 invalid, 0 duplicates
- ✅ Error details section shows 3 errors:
  - Row 3: Invalid phone number format
  - Row 4: Name is required
  - Row 5: Invalid phone number format
- ✅ "Import 1 Valid Contacts" button appears
- ✅ "Download Error Report" button appears
- ✅ Tip message displays about fixing errors

### Test 3: CSV with Duplicate Phone Numbers

**Test File**: Create `test-duplicates.csv`
```csv
name,phone
John Doe,+14155552671
Jane Smith,+14155552671
Bob Johnson,+14155552672
```

**Steps**:
1. Navigate to Contacts tab
2. Click "Import CSV"
3. Select `test-duplicates.csv`

**Expected Results**:
- ✅ Validation report shows: 3 total, 2 valid, 1 invalid, 1 duplicates
- ✅ Error shows: Row 3: Duplicate phone number in CSV
- ✅ Only 2 contacts can be imported (first occurrence + unique)

### Test 4: Phone Number Format Variations

**Test File**: Create `test-formats.csv`
```csv
name,phone
User 1,+14155552671
User 2,4155552672
User 3,(415) 555-2673
User 4,415-555-2674
User 5,1-415-555-2675
User 6,14155552676
```

**Steps**:
1. Navigate to Contacts tab
2. Click "Import CSV"
3. Select `test-formats.csv`

**Expected Results**:
- ✅ All 6 contacts are valid
- ✅ All phone numbers are formatted to E.164 (+14155552671, etc.)
- ✅ Import succeeds for all contacts

### Test 5: CSV with Metadata Columns

**Test File**: Create `test-metadata.csv`
```csv
name,phone,company,notes,priority
John Doe,+14155552671,Acme Inc,VIP customer,high
Jane Smith,+14155552672,Tech Corp,Follow up,medium
```

**Steps**:
1. Navigate to Contacts tab
2. Click "Import CSV"
3. Select `test-metadata.csv`

**Expected Results**:
- ✅ Both contacts are valid
- ✅ Metadata (company, notes, priority) is captured
- ✅ Import succeeds
- ✅ Contacts in database include metadata fields

### Test 6: Missing Required Columns

**Test File**: Create `test-missing-columns.csv`
```csv
name,email
John Doe,john@example.com
Jane Smith,jane@example.com
```

**Steps**:
1. Navigate to Contacts tab
2. Click "Import CSV"
3. Select `test-missing-columns.csv`

**Expected Results**:
- ✅ Validation report shows error: Required column "phone" is missing
- ✅ No contacts can be imported
- ✅ Error details explain the missing column

### Test 7: Empty CSV File

**Test File**: Create `test-empty.csv`
```csv
name,phone
```

**Steps**:
1. Navigate to Contacts tab
2. Click "Import CSV"
3. Select `test-empty.csv`

**Expected Results**:
- ✅ Error alert displays: "CSV file is empty"
- ✅ No validation report shown

### Test 8: Download Error Report

**Test File**: Use `test-errors.csv` from Test 2

**Steps**:
1. Import `test-errors.csv`
2. Click "Download Error Report" button

**Expected Results**:
- ✅ CSV file downloads with name like `contacts_errors_2024-01-15.csv`
- ✅ Downloaded CSV includes original columns plus `validation_errors` column
- ✅ Error annotations are present for invalid rows
- ✅ Valid rows have empty validation_errors field

### Test 9: Import Valid Contacts Only

**Test File**: Use `test-errors.csv` from Test 2

**Steps**:
1. Import `test-errors.csv` (1 valid, 3 invalid)
2. Click "Import 1 Valid Contacts" button

**Expected Results**:
- ✅ Success message: "Successfully imported 1 contacts!"
- ✅ Only valid contact appears in table
- ✅ Invalid contacts are skipped
- ✅ Validation report closes
- ✅ File input is reset

### Test 10: Database Duplicate Detection

**Prerequisites**: Import a contact first

**Test File**: Create `test-db-duplicate.csv`
```csv
name,phone
Existing User,+14155552671
New User,+14155552680
```

**Steps**:
1. First, import a contact with phone +14155552671
2. Then import `test-db-duplicate.csv`

**Expected Results**:
- ✅ Backend detects existing phone number
- ✅ Error message indicates duplicate in database
- ✅ Only new contact (+14155552680) is imported
- ✅ Existing contact is skipped

### Test 11: Large CSV File

**Test File**: Create `test-large.csv` with 100+ rows

**Steps**:
1. Generate CSV with 100+ valid contacts
2. Import the file

**Expected Results**:
- ✅ All contacts are validated
- ✅ Import succeeds for all valid contacts
- ✅ Performance is acceptable (< 5 seconds for 100 contacts)

### Test 12: Case-Insensitive Headers

**Test File**: Create `test-case.csv`
```csv
Name,Phone,Company
John Doe,+14155552671,Acme Inc
```

**Steps**:
1. Import `test-case.csv` with capitalized headers

**Expected Results**:
- ✅ Headers are recognized (case-insensitive)
- ✅ Contact is imported successfully

## Backend Integration Tests

### Test API Endpoint Directly

**Test with curl**:
```bash
# Get Firebase ID token first (from browser console after signing in)
TOKEN="your-firebase-id-token"

# Test POST endpoint
curl -X POST http://localhost:5000/api/agent-contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "contacts": [
      {
        "name": "Test User",
        "phone": "+14155552671",
        "metadata": {
          "company": "Test Corp"
        }
      }
    ]
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "imported": 1,
  "skipped": 0,
  "contacts": [
    {
      "id": 1,
      "userId": "firebase-uid",
      "name": "Test User",
      "phone": "+14155552671",
      "status": "Pending",
      "metadata": {
        "company": "Test Corp"
      },
      "retryCount": 0,
      "lastCallAttempt": null,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

## Error Scenarios to Test

1. **Network Error**: Stop backend server and try to import
   - ✅ Should show error message about connection failure

2. **Authentication Error**: Sign out and try to access dashboard
   - ✅ Should redirect to auth page

3. **Invalid File Type**: Try to upload a .txt or .xlsx file
   - ✅ File input should only accept .csv files

4. **Very Large File**: Try to upload a CSV with 10,000+ rows
   - ✅ Backend should reject with "Too many contacts" error

## Performance Benchmarks

- **Small CSV (< 10 rows)**: < 1 second
- **Medium CSV (10-100 rows)**: < 2 seconds
- **Large CSV (100-1000 rows)**: < 5 seconds
- **Very Large CSV (1000-10000 rows)**: < 30 seconds

## Cleanup After Testing

1. Delete test contacts from database:
   ```sql
   DELETE FROM agent_contacts WHERE userId = 'your-firebase-uid';
   ```

2. Or use the backend API to delete contacts individually

## Known Limitations

1. **Maximum File Size**: Browser memory limits for very large CSV files
2. **Maximum Contacts**: Backend enforces 10,000 contacts per import
3. **Phone Number Formats**: Only E.164 format is accepted by backend
4. **Country Code**: Default is US (+1), no UI to change it yet

## Success Criteria

All tests should pass with:
- ✅ Correct validation results
- ✅ Appropriate error messages
- ✅ Successful imports for valid data
- ✅ Proper error handling for invalid data
- ✅ Good user experience (loading states, feedback)
- ✅ No console errors
- ✅ No data loss
