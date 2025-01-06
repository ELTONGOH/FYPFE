import { uploadFileToS3, deleteMediaFromS3 } from '../s3Service';

class S3MediaFacade {
  static async uploadMedias(medias: Array<{ file: File, type?: string }>): Promise<Array<{ id: null, type: string | null, mediaUrl: string, createdAt: null, updatedAt: null }>> {
    const uploadPromises = medias.map(async (media, index) => {
      if (!media.file) {
        return null;
      }

      const objectKey = `${Date.now()}_${index}_media`;
      const fileUrl = await uploadFileToS3(media.file, objectKey);

      return {
        id: null,
        type: media.type || null,
        mediaUrl: fileUrl,
        createdAt: null,
        updatedAt: null
      };
    });

    const uploadedMedias = await Promise.all(uploadPromises);
    return uploadedMedias.filter((media): media is { id: null, type: string | null, mediaUrl: string, createdAt: null, updatedAt: null } => media !== null);
  }

  static async deleteMedias(mediaUrls: Array<string>): Promise<void> {
    if (!mediaUrls || mediaUrls.length === 0) return;

    const deletePromises = mediaUrls.map((url) => {
      const urlParts = url.split('/');
      const objectKey = urlParts.slice(3).join('/');
      return deleteMediaFromS3(objectKey);
    });

    await Promise.all(deletePromises);
  }

  static async updateMedias(existingMedias: any[], updatedMediaInputs: any[]) {
    if (!existingMedias || !updatedMediaInputs) {
      return;
    }

    const updatedMediaArray = await Promise.all(
      existingMedias.map(async (media) => {
        const input = updatedMediaInputs.find((item) => item.id === media.id);

        if (!input || !input.file) {
          return { ...media };
        }

        if (input.url) {
          const urlParts = input.url.split("/");
          const objectKey = urlParts.slice(3).join("/");
          try {
            await deleteMediaFromS3(objectKey);
            console.log(`Deleted old media: ${input.url}`);
          } catch (error) {
            console.error(`Failed to delete old media: ${input.url}`, error);
          }
        }

        try {
          const objectKey = `${Date.now()}_0_media`;
          const newFileUrl = await uploadFileToS3(input.file, objectKey);

          return {
            ...media,
            mediaUrl: newFileUrl
          };
        } catch (error) {
          console.error(`Failed to upload new media for id: ${media.id}`, error);
          throw new Error(`Failed to upload media: ${input.file.name}`);
        }
      })
    );

    return {
      oldMediaArray: [...existingMedias],
      updatedMediaArray,
    };
  }
}

export default S3MediaFacade;

