import { ServerActionResponse } from '@/lib/with-error-handling';
import { toast } from 'sonner';

/**
 * Executes a server action with error handling
 * Server actions already return { success, data, error } format
 *
 * @param action - The action function to execute or the result of calling the action
 * @param args - Arguments to pass to the action function (if the first parameter is a function)
 * @returns A promise that resolves to the server action's response or a standardized error response
 */
export async function runAction<T, Args extends any[]>(
  action: ((...args: Args) => Promise<ServerActionResponse<T>>) | Promise<ServerActionResponse<T>>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    showToast?: boolean;
  },
  ...args: Args
): Promise<ServerActionResponse<T>> {
  // Default options
  const { successMessage, errorMessage, showToast = true } = options || {};
  try {
    // Check if action is a function or a promise
    if (typeof action === 'function') {
      // If it's a function, call it with the provided arguments
      const result = await action(...args);

      if (!result.success) {
        const errorMsg = errorMessage || result.error?.message;
        if (showToast && errorMsg) {
          toast.error(errorMsg);
        }
        console.error('Unexpected error when executing action:', result);
      } else {
        // Show success toast when action completes successfully
        if (showToast && successMessage) {
          toast.success(successMessage);
        }
      }

      return result;
    } else {
      // If it's a promise (already called action), just await it
      const result = await action;

      if (!result.success) {
        if (showToast && errorMessage) {
          toast.error(errorMessage || result.error?.message || 'An unexpected error occurred');
        }
        console.error('Unexpected error when executing action:', result);
      } else {
        // Show success toast when action completes successfully
        if (showToast && successMessage) {
          toast.success(successMessage);
        }
      }

      return result;
    }
  } catch (error) {
    // Handle unexpected errors that might occur when executing the action
    console.error('Unexpected error when executing action:', error);

    // Return a standardized error response
    return {
      success: false,
      data: null as unknown as T, // Type assertion needed here
      error: {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        data: error,
      },
    };
  }
}

// Usage examples:

// Example 1: Passing action function and arguments separately
// const result = await runAction(
//   updateResumeTemplate,
//   { successMessage: 'Resume template updated successfully' },
//   { ...resumeTemplate, content: resumeContent },
//   12
// );
// if (result.success) {
//   // Handle successful result with result.data
//   console.log('Operation successful:', result.data);
// } else {
//   // Handle error with result.error
//   console.error('Operation failed:', result.error.message);
// }

// Example 2: Passing the result of calling the action (already a promise)
// const result = await runAction(
//   updateResumeTemplate({ ...resumeTemplate, content: resumeContent }, 12),
//   { successMessage: 'Resume template updated successfully' }
// );
// if (result.success) {
//   // Use the successful result
// } else {
//   // Handle the error case
// }

// Example 3: Disable toast notifications
// const result = await runAction(
//   updateResumeTemplate,
//   { showToast: false },
//   { ...resumeTemplate, content: resumeContent },
//   12
// );
