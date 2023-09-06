import client from './db'

export default async function validateToDoAuthor({ userId, toDoId }) {
    const isAuthorQuery = {
        text: 'SELECT author_id = $1 AS is_author FROM toDos WHERE id = $2',
        values: [ userId, toDoId  ]
    }

    return await client.query(isAuthorQuery).then(res => res.rows.length > 0 ? res.rows[0].is_author : false)
}