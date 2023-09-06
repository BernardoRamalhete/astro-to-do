import pg from 'pg'

const connectionUrl = import.meta.env.ELEPHANT_SQL_CONNECTION

const client = new pg.Client(connectionUrl)

client.connect((error) => {
    if(error) {
        return console.log('Could not connect to db: ', error)
    }

    client.query('SELECT NOW() AS "time"', (error, result) => {
        if(error) {
            return console.log('error running test query: ', error)
        }

        console.log('connected to db at: ', result.rows[0].time)
    })
})

export default client