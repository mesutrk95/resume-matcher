"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Edit, Search, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ResumeTemplate } from "@prisma/client";
import { deleteResumeTemplate } from "@/actions/resume-template";
import { toast } from "sonner";
import Moment from "react-moment";
import { confirmDelete } from "../shared/delete-confirm-dialog";

interface ResumeTemplatesDateTableProps {
  data: ResumeTemplate[];
  pageCount: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
}

export function ResumeTemplatesDateTable({
  data,
  pageCount,
  currentPage,
  pageSize,
  searchQuery,
}: ResumeTemplatesDateTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchQuery);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", "1");
    params.set("pageSize", pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleChangePage = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteTemplate = async (template: ResumeTemplate) => {
    if (
      await confirmDelete({
        title: "Are you absolutely sure!?",
        description: `You are deleting the "${template.name}" template.`,
      })
    )
      try {
        setIsDeleting(template.id);
        await deleteResumeTemplate(template.id);
        toast.success("Template deleted successfully");
        router.refresh();
      } catch (error) {
        toast.error("Something went wrong");
      } finally {
        setIsDeleting(null);
      }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-sm items-center space-x-2"
        >
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="rounded-md border">
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
                <TableCell colSpan={5} className="h-24 text-center">
                  No templates found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    <Link href={`/templates/${template.id}`}>
                      {template.name}
                    </Link>
                  </TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell>
                    <Moment
                      date={template.createdAt}
                      format="YYYY/MM/DD HH:mm"
                      utc
                    />
                  </TableCell>
                  <TableCell>
                    <Moment
                      date={template.updatedAt}
                      format="YYYY/MM/DD HH:mm"
                      utc
                    />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {/* Delete Confirmation Dialog */}
                    <Button
                      variant={"outline"}
                      disabled={isDeleting === template.id}
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteTemplate(template)}
                    >
                      <Trash className=" h-4 w-4" />
                      {/* Delete */}
                    </Button>

                    <Button
                      asChild
                      variant={"outline"}
                      disabled={isDeleting === template.id}
                    >
                      <Link href={`/templates/${template.id}`}>
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
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  currentPage * pageSize,
                  (currentPage - 1) * pageSize + data.length
                )}
              </span>{" "}
              of <span className="font-medium">{pageCount * pageSize}</span>{" "}
              templates
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
