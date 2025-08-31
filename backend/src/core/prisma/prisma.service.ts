import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit
} from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
	extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name)
	constructor() {
		super({
			log: [
				{
					emit: 'event',
					level: 'query'
				},
				{
					emit: 'event',
					level: 'error'
				},
				{
					emit: 'stdout',
					level: 'info'
				},
				{
					emit: 'stdout',
					level: 'warn'
				}
			]
		})

		this.$on('query', e => {
			this.logger.debug(`Query: ${e.query}`)
			this.logger.debug(`Params: ${e.params}`)
			this.logger.debug(`Duration: ${e.duration}ms`)
		})

		this.$on('info', e => {
			this.logger.log(e.message)
		})

		this.$on('warn', e => {
			this.logger.warn(e.message)
		})

		this.$on('error', e => {
			this.logger.error(e.message)
		})
	}

	public async onModuleInit() {
		await this.$connect()
	}

	public async onModuleDestroy() {
		await this.$disconnect()
	}
}
