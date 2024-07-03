import { app } from '../src/app'
import supertest from 'supertest'
import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })
    
    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
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

    it('should be able to get a transaction by its id', async () => {
        const createTransactionResponse = await supertest(app.server)
            .post('/transactions')
            .send({
                title: 'test get transaction by id',
                amount: 10,
                type: 'credit'
            })

        const cookies = createTransactionResponse.get('Set-Cookie')

        const transactionList = await supertest(app.server)
            .get('/transactions')
           .set('Cookie', cookies!)
           .expect(200)

        const transactionId = transactionList.body.transactions[0].id

        const getTransactionById = await supertest(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies!)
            .expect(200)

        expect(getTransactionById.body.transaction).toEqual(
            expect.objectContaining({
                title: 'test get transaction by id',
                amount: 10,
            })
        )
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

    it('should be able to get transactions summary', async () => {
        const creditTransaction = await supertest(app.server)
            .post('/transactions')
            .send({
                title: 'credit transaction',
                amount: 10,
                type: 'credit'
            })

        const cookies = creditTransaction.get('Set-Cookie')

        const debitTransaction = await supertest(app.server)
            .post('/transactions')
            .set('Cookie', cookies!)
            .send({
                title: 'debit transaction',
                amount: 10,
                type: 'debit'
            })

        const transactionsSummary = await supertest(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies!)
            .expect(200)

        expect(transactionsSummary.body.summary).toEqual([
            expect.objectContaining({
                "sum(`amount`)": 0,
            })
        ])
    })
})