import { forwardApiFile } from "@/lib/api-files";

/** Empty CSV with the columns the bulk sign-up expects. */
export async function GET() {
  return forwardApiFile("/admin/account-imports/template");
}
