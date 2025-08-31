import {
	type ArgumentMetadata,
	BadRequestException,
	Injectable,
	type PipeTransform
} from '@nestjs/common'
import { ReadStream } from 'fs'
import { validateFileFormat, validateFileSize } from '../utils/file.util'


@Injectable()
export class FileValidationPipe implements PipeTransform {
	public async transform(value: any, metadata: ArgumentMetadata) {
		if (!value.filename) {
			throw new BadRequestException('File is required')
		}

		const { filename, createReadStream } = value

		const fileStream = createReadStream() as ReadStream

		const allowedFileFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif']
		const isFileFormatValid = validateFileFormat(
			filename,
			allowedFileFormats
		)

		if (!isFileFormatValid) {
			throw new BadRequestException('Invalid file format')
		}

		const isFileSizeValid = await validateFileSize(
			fileStream,
			1024 * 1024 * 5
		)

		if (!isFileSizeValid) {
			throw new BadRequestException(
				'File size exceeds the maximum allowed size'
			)
		}

		return value
	}
}
