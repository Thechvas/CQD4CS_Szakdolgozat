import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import EditListForm from "@/components/EditListForm";
import { PageProps } from "@/types";

interface Props {
  params: { listId: string };
}

export default async function EditListPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  const { listId } = await params;

  const list = await prisma.list.findUnique({
    where: { id: listId },
  });

  if (!list || list.userId !== session.user.id) {
    return notFound();
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Edit List</h1>
      <EditListForm list={list} />
    </div>
  );
}
