'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Edit, Plus, Search, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { deleteCareerProfile } from '@/actions/career-profiles';
import { toast } from 'sonner';
import Moment from 'react-moment';
import { confirmDialog } from '../shared/confirm-dialog';
import { LinkableTableCell } from '../ui/linkable-table-cell';
import { CareerProfile } from '@prisma/client';

interface CareerProfilesDataTableProps {
  data: CareerProfile[];
  pageCount: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
}

export function CareerProfilesDataTable({
  data,
  pageCount,
  currentPage,
  pageSize,
  searchQuery,
}: CareerProfilesDataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchQuery);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', '1');
    params.set('pageSize', pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleChangePage = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDelete = async (careerProfile: CareerProfile) => {
    if (
      await confirmDialog({
        title: 'Are you absolutely sure!?',
        description: `You are deleting the "${careerProfile.name}" career profile.`,
      })
    )
      try {
        setIsDeleting(careerProfile.id);
        await deleteCareerProfile(careerProfile.id);
        toast.success('Career profile deleted successfully');
        router.refresh();
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setIsDeleting(null);
      }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search in career profiles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon" variant={'outline'}>
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <Button asChild>
          <Link href="/career-profiles/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Career Profile
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No career profiles found!
                </TableCell>
              </TableRow>
            ) : (
              data.map(cp => (
                <TableRow key={cp.id}>
                  <LinkableTableCell className="font-medium" href={`/career-profiles/${cp.id}`}>
                    {cp.name}
                  </LinkableTableCell>
                  <LinkableTableCell href={`/career-profiles/${cp.id}`}>
                    {cp.description}
                  </LinkableTableCell>
                  <LinkableTableCell href={`/career-profiles/${cp.id}`}>
                    <Moment date={cp.createdAt} format="YYYY/MM/DD HH:mm" utc />
                  </LinkableTableCell>
                  <LinkableTableCell href={`/career-profiles/${cp.id}`}>
                    <Moment date={cp.updatedAt} format="YYYY/MM/DD HH:mm" utc />
                  </LinkableTableCell>
                  <TableCell className="flex gap-2">
                    {/* Delete Confirmation Dialog */}
                    <Button
                      variant={'outline'}
                      disabled={isDeleting === cp.id}
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(cp)}
                    >
                      <Trash className=" h-4 w-4" />
                      {/* Delete */}
                    </Button>

                    <Button asChild variant={'outline'} disabled={isDeleting === cp.id}>
                      <Link href={`/career-profiles/${cp.id}`}>
                        <Edit className=" h-4 w-4" />
                        {/* Edit */}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {data.length > 0 && (
            <>
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, (currentPage - 1) * pageSize + data.length)}
              </span>{' '}
              of <span className="font-medium">{pageCount * pageSize}</span> career profiles
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(currentPage + 1)}
            disabled={currentPage >= pageCount}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
