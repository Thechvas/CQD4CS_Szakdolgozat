export async function uploadProfilePicture(file: File, userId: string) {
  return `/uploads/${userId}-${file.name}`;
}
