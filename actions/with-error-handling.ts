type ServerActionResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
    action: T
): (...args: Parameters<T>) => Promise<ServerActionResponse<Awaited<ReturnType<T>>>> {
    return async (...args: Parameters<T>): Promise<ServerActionResponse<Awaited<ReturnType<T>>>> => {
        try {
            const data = await action(...args);
            return { success: true, data };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            return { success: false, error: errorMessage };
        }
    };
}
