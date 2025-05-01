import SearchUser from "@/components/SearchUser";
import TopMembersList from "@/components/TopMembersList";

export const dynamic = "force-dynamic";

export default async function TopMembersPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Search Members</h1>
      <SearchUser />
      <h1 className="text-3xl font-bold mb-6">Top Members</h1>
      <TopMembersList />
    </div>
  );
}
