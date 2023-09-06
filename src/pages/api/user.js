import client from '../../utils/db'
import responseBuilder from '../../utils/responseBuilder'
import validateToken from '../../utils/validateToken'
export const GET = async ({ request }) => {
    const token = request.headers.get('Authorization')
    
    const userId = await validateToken(token)
    if(!userId) {
        return responseBuilder({ status: 401, message: 'Invalid Token' })
    }

    const userQuery = {
        text: 'SELECT username FROM users WHERE  id = $1',
        values: [ userId ]
    }

    const username = await client.query(userQuery).then(res => res.rows.length > 0 ? res.rows[0].username : null)
    
    if(username == undefined) return responseBuilder({ status: 404, message: 'User not found' })
    
    return responseBuilder({ status: 200, data: { username } })
}