"use client";

import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import EditProfileForm from "./EditProfileForm";

interface EditProfileFormWrapperProps {
  user: {
    id: string;
    username: string;
    profilePic?: string | null;
    country?: string | null;
  };
}

export default function EditProfileFormWrapper({
  user,
}: EditProfileFormWrapperProps) {
  const { data: session } = useSession();

  return (
    <SessionProvider session={session}>
      {" "}
      <EditProfileForm user={user} />
    </SessionProvider>
  );
}
