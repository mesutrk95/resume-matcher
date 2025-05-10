import { Metadata } from 'next';
import { getAIRequest } from '@/actions/admin/ai-requests/get';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { StatusBadge } from '../columns';

export const metadata: Metadata = {
  title: 'AI Request Details - Admin Dashboard',
  description: 'View AI request details in the admin dashboard',
};

export default async function AIRequestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const request = await getAIRequest({ id });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/ai-requests">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to AI Requests
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">ID</div>
                <div className="font-mono">{request.id}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <StatusBadge status={request.status} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Created</div>
                <div>
                  {request.createdAt.toLocaleString()} (
                  {formatDistanceToNow(request.createdAt, { addSuffix: true })})
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Client ID</div>
                <div className="font-mono">{request.clientId}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Content ID</div>
                <div className="font-mono">{request.contentId}</div>
              </div>
              {request.errorMessage && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Error Message</div>
                  <div className="text-red-600">{request.errorMessage}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Prompt Tokens</div>
                <div>{request.promptTokens.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Completion Tokens</div>
                <div>{request.completionTokens.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Tokens</div>
                <div>{request.totalTokens.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Response Time</div>
                <div>{request.responseTime}ms</div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Prompt Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Prompt Key</div>
                <div className="font-mono">{request.variation.prompt.key}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Prompt Name</div>
                <div>{request.variation.prompt.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Variation ID</div>
                <div className="font-mono">{request.variationId}</div>
              </div>
            </CardContent>
          </Card>

          {request.user && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">User ID</div>
                  <div className="font-mono">{request.user.id}</div>
                </div>
                {request.user.name && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                    <div>{request.user.name}</div>
                  </div>
                )}
                {request.user.email && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div>{request.user.email}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {request.metadata && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-100 p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(request.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching AI request:', error);
    notFound();
  }
}
