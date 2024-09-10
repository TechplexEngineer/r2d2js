import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
    const config = await locals.db.read();

    return {
        hardware: config.hardware || []
    };
}) satisfies PageServerLoad;