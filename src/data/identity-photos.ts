import photos from "../../public/preview/ai/media/photos-sources.json";

/** Use the same source record for photography, intrinsic dimensions, and credits. */
export function identityPhoto(file: string) {
  const photo = photos.find((entry) => entry.file === file);
  if (!photo) throw new Error(`Missing identity photograph: ${file}`);
  return {
    src: `/preview/ai/media/${photo.file}`,
    alt: photo.alt,
    width: photo.width,
    height: photo.height,
  };
}
