import { supabase } from './supabase';

const avatarBucket = 'avatares';
const maxAvatarSize = 5 * 1024 * 1024;
const allowedAvatarTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;

interface AvatarUploadResult {
  publicUrl: string;
  path: string;
}

const extensionByType: Record<(typeof allowedAvatarTypes)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function uploadAvatar(file: File): Promise<AvatarUploadResult> {
  if (!allowedAvatarTypes.includes(file.type as (typeof allowedAvatarTypes)[number])) {
    throw new Error('La foto debe ser JPG, PNG o WebP.');
  }

  if (file.size > maxAvatarSize) {
    throw new Error('La foto no puede superar los 5 MB.');
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('Debes iniciar sesión para subir tu foto.');
  }

  const folder = userData.user.id;
  const { data: existingFiles, error: listError } = await supabase.storage
    .from(avatarBucket)
    .list(folder);

  if (listError) throw new Error(`No se pudo preparar la foto: ${listError.message}`);

  const previousAvatars = existingFiles
    .filter((file) => file.name.startsWith('avatar.'))
    .map((file) => `${folder}/${file.name}`);

  if (previousAvatars.length > 0) {
    const { error: removeError } = await supabase.storage
      .from(avatarBucket)
      .remove(previousAvatars);
    if (removeError)
      throw new Error(`No se pudo reemplazar la foto anterior: ${removeError.message}`);
  }

  const extension = extensionByType[file.type as (typeof allowedAvatarTypes)[number]];
  const path = `${folder}/avatar.${extension}`;
  const { error: uploadError } = await supabase.storage.from(avatarBucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (uploadError) throw new Error(`No se pudo subir la foto: ${uploadError.message}`);

  const { data } = supabase.storage.from(avatarBucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}
