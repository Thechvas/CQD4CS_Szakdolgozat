import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import EditProfileForm from "@/components/EditProfileForm";

interface EditProfilePageParams {
  params: {
    username: string;
  };
}

export default async function EditProfilePage({
  params,
}: EditProfilePageParams) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/api/auth/signin");

  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || session.user.id !== user.id) {
    return notFound();
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Edit Your Profile</h1>
      <EditProfileForm user={user} />
    </div>
  );
}
