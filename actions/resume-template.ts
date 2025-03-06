"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteResumeTemplate(id: string) {
    try {
        const user = await currentUser()
        await db.resumeTemplate.delete({
            where: { id, userId: user?.id },
        });

        revalidatePath("/templates");
        return { success: true };
    } catch (error) {
        return { success: false, error: { message: "Failed to delete template" } };
    }
}