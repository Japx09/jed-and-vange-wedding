const DEFAULT_GCONFIG_B64 = 'eyJjbGllbnRJZCI6IjEwNzEwMDYwNjA1OTEtdG1oc3NpbjJoMjFsY3JlMjM1dnRvbG9qaDRnNDAzZXAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJjbGllbnRTZWNyZXQiOiJHT0NTUFgtSzU4RldSNDg2TGRMSjFtTEI4c1hDNHo2cURBZiIsInJlZnJlc2hUb2tlbiI6IjEvLzBlVHEteU1ULVhtYkVDZ1lJQVJBQUdBNFNOd0YtTDlJcnVLSElUN1k5Zi1Nc0w0T2Z4VWRkUlRwWXNFcm1GTDRpNGI4SGF4RW80cEZBWXpvRFdDQ3pTUHh6Z2NscmRpNkNfZ00iLCJzcHJlYWRzaGVldElkIjoiMVpwenRBdHVfYWgwQ1N2QXVIdzRWMnJXQTlkVERLMEY5Rl9HU0ZTWElRZ0EiLCJzaGVldE5hbWUiOiJSU1ZQIFJlc3BvbnNlcyJ9';

function getGoogleConfig() {
  try {
    const raw = process.env.GOOGLE_CONFIG_B64 || DEFAULT_GCONFIG_B64;
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch (e) {
    return {};
  }
}

async function appendRsvpToGoogleSheet(data) {
  const gcfg = getGoogleConfig();
  const tokenParams = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || gcfg.clientId,
    client_secret: process.env.GOOGLE_CLIENT_SECRET || gcfg.clientSecret,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN || gcfg.refreshToken,
    grant_type: 'refresh_token'
  });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString()
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('Could not refresh Google OAuth token: ' + JSON.stringify(tokenData));
  }

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const row = [
    timestamp,
    data.fullName || '',
    data.attendance || '',
    String(data.guestCount !== undefined ? data.guestCount : 1),
    data.dietary || 'None',
    data.message || ''
  ];

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || gcfg.spreadsheetId || '1ZpztAtu_ah0CSvAuHw4V2rWA9dTDK0F9F_GSFSXIQgA';
  const sheetName = gcfg.sheetName || 'RSVP Responses';
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:F:append?valueInputOption=USER_ENTERED`;

  const appendRes = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [row] })
  });

  const appendData = await appendRes.json();
  if (appendData.error) {
    throw new Error('Google Sheets API error: ' + JSON.stringify(appendData.error));
  }
  return appendData;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    const { fullName, attendance, guestCount, dietary, message } = body || {};
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Please provide your full name.' });
    }

    const payload = {
      fullName: fullName.trim(),
      attendance: attendance || 'Joyfully Accepts',
      guestCount: attendance === 'Regretfully Declines' ? 0 : (parseInt(guestCount, 10) || 1),
      dietary: (dietary || '').trim() || 'None',
      message: (message || '').trim()
    };

    await appendRsvpToGoogleSheet(payload);

    return res.status(200).json({
      success: true,
      message: 'RSVP confirmed successfully!'
    });
  } catch (err) {
    console.error('Error handling RSVP in api/rsvp:', err);
    return res.status(500).json({
      error: 'An error occurred while saving your RSVP. Please try again.'
    });
  }
}
