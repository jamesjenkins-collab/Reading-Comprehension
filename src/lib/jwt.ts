export async function signJWT(payload: any, secretKeyString: string): Promise<string> {
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKeyString),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        secretKey,
        encoder.encode(dataToSign)
    );

    const signatureBytes = new Uint8Array(signatureBuffer);
    const signatureStr = String.fromCharCode(...signatureBytes);
    const encodedSignature = btoa(signatureStr).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    return `${dataToSign}.${encodedSignature}`;
}

export async function verifyJWT(token: string, secretKeyString: string): Promise<any> {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token structure');
        }

        const [header, payload, signature] = parts;
        const dataToSign = `${header}.${payload}`;

        const encoder = new TextEncoder();
        const secretKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secretKeyString),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        // Reconstruct the signature byte array from the base64url encoded signature
        let b64Signature = signature.replace(/-/g, '+').replace(/_/g, '/');
        while (b64Signature.length % 4) {
            b64Signature += '=';
        }
        const signatureStr = atob(b64Signature);
        const signatureBytes = new Uint8Array(signatureStr.length);
        for (let i = 0; i < signatureStr.length; i++) {
            signatureBytes[i] = signatureStr.charCodeAt(i);
        }

        const isValid = await crypto.subtle.verify(
            'HMAC',
            secretKey,
            signatureBytes,
            encoder.encode(dataToSign)
        );

        if (!isValid) {
            throw new Error('Signature verification failed');
        }

        let b64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
        while (b64Payload.length % 4) {
            b64Payload += '=';
        }
        const decodedPayload = JSON.parse(atob(b64Payload));

        if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
            throw new Error('Token expired');
        }

        return decodedPayload;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Invalid token');
    }
}
