/**
 * Secure Proxy for CPA Offers Feed
 * 
 * Hides the CPA_API_KEY and CPA_USER_ID from the client.
 * Receives: s1, s2 (query params)
 * key: cpa-offers-proxy
 */

const axios = require('axios'); // Vercel functions support axios if installed, or we can use fetch if node 18+

// Using native fetch for Node 18+ (Vercel default)
module.exports = async function handler(req, res) {
    // 1. CORS Headers (Allow all origins for now, or restrict to your domain)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { s1 = '', s2 = '' } = req.query;
    const userAgent = req.headers['user-agent'] || '';

    // 2. Get Secrets from Env
    const API_KEY = process.env.CPA_API_KEY;
    const USER_ID = process.env.CPA_USER_ID;

    if (!API_KEY || !USER_ID) {
        console.error('[Get-Offers] Missing CPA_API_KEY or CPA_USER_ID env vars.');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // 3. Construct External URL
    const targetUrl = new URL('https://d1y3y09sav47f5.cloudfront.net/public/offers/feed.php');
    targetUrl.searchParams.append('user_id', USER_ID);
    targetUrl.searchParams.append('api_key', API_KEY);
    targetUrl.searchParams.append('s1', s1);
    targetUrl.searchParams.append('s2', s2);
    // Pass through the user agent so the network can detect device type/OS
    targetUrl.searchParams.append('user_agent', userAgent);

    try {
        // 4. Fetch from External Provider
        const response = await fetch(targetUrl.toString());

        if (!response.ok) {
            throw new Error(`Upstream error: ${response.status}`);
        }

        const data = await response.json();

        // 5. Return to Client
        // Cache for 60 seconds to reduce hits to upstream
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        return res.status(200).json(data);

    } catch (error) {
        console.error('[Get-Offers] Fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch offers' });
    }
};
