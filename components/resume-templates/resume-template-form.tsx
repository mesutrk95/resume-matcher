"use client";

import React, { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit, Save, X } from "lucide-react";
import { ResumeTemplate } from "@prisma/client";
import { updateResumeTemplate } from "@/actions/resume-template";
import { LoadingButton } from "../ui/loading-button";
import { runAction } from "@/app/_utils/runAction";

export const ResumeTemplateForm = ({
  template,
}: {
  template: ResumeTemplate;
}) => {
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState({ ...template });
  const [isPending, startTransition] = useTransition();

  // Template handlers
  const handleEditTemplate = () => {
    setTemplateForm({
      ...template,
      name: template.name,
      description: template.description,
    });
    setEditingTemplate(true);
  };

  const handleSaveTemplate = async () => {
    startTransition(async () => {
      const result = await runAction(updateResumeTemplate(templateForm));
      if (result.success) setEditingTemplate(false);
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-start justify-between">
        {!editingTemplate ? (
          <div>
            <CardTitle className="text-2xl">{template.name}</CardTitle>
            <p className="text-muted-foreground mt-1">{template.description}</p>
          </div>
        ) : (
          <div className="w-full space-y-2">
            <Input
              value={templateForm.name}
              onChange={(e) =>
                setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Template name"
              className="font-semibold text-lg"
            />
            <Input
              value={templateForm.description || ""}
              onChange={(e) =>
                setTemplateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Template description"
            />
          </div>
        )}

        <div>
          {!editingTemplate ? (
            <Button variant="outline" size="sm" onClick={handleEditTemplate}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setEditingTemplate(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <LoadingButton
                loading={isPending}
                loadingText="Saving..."
                size="sm"
                onClick={handleSaveTemplate}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </LoadingButton>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
