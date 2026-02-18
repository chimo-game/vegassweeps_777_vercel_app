/**
 * Secure Proxy for CPA Lead Check
 * 
 * Hides the CPA_API_KEY and CPA_USER_ID from the client.
 * Receives: callback (for JSONP if needed, though we prefer JSON)
 * key: cpa-lead-check-proxy
 */

module.exports = async function handler(req, res) {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { callback } = req.query;

    // 2. Get Secrets from Env
    const API_KEY = process.env.CPA_API_KEY;
    const USER_ID = process.env.CPA_USER_ID;

    if (!API_KEY || !USER_ID) {
        console.error('[Check-Lead] Missing CPA_API_KEY or CPA_USER_ID env vars.');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // 3. Construct External URL
    const targetUrl = new URL('https://d1y3y09sav47f5.cloudfront.net/public/external/check2.php');
    targetUrl.searchParams.append('user_id', USER_ID);
    targetUrl.searchParams.append('api_key', API_KEY);
    targetUrl.searchParams.append('testing', '0');

    // Handle JSONP callback if present
    if (callback) {
        targetUrl.searchParams.append('callback', callback);
    }

    try {
        // 4. Fetch from External Provider
        const response = await fetch(targetUrl.toString());

        if (!response.ok) {
            throw new Error(`Upstream error: ${response.status}`);
        }

        const text = await response.text();

        // 5. Return to Client
        // If it's JSONP, the content type should be javascript
        if (callback) {
            res.setHeader('Content-Type', 'application/javascript');
        } else {
            res.setHeader('Content-Type', 'application/json');
        }

        res.status(200).send(text);

    } catch (error) {
        console.error('[Check-Lead] Fetch error:', error);
        return res.status(500).json({ error: 'Failed to check leads' });
    }
};
