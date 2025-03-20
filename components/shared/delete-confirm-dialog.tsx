import { confirmable, ConfirmDialog, createConfirmation } from "react-confirm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import React from "react";

export interface Props {
  title?: string;
  description?: string;
  confirmText?: string;
}

const DeleteConfirmDialog: ConfirmDialog<Props, boolean> = ({
  show,
  proceed,
  dismiss,
  cancel,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone.",
  confirmText = "Yes, Delete!",
}) => {
  return (
    <AlertDialog open={show} onOpenChange={dismiss}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => proceed(true)}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Create the confirmation function
const ConfirmComponent = confirmable(DeleteConfirmDialog);

export const confirmDelete = createConfirmation(ConfirmComponent);
export default ConfirmComponent;
