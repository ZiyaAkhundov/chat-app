import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ImageService } from './image.service'
import { FileValidationPipe } from '@/src/shared/pipes/file-validation.pipe'
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiParam, ApiProperty } from '@nestjs/swagger'
import { Authorization } from '@/src/shared/decorators/auth.decorator'

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The image file to upload',
        },
      },
      required: ['file'],
    },
  })
  @Authorization()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    return this.imageService.uploadImage(file)
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete an image by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the image to delete',
  })
  @Authorization()
  @Delete(':id')
  async deleteImage(@Param('id') id: string) {
    return this.imageService.deleteImage(id)
  }
  
}
