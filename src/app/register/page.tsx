export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";

const ClientComponent = dynamicImport(
  () => import("./ClientSide"),
  { ssr: false }
);

export default function Page(props: any) {
  return <ClientComponent {...props} />;
}
