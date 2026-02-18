/**
 * Vegas Sweeps 777 — Postback Handler
 * 
 * Securely receives conversion postbacks and updates Firestore using Firebase Admin SDK.
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - FIREBASE_SERVICE_ACCOUNT: JSON string of the service account key
 * - API_SECRET: Secret string that must match the 'secret' query parameter or 'x-api-secret' header
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (singleton pattern)
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.error('[Postback] Missing FIREBASE_SERVICE_ACCOUNT environment variable.');
    }
  } catch (error) {
    console.error('[Postback] Firebase initialization error:', error);
  }
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
  // 1. Security Check: Validate Request Method
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Security Check: Validate API Secret
  // Using a secret prevents unauthorized users from faking conversions.
  // The ad network should append &secret=YOUR_SECRET to the postback URL
  // or send it in the X-API-Secret header.
  const { secret } = req.query;
  const headerSecret = req.headers['x-api-secret'];
  const configuredSecret = process.env.API_SECRET;

  if (!configuredSecret) {
    console.error('[Postback] API_SECRET environment variable is not set. insecure!');
    // Fail safe: reject all if secret is not configured on server
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  if (secret !== configuredSecret && headerSecret !== configuredSecret) {
    console.warn('[Postback] Unauthorized attempt. Invalid secret.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 3. Parse Parameters
  const params = { ...req.query, ...(req.body || {}) };
  const {
    offer_id = '',
    offer_name = '',
    payout = '0',
    payout_cents = '0',
    ip = '',
    status = '1',
    unix = '',
    s1 = '',
    s2 = '',
    lead_id = '',
    click_id = '',
    country_code = ''
  } = params;

  // 4. Validate Data
  if (!offer_id && !lead_id) {
    return res.status(400).json({ error: 'Missing required parameters (offer_id or lead_id)' });
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const isChargeback = String(status) === '0';
  const payoutAmount = parseFloat(payout) || 0;

  try {
    // 5. Write to Firestore (Batch write for atomicity)
    const batch = db.batch();

    // A. Conversion Document
    // Use click_id or lead_id as the Document ID to prevent duplicates (Idempotency)
    const docId = click_id || lead_id || db.collection('vs7_conversions').doc().id;
    const conversionRef = db.collection('vs7_conversions').doc(docId);

    // Check if doc exists to avoid double-counting stats
    const docSnap = await conversionRef.get();

    if (!docSnap.exists) {
      batch.set(conversionRef, {
        event: 'conversion',
        offer_id: String(offer_id),
        offer_name: String(offer_name),
        payout: payoutAmount,
        payout_cents: parseInt(payout_cents) || 0,
        ip: String(ip),
        status: String(status),
        unix: String(unix),
        s1: String(s1),
        s2: String(s2),
        lead_id: String(lead_id),
        click_id: String(click_id),
        country_code: String(country_code),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        date: dateStr,
        is_chargeback: isChargeback
      });

      // B. Daily Stats Aggregation (Only increment if it's a new conversion)
      const statsRef = db.collection('vs7_daily_stats').doc(`conversions_${dateStr}`);

      batch.set(statsRef, {
        date: dateStr,
        conversions: admin.firestore.FieldValue.increment(isChargeback ? 0 : 1),
        revenue: admin.firestore.FieldValue.increment(isChargeback ? 0 : payoutAmount),
        chargebacks: admin.firestore.FieldValue.increment(isChargeback ? 1 : 0),
        last_updated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Commit the batch
      await batch.commit();
      console.log(`[Postback] Success: ${isChargeback ? 'Chargeback' : 'Conversion'} | Offer: ${offer_id} | Payout: ${payoutAmount}`);
    } else {
      console.log(`[Postback] Duplicate ignored: ${docId}`);
    }

    return res.status(200).json({
      status: 'ok',
      conversion: !isChargeback,
      offer_id,
      payout: payoutAmount
    });

  } catch (err) {
    console.error('[Postback] Firestore error:', err);
    // Return 200 to prevent ad network retries if it's a logic error, 
    // but here we might want 500 if it's a transient db issue. 
    // Usually ad networks only care if we received it.
    // Let's stick to 200 with error log to avoid storming.
    return res.status(200).json({ status: 'error_logged', detail: 'Internal processing error' });
  }
};
