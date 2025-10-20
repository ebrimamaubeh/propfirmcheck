'use server';
/**
 * @fileOverview A flow to synchronize prop firm data from a JSON file to Firestore.
 *
 * This flow reads data from `src/lib/prop-firms-data.json`, compares it with the
 * data currently in the 'prop_firms' Firestore collection, and then performs
 * additions, updates, or deletions as necessary to make Firestore match the JSON file.
 *
 * - updatePropFirms - The main function that triggers the synchronization flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/admin/firestore';

// Using the existing data source for now. This could be replaced with an API call.
import propFirmsData from '@/lib/prop-firms-data.json';
import { getFirebaseAdminApp } from '@/ai/firebase';
import type { PropFirm } from '@/lib/types';

// No input is needed for this flow as it reads from a static file.
const UpdatePropFirmsInputSchema = z.null();

// The output will be a string summarizing the actions taken.
const UpdatePropFirmsOutputSchema = z.string();

export async function updatePropFirms(): Promise<string> {
  return updatePropFirmsFlow(null);
}

const updatePropFirmsFlow = ai.defineFlow(
  {
    name: 'updatePropFirmsFlow',
    inputSchema: UpdatePropFirmsInputSchema,
    outputSchema: UpdatePropFirmsOutputSchema,
  },
  async () => {
    const adminApp = getFirebaseAdminApp();
    const db = getFirestore(adminApp);
    const firmsCollection = collection(db, 'prop_firms');

    // 1. Get existing firms from Firestore
    const existingFirmsSnapshot = await getDocs(firmsCollection);
    const existingFirms = new Map<string, PropFirm>();
    existingFirmsSnapshot.forEach(doc => {
      existingFirms.set(doc.id, { id: doc.id, ...doc.data() } as PropFirm);
    });

    // 2. Get firms from the JSON data source
    const sourceFirms = new Map<string, PropFirm>();
    propFirmsData.forEach((firm: any) => {
        // Ensure the firm has an ID, which is crucial for mapping.
        if(firm.id) {
            sourceFirms.set(firm.id, firm as PropFirm);
        }
    });
    
    // 3. Prepare a batch write for efficiency
    const batch = writeBatch(db);
    let firmsAdded = 0;
    let firmsUpdated = 0;
    let firmsDeleted = 0;

    // 4. Determine which firms to add or update
    for (const [id, sourceFirm] of sourceFirms.entries()) {
      const existingFirm = existingFirms.get(id);

      if (!existingFirm) {
        // Firm exists in source but not in DB -> Add it
        const newFirmRef = doc(firmsCollection, id);
        batch.set(newFirmRef, sourceFirm);
        firmsAdded++;
      } else {
        // Firm exists in both -> Check if an update is needed
        // This is a simple JSON string comparison. For more complex objects,
        // you might need a deep comparison function.
        if (JSON.stringify(existingFirm) !== JSON.stringify(sourceFirm)) {
          const firmRef = doc(firmsCollection, id);
          batch.set(firmRef, sourceFirm, { merge: true }); // Use set with merge to be safe
          firmsUpdated++;
        }
      }
    }

    // 5. Determine which firms to delete
    for (const [id, existingFirm] of existingFirms.entries()) {
      if (!sourceFirms.has(id)) {
        // Firm exists in DB but not in source -> Delete it
        const firmRef = doc(firmsCollection, id);
        batch.delete(firmRef);
        firmsDeleted++;
      }
    }

    // 6. Commit the batch if there are changes
    if (firmsAdded > 0 || firmsUpdated > 0 || firmsDeleted > 0) {
      await batch.commit();
      return `Synchronization complete. Firms Added: ${firmsAdded}, Updated: ${firmsUpdated}, Deleted: ${firmsDeleted}.`;
    }

    return 'No changes detected. Database is already in sync with the data source.';
  }
);
