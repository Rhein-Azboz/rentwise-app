// src/services/cloudinary.service.ts

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads an image to Cloudinary and returns the secure URL.
 * @param imageUri - The local URI of the image (from image picker)
 * @param folder - Subfolder inside Cloudinary (e.g. 'listings', 'ids')
 */
export async function uploadImageToCloudinary(
  imageUri: string,
  folder: string = 'listings'
): Promise<string> {
  // Build the form data Cloudinary expects
  const formData = new FormData();

  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: `upload_${Date.now()}.jpg`,
  } as any);

  formData.append('upload_preset', UPLOAD_PRESET!);
  formData.append('folder', `rentwise/${folder}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Image upload failed. Please try again.');
  }

  const data = await response.json();

  // Return the secure HTTPS URL to store in Firestore
  return data.secure_url;
}