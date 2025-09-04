
export function validateFileFormat(
	filename: string,
	allowedFileFormats: string[]
) {
	const fileParts = filename.split('.')
	const fileExtension = fileParts[fileParts.length - 1].toLowerCase()

	return allowedFileFormats.includes(fileExtension)
}

export function validateFileSizeFromBuffer(
  fileSize: number,
  allowedFileSizeInBytes: number
) {
  return fileSize <= allowedFileSizeInBytes
}
