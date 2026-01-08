import fastify from 'fastify';
import cors from '@fastify/cors';

const app = fastify();

app.register(cors, {
    origin: '*',
});

app.get('/', () => {
    return { message: 'Server ta funcionando!' };
})

app.listen({ port: 3333 }).then(() => {
    console.log('Server rodando na porta 3333');
}).catch((err) => {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
});