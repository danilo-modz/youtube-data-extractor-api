import { fastify } from 'fastify'
import cors from '@fastify/cors'
import { Downloader } from './src/Downloader.js'

const server = fastify()

await server.register(cors, { 
    origin: true
})

server.get('/', async (request, reply) => {
    const url = request.query.url;

    if (!url) {
        return reply.code(400).send( { error: { code: 400, message: 'Parameter {url} is required.', status: 'FAILED_PRECONDITION' } } );
    }

    const response = await new Downloader(url).download()

    return reply.code(response.error?.code ?? 200).send(response);
})

server.listen({
    host: '0.0.0.0',
    port: process.env.port ?? 3333
})