import { test, beforeAll } from 'vitest'
import { app } from '../src/app'
import supertest from 'supertest'

beforeAll(async () => {
    await app.ready()
})

test('user can create a transaction', async () => {
    const response = await supertest(app.server)
        .post('/transactions')
        .send({
            title: 'test create transaction',
            amount: 10,
            type: 'credit'
        }).expect(201)
})