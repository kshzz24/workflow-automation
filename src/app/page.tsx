import { caller } from "@/trpc/server";

const Page = async () => {
  const users = await caller.getUsers();
  return <div className="text-red-500">{JSON.stringify(users)}</div>;
};

export default Page;
