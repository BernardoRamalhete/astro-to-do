import * as bcrypt from 'bcrypt'
import client from '../../utils/db'
import createToken from '../../utils/createToken'
import responseBuilder from '../../utils/responseBuilder'
export const POST = async ({ request }) => {
    const body = await request.formData();

    const username = body.get('username')
    const password = body.get('password')
    const requiredFields = []
    if(!username) {
        requiredFields.push('username')
    }
    if(!password) {
        requiredFields.push('password')
    }

    if(requiredFields.length > 0) {
        return responseBuilder({ status: 400, message: `Missing required field${requiredFields.length > 1 ? 's' : ''}: ${requiredFields.join(', ')}` })
    }

    const userQuery = {
        text: 'SELECT * FROM users WHERE username = $1',
        values: [ username ]
    }
    const userWithProvidedUsername = await client.query(userQuery).then(res => res.rows.length > 0 ? res.rows[0] : null)
    if(userWithProvidedUsername == undefined) return responseBuilder({ status: 400, message: 'Invalid username' })
    
    const validPassword = await bcrypt.compare(password, userWithProvidedUsername.password)
    if(!validPassword) return responseBuilder({ status: 400, message: 'Invalid password' })

    const token = await createToken(userWithProvidedUsername.id)

    return responseBuilder({ status: 200, data: { token } }) 
}