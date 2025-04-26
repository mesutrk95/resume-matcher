import { error } from 'console';
import logger from './logger';
import brevo from '@getbrevo/brevo';

// Minova marketing list name in Brevo
// This should be configured in environment variables in production
const MARKETING_LIST_NAME = process.env.BREVO_MARKETING_LIST_NAME || 'Minova';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

// Cache for list IDs found by name
const listIdCache: Record<string, number | null> = {};

/**
 * Initialize the Brevo API client with authentication
 * @returns The configured API client instance
 */
export const getBrevoClient = () => {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }

  return brevo;
};

/**
 * Get the transactional emails API instance
 * @returns Configured TransactionalEmailsApi instance
 */
export const getTransactionalEmailsApi = () => {
  const brevoClient = getBrevoClient();
  const apiInstance = new brevoClient.TransactionalEmailsApi();
  apiInstance.setApiKey(0, BREVO_API_KEY);

  return apiInstance;
};

/**
 * Get the contacts API instance
 * @returns Configured ContactsApi instance
 */
export const getContactsApi = () => {
  const brevoClient = getBrevoClient();
  const apiInstance = new brevoClient.ContactsApi();
  apiInstance.setApiKey(0, BREVO_API_KEY);

  return apiInstance;
};

/**
 * Get the account API instance
 * @returns Configured AccountApi instance
 */
export const getAccountApi = () => {
  const brevoClient = getBrevoClient();
  const apiInstance = new brevoClient.AccountApi();
  apiInstance.setApiKey(0, BREVO_API_KEY);

  return apiInstance;
};

/**
 * Send a transactional email
 * @param options Email options including subject, content, sender, recipients, etc.
 * @returns Promise with the send result
 */
export const sendTransactionalEmail = async (options: {
  subject: string;
  htmlContent: string;
  sender: { name: string; email: string };
  to: Array<{ email: string; name?: string }>;
  replyTo?: { email: string; name?: string };
  cc?: Array<{ email: string; name?: string }>;
  bcc?: Array<{ email: string; name?: string }>;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  templateId?: number;
  attachments?: Array<{ url: string; name: string; content: string }>;
}) => {
  try {
    const apiInstance = getTransactionalEmailsApi();
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    // Copy all properties from options to sendSmtpEmail
    Object.assign(sendSmtpEmail, options);

    const { body: data } = await apiInstance.sendTransacEmail(sendSmtpEmail);
    logger.debug('Email sent successfully via Brevo', {
      messageId: data.messageId,
    });
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to send email via Brevo', { error });
    return { success: false, error };
  }
};

/**
 * Get contact attributes
 * @returns Promise with contact attributes
 */
export const getContactAttributes = async () => {
  try {
    const apiInstance = getContactsApi();
    const data = await apiInstance.getAttributes();
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to get contact attributes from Brevo', { error });
    return { success: false, error };
  }
};

/**
 * Get account information
 * @returns Promise with account information
 */
export const getAccountInfo = async () => {
  try {
    const apiInstance = getAccountApi();
    const data = await apiInstance.getAccount();
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to get account info from Brevo', { error });
    return { success: false, error };
  }
};

/**
 * Get contacts list
 * @param limit Optional limit for number of contacts to retrieve
 * @param offset Optional offset for pagination
 * @returns Promise with contacts list
 */
export const getContacts = async (limit?: number, offset?: number) => {
  try {
    const apiInstance = getContactsApi();
    const data = await apiInstance.getContacts(limit, offset);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to get contacts from Brevo', { error });
    return { success: false, error };
  }
};

/**
 * Create a new contact
 * @param email Contact email
 * @param attributes Optional contact attributes
 * @param listIds Optional list IDs to add the contact to
 * @returns Promise with create result
 */
export const createContact = async (
  email: string,
  attributes?: Record<string, any>,
  listIds?: number[],
) => {
  try {
    const apiInstance = getContactsApi();
    const createContact = new brevo.CreateContact();

    createContact.email = email;
    if (attributes) createContact.attributes = attributes;
    if (listIds) createContact.listIds = listIds;

    const data = await apiInstance.createContact(createContact);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to create contact in Brevo', { error, email });
    return { success: false, error };
  }
};

/**
 * Update a contact
 * @param email Contact email to update
 * @param attributes Contact attributes to update
 * @param listIds Optional list IDs to add the contact to
 * @returns Promise with update result
 */
export const updateContact = async (
  email: string,
  attributes: Record<string, any>,
  listIds?: number[],
) => {
  try {
    const apiInstance = getContactsApi();
    const updateContact = new brevo.UpdateContact();

    updateContact.attributes = attributes;
    if (listIds) updateContact.listIds = listIds;

    const data = await apiInstance.updateContact(email, updateContact);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to update contact in Brevo', { error, email });
    return { success: false, error };
  }
};

/**
 * Delete a contact
 * @param email Contact email to delete
 * @returns Promise with delete result
 */
export const deleteContact = async (email: string) => {
  try {
    const apiInstance = getContactsApi();
    const data = await apiInstance.deleteContact(email);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to delete contact from Brevo', { error, email });
    return { success: false, error };
  }
};

/**
 * Get all lists
 * @param limit Optional limit for number of lists to retrieve
 * @param offset Optional offset for pagination
 * @returns Promise with lists
 */
export const getLists = async (limit?: number, offset?: number) => {
  try {
    const apiInstance = getContactsApi();
    const data = await apiInstance.getLists(limit, offset);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to get lists from Brevo', { error });
    return { success: false, error };
  }
};

/**
 * Find a list by name
 * @param name List name to find
 * @returns Promise with the list ID if found, null if not found
 */
export const findListByName = async (name: string) => {
  const lowerCaseName = name.toLowerCase();

  // Check cache first
  if (listIdCache.hasOwnProperty(lowerCaseName)) {
    logger.debug('Found list ID in cache', { name, id: listIdCache[lowerCaseName] });
    return { success: true, listId: listIdCache[lowerCaseName] };
  }

  try {
    const apiInstance = getContactsApi();
    const result = await apiInstance.getLists();

    if (result && result.body && result.body.lists && result.body.count) {
      const list = result.body.lists.find((list: any) => list.name.toLowerCase() === lowerCaseName);

      if (list) {
        logger.debug('Found list by name', { name, id: list.id });
        // Cache the found list ID
        listIdCache[lowerCaseName] = list.id;
        return { success: true, listId: list.id };
      }
    }

    logger.debug('List not found by name', { name });
    // Cache null for not found lists to avoid repeated API calls
    listIdCache[lowerCaseName] = null;
    return { success: false, error: new Error('List not found') };
  } catch (error) {
    logger.error('Failed to find list by name', { error, name });
    // Do not cache on error
    return { success: false, error };
  }
};

/**
 * Add a contact to the Minova marketing list
 * @param email Contact email to add to the marketing list
 * @param name Optional contact name
 * @returns Promise with the operation result
 */
export const addContactToMarketingList = async (email: string, name?: string) => {
  try {
    // Get or create the marketing list
    const listResult = await findListByName(MARKETING_LIST_NAME);

    if (!listResult.success) {
      return listResult; // Return the error
    }

    const listId = listResult.listId;
    if (!listId) {
      logger.debug('Marketing list not found, nothing to add to', {
        listName: MARKETING_LIST_NAME,
      });
      return { success: false, error: 'Marketing list not found' };
    }

    // First check if contact exists
    const apiInstance = getContactsApi();
    let contactExists = false;

    try {
      // Try to get the contact info - if it succeeds, the contact exists
      await apiInstance.getContactInfo(email);
      contactExists = true;
    } catch (_) {
      // Contact doesn't exist, we'll create it
      contactExists = false;
    }

    if (contactExists) {
      // Update existing contact to add to marketing list
      const updateContact = new brevo.UpdateContact();
      updateContact.listIds = [listId];
      if (name) {
        updateContact.attributes = { FIRSTNAME: name };
      }

      await apiInstance.updateContact(email, updateContact);
      logger.debug('Added existing contact to marketing list', {
        email,
        listName: MARKETING_LIST_NAME,
      });
    } else {
      // Create new contact and add to marketing list
      const createContact = new brevo.CreateContact();
      createContact.email = email;
      createContact.listIds = [listId];
      if (name) {
        createContact.attributes = { FIRSTNAME: name };
      }

      await apiInstance.createContact(createContact);
      logger.debug('Created new contact and added to marketing list', {
        email,
        listName: MARKETING_LIST_NAME,
      });
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to add contact to marketing list', { error, email });
    return { success: false, error };
  }
};

/**
 * Remove a contact from the Minova marketing list
 * @param email Contact email to remove from the marketing list
 * @returns Promise with the operation result
 */
export const removeContactFromMarketingList = async (email: string) => {
  try {
    // Get the marketing list
    const listResult = await findListByName(MARKETING_LIST_NAME);

    if (!listResult.success) {
      return listResult; // Return the error
    }

    // If list doesn't exist, nothing to remove from
    if (!listResult.listId) {
      logger.debug('Marketing list not found, nothing to remove from', {
        listName: MARKETING_LIST_NAME,
      });
      return { success: true };
    }

    const listId = listResult.listId;
    const apiInstance = getContactsApi();

    // First check if contact exists
    try {
      await apiInstance.getContactInfo(email);

      // Remove contact from list
      const removeContactFromList = new brevo.RemoveContactFromList();
      removeContactFromList.emails = [email];
      const data = await apiInstance.removeContactFromList(listId, removeContactFromList);

      logger.debug('Removed contact from marketing list', {
        email,
        listName: MARKETING_LIST_NAME,
      });
      return { success: true, data };
    } catch (_) {
      // Contact doesn't exist, nothing to do
      logger.debug('Contact not found, nothing to remove from marketing list', {
        email,
      });
      return { success: true };
    }
  } catch (error) {
    logger.error('Failed to remove contact from marketing list', {
      error,
      email,
    });
    return { success: false, error };
  }
};

/**
 * Update contact marketing preferences
 * @param email Contact email
 * @param marketingEmails Whether the contact has opted in to marketing emails
 * @param name Optional contact name
 * @returns Promise with the operation result
 */
export const updateContactMarketingPreferences = async (
  email: string,
  marketingEmails: boolean,
  name?: string,
) => {
  try {
    if (marketingEmails) {
      return await addContactToMarketingList(email, name);
    } else {
      return await removeContactFromMarketingList(email);
    }
  } catch (error) {
    logger.error('Failed to update contact marketing preferences', {
      error,
      email,
    });
    return { success: false, error };
  }
};
