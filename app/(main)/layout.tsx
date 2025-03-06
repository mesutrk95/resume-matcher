import Navbar from "@/app/_components/navbar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-10 py-10">
        <div className="container">{children}</div>
      </main>
    </>
  );
}
