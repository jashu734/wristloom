import { redirect } from 'next/navigation';

export default async function ServiceTrackRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/service-tracking?id=${id}`);
}
