import { supabase } from '$lib/supabaseClient';
import type { Database } from '$lib/database.types';

type CodexSyncStatus = Database['public']['Tables']['codex_sync_status']['Row'];

/**
 * Fetches the current Codex sync status
 * @returns Promise resolving to the sync status or null
 */
export async function getSyncStatus(): Promise<CodexSyncStatus | null> {
	try {
		const { data, error } = await supabase
			.from('codex_sync_status')
			.select('*')
			.single();

		if (error) {
			console.error('Error fetching sync status:', error);
			return null;
		}

		return data;
	} catch (err) {
		console.error('Unexpected error fetching sync status:', err);
		return null;
	}
}

/**
 * Triggers a manual sync of Codex data
 * @returns Promise resolving to success status
 */
/*
export async function triggerSync(): Promise<boolean> {
	try {
		// Call the Edge Function to trigger sync
		const { data, error } = await supabase.functions.invoke('sync-codex-data', {
			method: 'POST'
		});

		if (error) {
			console.error('Error triggering sync:', error);
			return false;
		}

		return true;
	} catch (err) {
		console.error('Unexpected error triggering sync:', err);
		return false;
	}
}
*/

/**
 * Subscribes to real-time updates of the sync status
 * @param callback Function to call when sync status changes
 * @returns Unsubscribe function
 */
/*
export function subscribeSyncStatus(
	callback: (status: CodexSyncStatus | null) => void
): () => void {
	const channel = supabase
		.channel('codex_sync_status_changes')
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'codex_sync_status'
			},
			async (payload) => {
				// Fetch the latest status after any change
				const status = await getSyncStatus();
				callback(status);
			}
		)
		.subscribe();

	// Return unsubscribe function
	return () => {
		supabase.removeChannel(channel);
	};
}
*/

/**
 * Gets the last successful sync timestamp
 * @returns Promise resolving to the timestamp or null
 */
/*
export async function getLastSyncTime(): Promise<string | null> {
	const status = await getSyncStatus();
	return status?.last_successful_sync || null;
}
*/

/**
 * Checks if a sync is currently in progress
 * @returns Promise resolving to boolean indicating sync status
 */
/*
export async function isSyncInProgress(): Promise<boolean> {
	const status = await getSyncStatus();
	return status?.is_syncing || false;
}
*/
