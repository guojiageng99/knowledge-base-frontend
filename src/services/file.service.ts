import http from './request';

export interface UploadedFile {
  id: number;
  originalName: string;
  storedName?: string;
  fileUrl: string;
  previewUrl?: string;
  convertedUrl?: string;
  newUrl?: string;
}

export const fileService = {
  uploadFromUrl(url: string): Promise<UploadedFile> {
    return http.post('/file/files/upload-from-url', null, { params: { imageUrl: url } });
  },
};
