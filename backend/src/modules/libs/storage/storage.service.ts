import {
	DeleteObjectCommand,
	type DeleteObjectCommandInput,
	PutObjectCommand,
	type PutObjectCommandInput,
	S3Client
} from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class StorageService {
	private readonly client: S3Client
	private readonly bucket: string

	constructor(private readonly configService: ConfigService) {
		this.client = new S3Client({
			endpoint: configService.getOrThrow<string>('S3_ENDPOINT'),
			region: configService.getOrThrow<string>('S3_REGION'),
			credentials: {
				accessKeyId: configService.getOrThrow<string>('S3_ACCESS_KEY_ID'),
				secretAccessKey: configService.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
			}
		})

		this.bucket = configService.getOrThrow<string>('S3_BUCKET')
	}

	public async upload(buffer: Buffer, key: string, mimeType: string) {
		const command: PutObjectCommandInput = {
			Bucket: this.bucket,
			Key: String(key),
			Body: buffer,
			ContentType: mimeType,
		}

		try {
			await this.client.send(new PutObjectCommand(command))
		} catch (error) {
			throw error
		}
	}

	public async remove(key: string) {
		const command: DeleteObjectCommandInput = {
			Bucket: this.bucket,
			Key: String(key)
		}

		try {
			await this.client.send(new DeleteObjectCommand(command))
		} catch (error) {
			throw error
		}
	}
}
