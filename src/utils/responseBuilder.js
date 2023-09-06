export default function responseBuilder({ status, message, data }) {
    if(message) {
        return new Response(JSON.stringify({
            message
        }), {
            status
        })
    }

    return new Response(JSON.stringify({
        data
    }), { status })
}