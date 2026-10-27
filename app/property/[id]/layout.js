import Workspace from "@/components/Workspace";

export default function PropertyLayout({ children, params }) {
  return <Workspace id={params.id}>{children}</Workspace>;
}
