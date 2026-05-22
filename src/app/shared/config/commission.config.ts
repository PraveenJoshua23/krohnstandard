/**
 * Commission form configuration.
 *
 * ─── SETUP REQUIRED ──────────────────────────────────────────────────────────
 *
 * Before the form works you need a Google Apps Script web app.
 * Follow these steps once:
 *
 *  1. Open your Google Sheet (create one if needed) with headers:
 *       Timestamp | Name | Email | Phone | Collection | Message
 *
 *  2. In the Sheet: Extensions → Apps Script → paste the code below.
 *
 *  3. Click Deploy → New deployment → Web app
 *       Execute as:     Me
 *       Who has access: Anyone
 *     Click Deploy, authorise, then copy the URL.
 *
 *  4. Paste the URL as the value of `appsScriptUrl` below.
 *
 * ─── APPS SCRIPT CODE ────────────────────────────────────────────────────────
 *
 *  function doPost(e) {
 *    try {
 *      var data = JSON.parse(e.postData.contents);
 *      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *      var nextRow = sheet.getLastRow() + 1;
 *
 *      // Pre-format the phone cell as plain text BEFORE writing the value.
 *      // appendRow ignores cell format and lets Sheets parse '+1 555...' as
 *      // a formula. setValues() respects the format already on the range,
 *      // so setting '@' (plain text) first is the only reliable fix.
 *      sheet.getRange(nextRow, 4).setNumberFormat('@');
 *
 *      sheet.getRange(nextRow, 1, 1, 6).setValues([[
 *        new Date(),
 *        data.name       || '',
 *        data.email      || '',
 *        data.phone      || '',
 *        data.collection || '',
 *        data.message    || ''
 *      ]]);
 *
 *      var body = [
 *        'New Commission Inquiry — KROHN',
 *        '================================',
 *        '',
 *        'Name:                 ' + (data.name       || '—'),
 *        'Email:                ' + (data.email      || '—'),
 *        'Phone:                ' + (data.phone      || '—'),
 *        'Preferred Collection: ' + (data.collection || '—'),
 *        '',
 *        'Vision / Message:',
 *        data.message || '—'
 *      ].join('\n');
 *
 *      MailApp.sendEmail({
 *        to: 'atelier@krohnstandard.com',
 *        subject: 'Commission Inquiry — ' + (data.name || 'Unknown'),
 *        body: body,
 *        replyTo: data.email || ''
 *      });
 *
 *      return ContentService
 *        .createTextOutput(JSON.stringify({ status: 'ok' }))
 *        .setMimeType(ContentService.MimeType.JSON);
 *    } catch (err) {
 *      return ContentService
 *        .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
 *        .setMimeType(ContentService.MimeType.JSON);
 *    }
 *  }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const COMMISSION_CONFIG = {
  /**
   * Replace this placeholder with your Apps Script deployment URL.
   * Format: https://script.google.com/macros/s/<deployment-id>/exec
   */
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyxZkIGRdqyE-o7Uds2agrKjshtggXFp8VxX8oIyeeuSdvu73GkYAOY-zSDC0Wzi2ia/exec',
} as const;
