import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import {
  updateContactMarketingPreferences,
  getContactsApi,
  findListByName,
  deleteContact,
} from './brevo';
import brevo from '@getbrevo/brevo';

vi.mock('./logger', () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

// NOTE: These are integration tests that call the actual Brevo API.
// Ensure BREVO_API_KEY and BREVO_MARKETING_LIST_NAME are set in your environment.
// A dedicated test contact email should be used to avoid affecting real contacts.
const TEST_CONTACT_EMAIL = process.env.BREVO_TEST_CONTACT_EMAIL || 'test.contact@example.com';
const MARKETING_LIST_NAME = process.env.BREVO_MARKETING_LIST_NAME || 'Minova-test-list';

describe('Brevo Integration Tests', () => {
  let contactsApi: brevo.ContactsApi;
  let marketingListId: number | null = null;

  beforeAll(async () => {
    // Ensure API key is set
    if (!process.env.BREVO_API_KEY) {
      throw new Error(
        'BREVO_API_KEY environment variable is not set. Cannot run integration tests.',
      );
    }
    if (!process.env.BREVO_MARKETING_LIST_NAME) {
      throw new Error(
        'BREVO_MARKETING_LIST_NAME environment variable is not set. Cannot run integration tests.',
      );
    }

    contactsApi = getContactsApi();

    // Find or create the marketing list
    const listResult = await findListByName(MARKETING_LIST_NAME);
    if (!listResult.success || !listResult.listId) {
      // Attempt to create if not found, though findListByName should handle this
      throw new Error(`Could not find or create marketing list: ${MARKETING_LIST_NAME}`);
    }
    marketingListId = listResult.listId;
  });

  afterEach(async () => {
    // Clean up the test contact after each test
    try {
      await deleteContact(TEST_CONTACT_EMAIL);
    } catch (error) {
      // Ignore if contact doesn't exist
    }
  });

  describe('updateContactMarketingPreferences', () => {
    it('should add a contact to the marketing list when marketingEmails is true', async () => {
      // Ensure contact does not exist initially
      try {
        await contactsApi.getContactInfo(TEST_CONTACT_EMAIL);
        // If it exists, delete it
        await deleteContact(TEST_CONTACT_EMAIL);
      } catch (_) {
        // Contact does not exist, which is expected
      }

      const result = await updateContactMarketingPreferences(TEST_CONTACT_EMAIL, true, 'Test User');

      expect(result.success).toBe(true);

      // Verify the contact was created and added to the list
      const contactInfo = await contactsApi.getContactInfo(TEST_CONTACT_EMAIL);
      expect(contactInfo).toBeDefined();
      expect(contactInfo.body.listIds).toContain(marketingListId);
      // Brevo API returns attributes as an object with keys in uppercase
      expect((contactInfo.body.attributes as any)?.FIRSTNAME).toBe('Test User');
    });

    it('should remove a contact from the marketing list when marketingEmails is false', async () => {
      // Ensure contact exists and is in the marketing list initially
      await updateContactMarketingPreferences(TEST_CONTACT_EMAIL, true, 'Test User');
      const initialContactInfo = await contactsApi.getContactInfo(TEST_CONTACT_EMAIL);
      expect(initialContactInfo.body.listIds).toContain(marketingListId);

      const result = await updateContactMarketingPreferences(TEST_CONTACT_EMAIL, false);

      expect(result.success).toBe(true);

      // Verify the contact was removed from the list
      const contactInfo = await contactsApi.getContactInfo(TEST_CONTACT_EMAIL);
      expect(contactInfo).toBeDefined();
      expect(contactInfo.body.listIds).not.toContain(marketingListId);
    });

    it('should handle opting out for a contact that does not exist', async () => {
      // Ensure contact does not exist initially
      try {
        await contactsApi.getContactInfo(TEST_CONTACT_EMAIL);
        // If it exists, delete it
        await deleteContact(TEST_CONTACT_EMAIL);
      } catch (_) {
        // Contact does not exist, which is expected
      }

      const result = await updateContactMarketingPreferences(TEST_CONTACT_EMAIL, false);

      // Should succeed without error, as there's nothing to remove
      expect(result.success).toBe(true);

      // Verify the contact was not created
      try {
        await contactsApi.getContactInfo(TEST_CONTACT_EMAIL);
        // If this succeeds, the test fails as the contact should not exist
        expect(true).toBe(false);
      } catch (_) {
        // Contact does not exist, which is expected
      }
    });

    it('should handle opting in for a contact that already exists but is not on the list', async () => {
      // Ensure contact exists but is not on the marketing list
      try {
        await contactsApi.getContactInfo(TEST_CONTACT_EMAIL);
        await deleteContact(TEST_CONTACT_EMAIL); // Clean up first
      } catch (_) {
        // Ignore if contact doesn't exist
      }
      // Create contact without adding to the marketing list
      const createContact = new brevo.CreateContact();
      createContact.email = TEST_CONTACT_EMAIL;
      createContact.attributes = { FIRSTNAME: 'Existing User' };
      await contactsApi.createContact(createContact);

      const initialContactInfo = await contactsApi.getContactInfo(TEST_CONTACT_EMAIL);
      expect(initialContactInfo.body.listIds).not.toContain(marketingListId);

      const result = await updateContactMarketingPreferences(
        TEST_CONTACT_EMAIL,
        true,
        'Updated User',
      );

      expect(result.success).toBe(true);

      // Verify the contact was updated and added to the list
      const contactInfo = await contactsApi.getContactInfo(TEST_CONTACT_EMAIL);
      expect(contactInfo).toBeDefined();
      expect(contactInfo.body.listIds).toContain(marketingListId);
      // Note: Brevo updateContact merges attributes, it doesn't replace them entirely
      expect((contactInfo.body.attributes as any)?.FIRSTNAME).toBe('Updated User');
    });
  });
});
