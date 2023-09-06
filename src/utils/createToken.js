import * as jose from 'jose'

export default async function createToken(id) {
    const jwtSecret = import.meta.env.JWT_SECRET
    const jwt = await new jose.SignJWT({ id })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime('2h')
        .sign(new TextEncoder().encode(jwtSecret))

    return jwt
}