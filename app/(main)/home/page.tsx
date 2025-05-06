import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Minova Dashboard',
};

// interface JobsPageProps {}

export default async function HomePage() {
  return (
    <div className="">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your jobs listing and applications</p>
        </div>
      </div>
    </div>
  );
}
