import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  static async createBucket() {
    // Create bucket for law documents if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'law-documents');
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('law-documents', {
        public: false, // Private bucket for security
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/gif'
        ],
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (error) throw error;
    }
  }

  static async uploadFile(file: File, folder: string = 'documents') {
    // Ensure bucket exists
    await this.createBucket();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('law-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get signed URL for private access
    const { data: signedUrl } = await supabase.storage
      .from('law-documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return {
      filePath,
      signedUrl: signedUrl?.signedUrl,
      fileName
    };
  }

  static async downloadFile(filePath: string) {
    const { data, error } = await supabase.storage
      .from('law-documents')
      .download(filePath);

    if (error) throw error;
    return data;
  }

  static async deleteFile(filePath: string) {
    const { error } = await supabase.storage
      .from('law-documents')
      .remove([filePath]);

    if (error) throw error;
  }

  static async getSignedUrl(filePath: string, expiresIn: number = 3600) {
    const { data, error } = await supabase.storage
      .from('law-documents')
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  static async listFiles(folder: string = '') {
    const { data, error } = await supabase.storage
      .from('law-documents')
      .list(folder);

    if (error) throw error;
    return data;
  }
}