import { notFound } from "next/navigation";
import SamSearchClient from "./SamSearchClient";

const isDerekInstance = (process.env.INSTANCE_OWNER || "").toLowerCase() === "derek";

export const dynamic = "force-dynamic";

export default function SamSearchPage() {
  if (!isDerekInstance) {
    return notFound();
  }
  return <SamSearchClient />;
}
