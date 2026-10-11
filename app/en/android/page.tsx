import AndroidAppPage, { androidPageMetadata } from "@/components/AndroidAppPage";

export const metadata = androidPageMetadata("en");

export default function Page() {
  return <AndroidAppPage locale="en" />;
}
