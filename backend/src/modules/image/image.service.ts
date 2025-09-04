import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { imageHash } from 'image-hash'
import * as sharp from 'sharp'
import { v4 as uuid } from 'uuid'

import { PrismaService } from '@/src/core/prisma/prisma.service'

import { StorageService } from '../libs/storage/storage.service'

@Injectable()
export class ImageService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly storage: StorageService
	) {}

	private hammingDistance(hash1: string, hash2: string): number {
		let x = BigInt('0x' + hash1) ^ BigInt('0x' + hash2)
		let dist = 0
		while (x) {
			dist += Number(x & 1n)
			x >>= 1n
		}
		return dist
	}

	private async toHashBufferLossless(input: Buffer): Promise<Buffer> {
		return sharp(input)
			.flatten({ background: '#ffffff' })
			.png({ compressionLevel: 9 })
			.toBuffer()
	}

	private async computePhash(buffer: Buffer): Promise<string> {
		const lossless = await this.toHashBufferLossless(buffer)
		return new Promise<string>((resolve, reject) => {
			imageHash({ data: lossless }, 16, true, (err, hash) => {
				if (err) return reject(err)
				resolve(hash.toLowerCase())
			})
		})
	}

	private async findSimilarImages(
		phash: string,
		threshold = Number(process.env.IMAGE_SIMILARITY_THRESHOLD ?? 10)
	) {
		const images = await this.prisma.image.findMany({
			where: { deletedAt: null },
			select: { id: true, imageUrl: true, phash: true }
		})

		return images
			.filter(img => img.phash)
			.map(img => {
				const distance = this.hammingDistance(phash, img.phash!)
				const similarity_score = ((64 - distance) / 64) * 100
				return { ...img, distance, similarity_score }
			})
			.filter(x => x.distance <= threshold)
			.sort((a, b) => a.distance - b.distance)
	}

	async uploadImage(file: Express.Multer.File) {
		if (!file) throw new BadRequestException('File is required')

		const imageId = uuid()
		const objectKey = `uploads/${imageId}.webp`

		const webpBuffer = await sharp(file.buffer)
			.flatten({ background: '#ffffff' })
			.webp({ quality: 90, effort: 4, lossless: false })
			.toBuffer()

		const phash = await this.computePhash(file.buffer)

		await this.storage.upload(webpBuffer, objectKey, 'image/webp')

		const imageUrl = `${process.env.S3_PUBLIC_URL}/${objectKey}`

		const image = await this.prisma.image.create({
			data: {
				id: imageId,
				imageUrl,
				originalObjectKey: objectKey,
				phash
			}
		})
		return image
	}

	async deleteImage(id: string) {
		const image = await this.prisma.image.findUnique({ where: { id } })
		if (!image) throw new NotFoundException('Image not found')

		await this.storage.remove(image.originalObjectKey)

		return this.prisma.image.update({
			where: { id },
			data: { deletedAt: new Date() }
		})
	}
}
