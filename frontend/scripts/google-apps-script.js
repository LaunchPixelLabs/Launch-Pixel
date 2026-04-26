/**
 * ============================================================================
 *  LaunchPixel — Google Apps Script for Form Submissions
 * ============================================================================
 *
 *  HOW TO SET UP:
 *  ─────────────
 *  1. Go to Google Sheets (sheets.google.com) logged into contact@launchpixel.in
 *  2. Create a new spreadsheet named "LaunchPixel Submissions"
 *  3. Go to Extensions → Apps Script
 *  4. Delete any existing code and paste this entire file
 *  5. Click "Deploy" → "New deployment"
 *  6. Select type: "Web app"
 *  7. Set "Execute as": Me (contact@launchpixel.in)
 *  8. Set "Who has access": Anyone
 *  9. Click "Deploy" and authorize the app
 * 10. Copy the Web App URL — you'll add this to Cloudflare secrets
 *
 *  The script creates two sheet tabs:
 *    • "Contact Submissions"  — from the /contact page
 *    • "Career Applications"  — from the /careers page
 *
 *  It also sends styled HTML email notifications to contact@launchpixel.in
 * ============================================================================
 */

// ── Configuration ────────────────────────────────────────────────────────────
var NOTIFICATION_EMAIL = 'contact@launchpixel.in';
var SHEET_NAME_CONTACT = 'Contact Submissions';
var SHEET_NAME_CAREERS = 'Career Applications';
var TIMEZONE = 'Asia/Kolkata';

// ── Main POST Handler ────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var formType = data.formType;   // 'contact' or 'careers'
    var fields = data.fields;

    // Add timestamp
    var timestamp = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

    if (formType === 'contact') {
      var contactRow = {
        'Timestamp': timestamp,
        'Name': fields.Name || '',
        'Email': fields.Email || '',
        'Phone': fields.Phone || '',
        'Subject': fields.Subject || '',
        'Message': fields.Message || ''
      };
      appendToSheet(SHEET_NAME_CONTACT, contactRow);
      sendContactEmail(fields, timestamp);

    } else if (formType === 'careers') {
      // Careers has dynamic fields per role — handled automatically
      var careerRow = { 'Timestamp': timestamp };
      var keys = Object.keys(fields);
      for (var i = 0; i < keys.length; i++) {
        careerRow[keys[i]] = fields[keys[i]];
      }
      appendToSheet(SHEET_NAME_CAREERS, careerRow);
      sendCareerEmail(fields, timestamp);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Append a row to a sheet (creates headers dynamically) ────────────────────
function appendToSheet(sheetName, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  // Create the sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  var lastCol = sheet.getLastColumn();
  var existingHeaders = [];

  if (lastCol > 0) {
    existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  }

  var dataKeys = Object.keys(data);

  // Add any new headers that don't exist yet
  for (var i = 0; i < dataKeys.length; i++) {
    var key = dataKeys[i];
    if (existingHeaders.indexOf(key) === -1) {
      existingHeaders.push(key);
      var newColIndex = existingHeaders.length;
      sheet.getRange(1, newColIndex).setValue(key).setFontWeight('bold');
    }
  }

  // If this is the very first row, write all headers
  if (lastCol === 0) {
    sheet.getRange(1, 1, 1, existingHeaders.length).setValues([existingHeaders]);
    sheet.getRange(1, 1, 1, existingHeaders.length).setFontWeight('bold');
    // Auto-resize and freeze header row
    sheet.setFrozenRows(1);
  }

  // Build row values in header order
  var row = [];
  for (var j = 0; j < existingHeaders.length; j++) {
    row.push(data[existingHeaders[j]] || '');
  }

  // Append the row
  sheet.appendRow(row);

  // Auto-resize columns for readability
  try {
    for (var k = 1; k <= existingHeaders.length; k++) {
      sheet.autoResizeColumn(k);
    }
  } catch (e) {
    // Ignore resize errors
  }
}

// ── Email: Contact Form Notification ─────────────────────────────────────────
function sendContactEmail(fields, timestamp) {
  var subject = '🚀 New Contact Form Submission — ' + (fields.Subject || 'No Subject');

  var htmlBody = '' +
    '<div style="font-family: \'Segoe UI\', Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.12);">' +
      '<div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%); padding: 32px 28px;">' +
        '<h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">📬 New Contact Submission</h1>' +
        '<p style="color: rgba(255,255,255,0.75); margin: 8px 0 0 0; font-size: 14px;">' + timestamp + ' IST</p>' +
      '</div>' +
      '<div style="background: #ffffff; padding: 28px;">' +
        '<table style="width: 100%; border-collapse: collapse;">' +
          emailRow('Name', fields.Name, '#F9FAFB') +
          emailRow('Email', '<a href="mailto:' + fields.Email + '" style="color: #4F46E5; text-decoration: none;">' + fields.Email + '</a>', '#FFFFFF') +
          emailRow('Phone', fields.Phone || 'Not provided', '#F9FAFB') +
          emailRow('Subject', fields.Subject, '#FFFFFF') +
          emailRow('Message', fields.Message, '#F9FAFB') +
        '</table>' +
      '</div>' +
      '<div style="background: #F3F4F6; padding: 16px 28px; text-align: center;">' +
        '<p style="margin: 0; color: #9CA3AF; font-size: 12px;">LaunchPixel Contact Form • launchpixel.in</p>' +
      '</div>' +
    '</div>';

  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}

// ── Email: Career Application Notification ───────────────────────────────────
function sendCareerEmail(fields, timestamp) {
  var role = fields['Role'] || 'Unknown Role';
  var name = fields['Full Name'] || 'Unknown Applicant';
  var subject = '🎯 New Application: ' + role + ' — ' + name;

  var tableRows = '';
  var keys = Object.keys(fields);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = fields[key];
    if (value) {
      var bgColor = (i % 2 === 0) ? '#F9FAFB' : '#FFFFFF';

      // Make resume link clickable
      if (key === 'Resume Link') {
        value = '<a href="' + value + '" style="color: #4F46E5; text-decoration: none; font-weight: 600;">📄 Download Resume</a>';
      }
      // Make LinkedIn/GitHub/Portfolio clickable
      if (value.toString().match(/^https?:\/\//)) {
        value = '<a href="' + value + '" style="color: #4F46E5; text-decoration: none;">' + value + '</a>';
      }

      tableRows += emailRow(key, value, bgColor);
    }
  }

  var htmlBody = '' +
    '<div style="font-family: \'Segoe UI\', Arial, sans-serif; max-width: 700px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.12);">' +
      '<div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%); padding: 32px 28px;">' +
        '<h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">🎯 New Career Application</h1>' +
        '<p style="color: rgba(255,255,255,0.75); margin: 8px 0 0 0; font-size: 14px;">' + role + ' • ' + timestamp + ' IST</p>' +
      '</div>' +
      '<div style="background: #ffffff; padding: 28px;">' +
        '<table style="width: 100%; border-collapse: collapse;">' + tableRows + '</table>' +
      '</div>' +
      '<div style="background: #F3F4F6; padding: 16px 28px; text-align: center;">' +
        '<p style="margin: 0; color: #9CA3AF; font-size: 12px;">LaunchPixel Careers • launchpixel.in/careers</p>' +
      '</div>' +
    '</div>';

  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}

// ── Helper: Build an email table row ─────────────────────────────────────────
function emailRow(label, value, bgColor) {
  return '' +
    '<tr style="background: ' + bgColor + ';">' +
      '<td style="padding: 12px 16px; font-weight: 600; color: #374151; width: 160px; vertical-align: top; border-bottom: 1px solid #F3F4F6; font-size: 14px;">' + label + '</td>' +
      '<td style="padding: 12px 16px; color: #6B7280; border-bottom: 1px solid #F3F4F6; font-size: 14px; line-height: 1.5;">' + (value || '—') + '</td>' +
    '</tr>';
}

// ── Test function (run manually to verify setup) ─────────────────────────────
function testSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('✅ Spreadsheet: ' + ss.getName());
  Logger.log('✅ URL: ' + ss.getUrl());
  Logger.log('✅ Email quota remaining: ' + MailApp.getRemainingDailyQuota());
  Logger.log('');
  Logger.log('Setup looks good! Deploy as a Web App to start receiving submissions.');
  Logger.log('Deploy → New Deployment → Web App → Execute as Me → Anyone can access');
}
