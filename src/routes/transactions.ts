import { FastifyInstance } from "fastify"
import { knex } from "../database"
import { z } from "zod"
import { randomUUID } from 'crypto'
import { checkSessionId } from "../middlewares/check-session-id"


export async function transactionsRoutes(app: FastifyInstance) {
    app.addHook('preHandler', async (req, res) => {
        console.log(`[${req.method}] ${req.url}`)
    })

    app.get(
        '/',
        { 
            preHandler: checkSessionId 
        },
        async (req, res) => {

            const { sessionId } = req.cookies

            const transactions = await knex('transactions').where('session_id', sessionId).select()

            return {
                transactions
            }
        }
    )

    app.get(
        '/:id',
        { 
            preHandler: checkSessionId
        },
        async (req, res) => {

            const { sessionId } = req.cookies

            const getTransactionParamsSchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = getTransactionParamsSchema.parse(req.params)
            
            const transaction = await knex('transactions')
            .where({
                session_id: sessionId,
                id
            })
            .first()

            return {
                transaction
            }
        }
    )

    app.get(
        '/summary',
        { 
            preHandler: checkSessionId
        },
        async (req, res) => {

            const { sessionId } = req.cookies

            const summary = await knex('transactions').sum('amount').as('amount').where('session_id', sessionId)

            return {
                summary
            }
        }
    )

    app.post('/', async (req, res) => {
        
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(req.body)

        let sessionId = req.cookies.sessionId

        if (!sessionId) {
            sessionId = randomUUID()
            res.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24, // 1 day
            })
        }

        await knex('transactions')
            .insert({
                id: randomUUID(),
                title,
                amount: type === 'credit' ? amount : amount * -1,
                session_id: sessionId
            })

        return res.status(201).send()
    })
}