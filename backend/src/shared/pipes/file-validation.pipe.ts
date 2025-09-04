import {
	type ArgumentMetadata,
	BadRequestException,
	Injectable,
	type PipeTransform
} from '@nestjs/common'

import {
	validateFileFormat,
	validateFileSizeFromBuffer
} from '../utils/file.util'

@Injectable()
export class FileValidationPipe implements PipeTransform {
	public async transform(
		file: Express.Multer.File,
		metadata: ArgumentMetadata
	) {
		if (!file) {
			throw new BadRequestException('File is required')
		}

		const allowedFileFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif']
		const isFileFormatValid = validateFileFormat(
			file.originalname,
			allowedFileFormats
		)
		if (!isFileFormatValid) {
			throw new BadRequestException('Invalid file format')
		}

		if (!isFileFormatValid) {
			throw new BadRequestException('Invalid file format')
		}

		const maxSize = 5 * 1024 * 1024
		const isFileSizeValid = validateFileSizeFromBuffer(file.size, maxSize)

		if (!isFileSizeValid) {
			throw new BadRequestException(
				'File size exceeds the maximum allowed size'
			)
		}

		return file
	}
}
