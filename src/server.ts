import fastify from "fastify";
import crypto from "crypto";
import { knex } from "./database";
import { env } from "./env";

const app = fastify()

app.post('/hello', async () => {
    const transaction = await knex('transactions').insert({
        id: crypto.randomUUID(),
        title: 'Test Transaction',
        amount: 100.00,
    }).returning('*')

    return transaction
})

app.get('/transactions', async (request, reply) => {
    const transaction = await knex('transactions').select('*')

    return transaction
})

app.listen({
    port: env.PORT,
}).then(() => {
    console.log('Server is running on port 3333');
})