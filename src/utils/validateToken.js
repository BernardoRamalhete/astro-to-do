import * as jose from 'jose'

export default async function validateToken(token) {
    try {
        if(!token || !token.startsWith('Bearer ')) {
            return false
        }
    
        const tokenJwt = token.split(' ')[1]
        const jwtSecretString = import.meta.env.JWT_SECRET
        const jwtSecret = new TextEncoder().encode(jwtSecretString)
    
        const { payload } = await jose.jwtVerify(tokenJwt, jwtSecret)
        const { id } = payload
    
        return id
    } catch (error) {
        false
    }
}