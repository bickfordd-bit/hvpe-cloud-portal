const body = JSON.stringify({
	ok: false,
	status: 501,
	error: 'This endpoint is not available on native builds.'
});

export async function GET(_req: Request) {
	return new Response(body, {
		status: 501,
		headers: { 'Content-Type': 'application/json' }
	});
}

export async function POST(_req: Request) {
	return new Response(body, {
		status: 501,
		headers: { 'Content-Type': 'application/json' }
	});
}
