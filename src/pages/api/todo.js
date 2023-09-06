import client from '../../utils/db'
import validateToken from '../../utils/validateToken'
import responseBuilder from '../../utils/responseBuilder'
import validateToDoAuthor from '../../utils/validateToDoAuthor'

export const GET = async ({ request }) => {
    const token = request.headers.get('Authorization')
    
    const userId = await validateToken(token)
    if(!userId) {
        return responseBuilder({ status: 401, message: 'Invalid Token' })
    }

    const toDosQuery = {
        text: 'SELECT * FROM todos WHERE author_id = $1',
        values: [ userId ]
    }

    const toDos = await client.query(toDosQuery).then(res => res.rows)

    return responseBuilder({ status: 200, data: toDos })
}

export const POST = async ({ request }) => {
    const token = request.headers.get('Authorization')
    
    const userId = await validateToken(token)
    if(!userId) {
        return responseBuilder({ status: 401, message: 'Invalid Token' })
    }

    const body = await request.formData();
    const content = body.get('content')
    if(!content || content.length == 0) {
        return responseBuilder({ status: 400, message: 'Missing required field: content' })
    }

    const toDoQuery = {
        text: 'INSERT INTO toDos (content, author_id) VALUES ($1, $2) RETURNING *',
        values: [ content, userId ]
    }
    const toDoData = await client.query(toDoQuery).then(res => res.rows[0])

    return responseBuilder({ status: 201, data: toDoData })
}

export const PUT = async ({request}) => {
    const token = request.headers.get('Authorization')

    const userId = await validateToken(token)
    if(!userId) {
        return responseBuilder({ status: 401, message: 'Invalid Token' })
    }
    
    const body = await request.formData();
    const id = body.get('id')

    if(!id) {
        return responseBuilder({ status: 400, message: 'Missing required field: id' })
    }

    const isAuthor = await validateToDoAuthor({ userId, toDoId: id })
    if(!isAuthor) {
        return responseBuilder({ status: 400, message: 'Could not find your To Do' })
    }


    const is_completed = JSON.parse(body.get('is_completed'))
    const content = body.get('content')

    if(is_completed == undefined && !content) {
        return responseBuilder({ status: 400, message: 'Missing at least one field for editing' })
    }
    
    if(is_completed != undefined && !content) {
        const editQuery = {
            text: is_completed ? 
                'UPDATE toDos SET is_completed = $1, completed_at = NOW() WHERE id = $2 RETURNING *' :
                'UPDATE toDos SET is_completed = $1, completed_at = null WHERE id = $2 RETURNING *'
                ,
            values: [ is_completed, id ]
        }

        const result = await client.query(editQuery).then(res => res.rows[0])

        return responseBuilder({ status: 200, data: result })
    }

    if(is_completed == undefined && content) {
        const editQuery = {
            text: 'UPDATE toDos SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            values: [ content, id ]
        }

        const result = await client.query(editQuery).then(res => res.rows[0])

        return responseBuilder({ status: 200, data: result })
    }

    if(is_completed != undefined && content) {
        const editQuery = {
            text: is_completed ? 
                'UPDATE toDos SET content = $1, is_completed = $2, completed_at = NOW(), updated_at = NOW() WHERE id = $3 RETURNING *' :
                'UPDATE toDos SET content = $1, is_completed = $2, completed_at = null, updated_at = NOW() WHERE id = $3 RETURNING *',
            values: [ content, is_completed, id ]
        }

        const result = await client.query(editQuery).then(res => res.rows[0])

        return responseBuilder({ status: 200, data: result })
    }
}

export const DELETE = async ({ request }) => {
    const token = request.headers.get('Authorization')

    const userId = await validateToken(token)
    if(!userId) {
        return responseBuilder({ status: 401, message: 'Invalid Token' })
    }
    
    const body = await request.formData();
    const id = body.get('id')

    if(!id) {
        return responseBuilder({ status: 400, message: 'Missing required field: id' })
    }

    const isAuthor = await validateToDoAuthor({ userId, toDoId: id })
    if(!isAuthor) {
        return responseBuilder({ status: 400, message: 'Could not find your To Do' })
    }

    const deleteQuery = {
        text: 'DELETE FROM toDos WHERE id = $1',
        values: [ id ]
    }

    await client.query(deleteQuery)

    const successQuery = {
        text: 'SELECT COUNT(id) = 0 AS success FROM toDos WHERE id = $1',
        values: [ id ]
    }

    const success = await client.query(successQuery).then(res => res.rows[0].success)
    if(!success) {
        return responseBuilder({ status: 500, message: 'Could not delete your To Do' })
    }

    return responseBuilder({ status: 200, data: { success: true } })
}