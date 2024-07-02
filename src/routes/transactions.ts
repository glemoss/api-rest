import { FastifyInstance } from "fastify"
import { knex } from "../database"
import { z } from "zod"
import crypto from 'crypto'


export async function transactionsRoutes(app: FastifyInstance) {
    app.get('/', async (req, res) => {
        const transactions = await knex('transactions').select()

        return {
            transactions
        }
    })

    app.get('/:id', async (req, res) => {
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getTransactionParamsSchema.parse(req.params)
        
        const transaction = await knex('transactions').where('id', id).first()

        return {
            transaction
        }
    })

    app.post('/', async (req, res) => {
        
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(req.body)

        await knex('transactions')
            .insert({
                id: crypto.randomUUID(),
                title,
                amount: type === 'credit' ? amount : amount * -1,

            })

        return res.status(201).send()
    })
}