# CSV Import Feature - User Guide

## Overview
The CSV Import feature allows you to bulk import contacts into your AI Calling Agent Dashboard. The system validates phone numbers, detects duplicates, and provides detailed error reports.

## Quick Start

### 1. Prepare Your CSV File

Create a CSV file with at least these columns:
- `name` (required)
- `phone` (required)

Example:
```csv
name,phone,company,notes
John Doe,+14155552671,Acme Inc,VIP customer
Jane Smith,4155552672,Tech Corp,Follow up needed
```

### 2. Import Process

1. Navigate to **Contacts & Lists** tab
2. Click **Import CSV** button
3. Select your CSV file
4. Review the validation report
5. Import valid contacts or download error report

## Phone Number Formats

The system accepts various phone number formats and automatically converts them to E.164 format:

| Input Format | Converted To | Status |
|--------------|--------------|--------|
| `+14155552671` | `+14155552671` | ✅ Valid |
| `4155552671` | `+14155552671` | ✅ Valid (adds +1) |
| `(415) 555-2671` | `+14155552671` | ✅ Valid |
| `415-555-2671` | `+14155552671` | ✅ Valid |
| `1-415-555-2671` | `+14155552671` | ✅ Valid |
| `invalid-phone` | - | ❌ Invalid |
| `123` | - | ❌ Invalid (too short) |

**Note**: The system defaults to US country code (+1). International numbers should include the country code.

## Validation Report

After uploading a CSV, you'll see a validation report with:

### Summary Statistics
- **Total Rows**: Number of contacts in CSV
- **Valid**: Contacts that passed validation
- **Invalid**: Contacts with errors
- **Duplicates**: Duplicate phone numbers found

### Error Details
For each invalid row, you'll see:
- **Row Number**: Exact row in CSV (including header)
- **Field**: Which field has the error (name or phone)
- **Error Message**: Specific description of the problem
- **Value**: The invalid value (if applicable)

### Example Error Report
```
Row 3 • phone: Invalid phone number format. Expected E.164 format (e.g., +14155552671)
Row 4 • name: Name is required
Row 5 • phone: Duplicate phone number in CSV
```

## Actions

### Import Valid Contacts
- Imports only the contacts that passed validation
- Skips invalid rows automatically
- Shows success message with count

### Download Error Report
- Downloads a CSV with error annotations
- Includes a `validation_errors` column
- Use this to fix errors and re-upload

## Common Errors

### Missing Required Columns
```
Error: Required column "phone" is missing from CSV
```
**Solution**: Ensure your CSV has both `name` and `phone` columns.

### Invalid Phone Number Format
```
Error: Invalid phone number format. Expected E.164 format (e.g., +14155552671)
```
**Solution**: Use a valid phone number format. The system accepts various formats but they must be valid phone numbers.

### Duplicate Phone Numbers
```
Error: Duplicate phone number in CSV
```
**Solution**: Remove duplicate phone numbers from your CSV. Each phone number must be unique.

### Name is Required
```
Error: Name is required
```
**Solution**: Ensure every row has a name value.

### Duplicate in Database
```
Error: Duplicate phone number (already exists in database)
```
**Solution**: This phone number is already in your contact list. Remove it from the CSV or update the existing contact.

## Metadata Columns

You can include additional columns in your CSV for metadata:

```csv
name,phone,company,notes,priority,source
John Doe,+14155552671,Acme Inc,VIP customer,high,website
```

All columns except `name` and `phone` are stored as metadata and can be used for filtering and segmentation.

## Best Practices

### 1. Clean Your Data First
- Remove duplicate phone numbers
- Ensure all names are filled in
- Format phone numbers consistently

### 2. Start Small
- Test with a small CSV (5-10 contacts) first
- Verify the import works correctly
- Then import larger batches

### 3. Use Metadata
- Add company, notes, priority, source columns
- This helps with segmentation and targeting
- Metadata is searchable and filterable

### 4. Handle Errors Incrementally
- Download the error report
- Fix errors in your original CSV
- Re-upload the corrected file

### 5. Check for Database Duplicates
- The system checks against existing contacts
- Duplicates are automatically skipped
- You'll see which contacts were skipped in the report

## Limits

- **Maximum Contacts per Import**: 10,000
- **Maximum File Size**: Limited by browser memory (typically ~50MB)
- **Supported File Format**: CSV only
- **Required Columns**: name, phone

## Troubleshooting

### CSV File Won't Upload
- Check file extension is `.csv`
- Ensure file is not corrupted
- Try opening in a text editor to verify format

### All Contacts Show as Invalid
- Check that columns are named `name` and `phone` (case-insensitive)
- Verify CSV has proper comma separation
- Ensure no extra quotes or special characters

### Phone Numbers Not Recognized
- Use standard phone number formats
- Include country code for international numbers
- Remove letters and special characters (except +, -, (), spaces)

### Import Button Disabled
- Ensure there are valid contacts to import
- Check that validation completed successfully
- Try refreshing the page

## Sample CSV Templates

### Basic Template
```csv
name,phone
John Doe,+14155552671
Jane Smith,4155552672
```

### With Metadata
```csv
name,phone,company,notes,priority
John Doe,+14155552671,Acme Inc,VIP customer,high
Jane Smith,4155552672,Tech Corp,Follow up,medium
Bob Johnson,4155552673,StartupXYZ,Interested in demo,low
```

### International Numbers
```csv
name,phone,country
John Doe,+14155552671,USA
Jane Smith,+442071838750,UK
Bob Johnson,+919876543210,India
```

## Technical Details

### Phone Number Validation
- Uses E.164 international format
- Regex: `^\+[1-9]\d{1,14}$`
- Automatically infers US country code (+1) for 10-digit numbers

### CSV Parsing
- Uses Papa Parse library
- Supports streaming for large files
- Case-insensitive header matching
- Handles various line endings (CRLF, LF)

### Error Handling
- Client-side validation before sending to server
- Server-side validation for security
- Duplicate detection in both CSV and database
- Detailed error messages with row numbers

## Support

If you encounter issues:
1. Check this guide for common solutions
2. Review the validation report carefully
3. Download the error report for detailed information
4. Contact support with the error report attached

## Updates and Improvements

Future enhancements planned:
- Drag-and-drop file upload
- Custom country code selection
- Column mapping interface
- Preview before import
- Duplicate merge options
- Batch update existing contacts
