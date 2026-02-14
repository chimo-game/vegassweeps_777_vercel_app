/**
 * Game Vault 999 — Postback Handler
 * 
 * Receives conversion postbacks from the ad network when a user completes an offer.
 * Stores the conversion data in Firebase Firestore for real-time dashboard tracking.
 * 
 * POSTBACK URL to set in your ad network:
 * https://gamevault999apk.com/api/postback?offer_id={offer_id}&offer_name={offer_name}&payout={payout}&payout_cents={payout_cents}&ip={ip}&status={status}&unix={unix}&s1={s1}&s2={s2}&lead_id={lead_id}&click_id={click_id}&country_code={country_code}
 */

// Firebase Admin SDK (lightweight REST approach — no npm needed)
const FIREBASE_PROJECT = 'vegassweeps-analytics';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

module.exports = async function handler(req, res) {
  // Allow GET and POST (networks use both)
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

  // Validate — must have at least an offer_id or lead_id
  if (!offer_id && !lead_id) {
    return res.status(400).json({ error: 'Missing required parameters (offer_id or lead_id)' });
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // Build Firestore document
  const conversionDoc = {
    fields: {
      event:        { stringValue: 'conversion' },
      offer_id:     { stringValue: String(offer_id) },
      offer_name:   { stringValue: String(offer_name) },
      payout:       { doubleValue: parseFloat(payout) || 0 },
      payout_cents: { integerValue: String(parseInt(payout_cents) || 0) },
      ip:           { stringValue: String(ip) },
      status:       { stringValue: String(status) },  // 1 = conversion, 0 = chargeback
      unix:         { stringValue: String(unix) },
      s1:           { stringValue: String(s1) },
      s2:           { stringValue: String(s2) },
      lead_id:      { stringValue: String(lead_id) },
      click_id:     { stringValue: String(click_id) },
      country_code: { stringValue: String(country_code) },
      timestamp:    { timestampValue: now.toISOString() },
      date:         { stringValue: dateStr },
      is_chargeback: { booleanValue: String(status) === '0' }
    }
  };

  try {
    // Write conversion to vs7_conversions collection
    const writeRes = await fetch(`${FIRESTORE_BASE}/vs7_conversions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversionDoc)
    });

    if (!writeRes.ok) {
      const errText = await writeRes.text();
      console.error('[Postback] Firestore write error:', errText);
      // Still return 200 so the ad network doesn't retry
      return res.status(200).json({ status: 'error_logged', detail: 'Firestore write failed' });
    }

    // Also update daily stats counter
    // We use a separate doc per day for aggregation
    const statsDocId = `conversions_${dateStr}`;
    const statsUrl = `${FIRESTORE_BASE}/vs7_daily_stats/${statsDocId}`;
    
    // Try to read existing stats
    const statsRes = await fetch(statsUrl);
    const isChargeback = String(status) === '0';
    
    if (statsRes.ok) {
      const existing = await statsRes.json();
      const currentCount = existing.fields?.conversions?.integerValue 
        ? parseInt(existing.fields.conversions.integerValue) : 0;
      const currentRevenue = existing.fields?.revenue?.doubleValue 
        ? parseFloat(existing.fields.revenue.doubleValue) : 0;
      const currentChargebacks = existing.fields?.chargebacks?.integerValue
        ? parseInt(existing.fields.chargebacks.integerValue) : 0;

      const updateDoc = {
        fields: {
          ...existing.fields,
          conversions:  { integerValue: String(currentCount + (isChargeback ? 0 : 1)) },
          revenue:      { doubleValue: currentRevenue + (isChargeback ? 0 : (parseFloat(payout) || 0)) },
          chargebacks:  { integerValue: String(currentChargebacks + (isChargeback ? 1 : 0)) },
          last_updated: { timestampValue: now.toISOString() }
        }
      };

      await fetch(statsUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateDoc)
      });
    } else {
      // Create new daily stats doc
      const newStats = {
        fields: {
          date:         { stringValue: dateStr },
          conversions:  { integerValue: isChargeback ? '0' : '1' },
          revenue:      { doubleValue: isChargeback ? 0 : (parseFloat(payout) || 0) },
          chargebacks:  { integerValue: isChargeback ? '1' : '0' },
          last_updated: { timestampValue: now.toISOString() }
        }
      };

      await fetch(`${FIRESTORE_BASE}/vs7_daily_stats?documentId=${statsDocId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStats)
      });
    }

    console.log(`[Postback] ${isChargeback ? 'Chargeback' : 'Conversion'}: offer=${offer_id} payout=$${payout} lead=${lead_id} country=${country_code}`);

    return res.status(200).json({ 
      status: 'ok', 
      conversion: !isChargeback,
      offer_id,
      payout: parseFloat(payout) || 0
    });

  } catch (err) {
    console.error('[Postback] Error:', err.message);
    // Return 200 anyway so the ad network doesn't keep retrying
    return res.status(200).json({ status: 'error_logged', detail: err.message });
  }
};
