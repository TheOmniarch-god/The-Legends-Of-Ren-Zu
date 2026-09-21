import { auth } from "@/server/services";

export async function GET(request: Request) {
	return auth.handler(request);
}

export async function POST(request: Request) {
	return auth.handler(request);
}
