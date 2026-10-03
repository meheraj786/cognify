export const uploadToCloudinary = async (
  fileUri: string,
  fileName?: string
): Promise<{ url: string; size?: string }> => {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary credentials missing in environment variables');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'image/jpeg',
    name: fileName || `upload_${Date.now()}.jpg`,
  } as any);

  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload image');
  }

  const data = await response.json();

  const sizeInBytes = data.bytes;
  const formattedSize = sizeInBytes
    ? sizeInBytes > 1024 * 1024
      ? `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(sizeInBytes / 1024)} KB`
    : undefined;

  return {
    url: data.secure_url,
    size: formattedSize,
  };
};