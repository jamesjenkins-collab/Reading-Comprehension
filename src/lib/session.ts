// A dead-simple signed session implementation to bypass Vercel Edge JWT issues

export async function createSessionCookie(payload: any, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const dataString = JSON.stringify({
        ...payload,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days in ms
    });

    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(dataString)
    );

    // Convert buffer to hex string for dead-simple transport without base64 padding issues
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Encode payload to base64 just so it's cookie safe (doesn't affect signature)
    const encodedPayload = btoa(encodeURIComponent(dataString));

    // The cookie format is Base64Payload.HexSignature
    return `${encodedPayload}.${signatureHex}`;
}

export async function verifySessionCookie(cookieValue: string, secret: string): Promise<any> {
    try {
        const parts = cookieValue.split('.');
        if (parts.length !== 2) throw new Error('Invalid cookie format');

        const [encodedPayload, signatureHex] = parts;

        // Decode payload
        const dataString = decodeURIComponent(atob(encodedPayload));
        const payload = JSON.parse(dataString);

        if (payload.exp && Date.now() > payload.exp) {
            throw new Error('Session expired');
        }

        // Recreate signature to verify
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const expectedSignatureBuffer = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(dataString)
        );

        const expectedSignatureArray = Array.from(new Uint8Array(expectedSignatureBuffer));
        const expectedSignatureHex = expectedSignatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Compare simple hex strings
        if (signatureHex !== expectedSignatureHex) {
            throw new Error(`Signature mismatch: Expected ${expectedSignatureHex.substring(0, 10)}... got ${signatureHex.substring(0, 10)}... (payload: ${dataString})`);
        }

        return payload;
    } catch (err: any) {
        throw new Error(err.message || 'Verification failed');
    }
}
