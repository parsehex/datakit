import { type ParsedCSVData } from '@/db';

export async function parseCSV(
	csvString: string
): Promise<Omit<ParsedCSVData, 'id' | 'fileId'>> {
	const Papa = await import('papaparse');

	const result = Papa.parse(csvString, {
		header: true,
		skipEmptyLines: true,
	});

	if (result.errors.length > 0) {
		console.error('CSV Parsing Errors:', result.errors);
		throw new Error('Failed to parse CSV data.');
	}

	const headers = result.meta.fields || [];
	const rows = result.data.map((row) =>
		Object.values(row as object).map(String)
	);

	console.log({ headers, rows });
	return { headers, rows };
}
