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
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  ExternalLink,
  Search,
  Trash,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ResumeTemplate } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { deleteResumeTemplate } from "@/actions/resume-template";
import { toast } from "sonner";
import { AlertDialog, AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

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

  const handleDeleteTemplate = async (id: string) => {
    try {
      setIsDeleting(id);
      const result = await deleteResumeTemplate(id);

      if (!result.success) {
        toast.error(result.error?.message || "Failed to delete template");
        return;
      }

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
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell>
                    {format(new Date(template.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(template.updatedAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {/* Delete Confirmation Dialog */}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant={"outline"}
                          disabled={isDeleting === template.id}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className=" h-4 w-4" />
                          {/* Delete */}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the resume and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            Yes, Delete!
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
