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
  uploadAvatar(file: File, uploaderId: number): Promise<UploadedFile> {
    const form = new FormData();
    form.append('file', file);
    return http.post('/file/files/upload', form, { params: { uploaderId, accessLevel: 0 } });
  },
  uploadFromUrl(url: string): Promise<UploadedFile> {
    return http.post('/file/files/upload-from-url', null, { params: { imageUrl: url } });
  },
};
