import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { sign, verify, type SignOptions, type Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Response, ResponseWithMessage } from '@/types';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, await bcrypt.genSalt());
}

/**
 * Function to check whether the given value is expired or not.
 * @param expires The date that want to check
 * @return true if the value is expired, false otherwise
 */
export function isExpired(expires: Date): boolean {
  return new Date(expires) < new Date();
}

/**
 * Function to set token expiration.
 * @param exp Duration of token expiration, default is 3600 milliseconds or 1 hour
 * @return Generates datetime for the token expiration
 */
export function setTokenExpiration(exp: number = 60 * 60) {
  return new Date(new Date().getTime() + 1000 * exp);
}

/**
 * Function to generate jwt.
 * @param payload The payload want to generate
 * @param options The sign options
 * @return The token generated
 */

export function signJwt(payload: Record<string, unknown>, options?: SignOptions) {
  return sign(payload, process.env.JWT_SECRET as Secret, {
    ...options,
    algorithm: 'HS256',
  });
}

export const verifyJwtToken = <T extends object>(token: string) => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET as Secret);
    return {
      valid: true,
      decoded: decoded as T,
    };
  } catch (_) {
    return {
      valid: false,
      decoded: null,
    };
  }
};

// Overload for response status in server action
export function response(response: ResponseWithMessage): Response;
export function response<T extends Record<string, unknown>>(response: Response<T>): Response<T>;
export function response<T extends object>(response: T): T {
  return response;
}

export function capitalizeText(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function hashCode(s: string) {
  return s.split('').reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
}

export function hashString(str: string, length = 64) {
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  return hash.substring(0, length);
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, i) =>
    array.slice(i * chunkSize, i * chunkSize + chunkSize),
  );
}
export function randomNDigits(_n?: number) {
  return Math.random().toString(36).substring(2, 8);
  // return (
  //   Math.floor(Math.random() * (9 * Math.pow(10, n || 5))) +
  //   Math.pow(10, n || 5)
  // );
}

export async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // Get the content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Get the image as an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(arrayBuffer);

    // Convert to Base64
    const base64String = buffer.toString('base64');

    // Return as data URL
    return `data:${contentType};base64,${base64String}`;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

export const getMimeType = (filename: string) => {
  const fileExtension = filename.split('.').pop()?.toLowerCase();
  switch (fileExtension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    case 'rtf':
      return 'application/rtf';
    case 'odt':
      return 'application/vnd.oasis.opendocument.text';
  }

  return 'application/pdf';
};

export const removeNullProperties = (data: any): any => {
  if (data === null || data === undefined) {
    return undefined;
  }

  if (Array.isArray(data)) {
    return data.map(item => removeNullProperties(item)).filter(item => item !== undefined);
  }

  if (typeof data === 'object') {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      const cleanValue = removeNullProperties(value);
      if (cleanValue !== undefined) {
        result[key] = cleanValue;
      }
    }

    return result;
  }

  return data;
};

/**
 * Deep updates values in an object using a callback function
 * @param obj The object to traverse and update
 * @param callback Function that receives key path and value, returns new value
 * @returns A new object with updated values
 */
export function deepUpdateValues<T>(
  obj: T,
  callback: (keyPath: string, keyName: string, value: any) => any,
): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Create a deep clone to avoid mutating the original object
  const result = Array.isArray(obj) ? ([...obj] as any) : { ...obj };

  // Process each property in the object
  const processObject = (currentObj: any, parentPath: string = ''): any => {
    Object.entries(currentObj).forEach(([key, value]) => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;

      if (value !== null && typeof value === 'object') {
        // Recursively process nested objects and arrays
        currentObj[key] = processObject(value, currentPath);
      } else {
        // Call the callback for primitive values
        currentObj[key] = callback(currentPath, key, value);
      }
    });

    return currentObj;
  };

  return processObject(result) as T;
}

export const wait = (delay?: number) => new Promise(resolve => setTimeout(resolve, delay));
