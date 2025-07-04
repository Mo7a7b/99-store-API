/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    options?: {
      folder?: string;
      transformation?: Record<string, unknown> | Record<string, unknown>[];
      resource_type?: 'auto' | 'image' | 'video' | 'raw';
    },
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = v2.uploader.upload_stream(
        {
          folder: options?.folder || 'uploads',
          resource_type: options?.resource_type || 'auto',
          transformation: options?.transformation,
        },
        (error, result) => {
          if (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : typeof error === 'object'
                  ? JSON.stringify(error)
                  : String(error);
            return reject(new Error(errorMessage));
          }
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed: result is undefined.'));
          }
        },
      );

      if (file && file.buffer) {
        uploadStream.end(file.buffer);
      } else {
        reject(new Error('Invalid file or missing buffer property.'));
      }
    });
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    options?: { folder?: string },
  ): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, options));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<any> {
    return v2.uploader.destroy(publicId);
  }

  async getImageDetails(publicId: string): Promise<any> {
    return v2.api.resource(publicId);
  }
}
