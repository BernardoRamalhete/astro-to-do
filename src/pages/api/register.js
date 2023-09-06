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
        return responseBuilder( { status: 400, message: `Missing required field${requiredFields.length > 1 ? 's' : ''}: ${requiredFields.join(', ')}` } )
        
    }

    const usernameQuery = {
        text: 'SELECT id FROM users WHERE username = $1',
        values: [ username ]
    }
    const validUserName = await client.query(usernameQuery).then(res => res.rows.length == 0)
    console.log(validUserName)
    if(!validUserName) {
        return responseBuilder({status: 400, message: 'Username already taken' })
    }

    
    const hashedPassword = await bcrypt.hash(password, 10)

    const registerQuery = {
        text: 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
        values: [ username, hashedPassword ]
    }

    const userId = await client.query(registerQuery).then(res => res.rows[0].id)

    
    const token = await createToken(userId)

    return responseBuilder({status: 201, data: { token } })
}