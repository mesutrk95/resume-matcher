import { NextResponse } from "next/server";

export function withErrorHandling(handler: Function) {
  return async function (...args: any[]) {
    try {
      return await handler(...args);
    } catch (error: any) {
      console.error("Error:", error);
      return NextResponse.json(
        { message: error.message || "An unexpected error occurred" },
        { status: 500 }
      );
    }
  };
}