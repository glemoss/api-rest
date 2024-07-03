import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { app } from '../src/app'
import supertest from 'supertest'

describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })
    
    it('user can create a transaction', async () => {
        const response = await supertest(app.server)
            .post('/transactions')
            .send({
                title: 'test create transaction',
                amount: 10,
                type: 'credit'
            }).expect(201)
    })

    it('should be able to list all transactions', async () => {
        const createTransactionResponse = await supertest(app.server)
            .post('/transactions')
            .send({
                title: 'test create transaction',
                amount: 10,
                type: 'credit'
            })

        const cookies = createTransactionResponse.get('Set-Cookie')

        const transactionsList = await supertest(app.server)
            .get('/transactions')
            .set('Cookie', cookies!)
            .expect(200)

        expect(transactionsList.body.transactions).toEqual([
            expect.objectContaining({
                title: 'test create transaction',
                amount: 10,
            })
        ])
    })
})