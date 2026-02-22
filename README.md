> This website was generated with [PageAI](https://pageai.pro).
>
> 1-shot production-ready websites with a design system and AI-powered content generation.
> Get started on **[pageai.pro](https://pageai.pro)**.

Vibe Coding Starter
===================

This starter was created as part of the [Vibe Coding Starter](https://pageai.pro/vibe-coding-starter-guide) tutorial.

See the full video here:

[![Image](https://pageai.pro/static/images/blog/vibe-coding-starter-guide.jpg)](https://www.youtube.com/watch?v=p_q7-iW606U)

- [Installation](#installation)
- [Development](#development)
- [Build](#build)

## Installation

```bash
npm i
```

## Development

First, run the development server:

```bash
npm run dev
```

## Build

To build the site for production, run the following command:

```bash
npm run build
```

## MongoDB setup

1. Install dependencies:

```bash
npm i
```

2. Create an environment file and set your database URL:

```bash
cp .env.example .env.local
```

Set `MONGODB_URI` in `.env.local`.

3. Use the database connector and models:

- Connector: `lib/db/mongoose.ts`
- Models: `lib/models/User.ts`, `lib/models/Location.ts`, `lib/models/Review.ts`

Example usage in an API route:

```ts
import { connectToDatabase } from '@/lib/db/mongoose';
import { LocationModel } from '@/lib/models/Location';

export async function GET() {
	await connectToDatabase();
	const locations = await LocationModel.find({ isPublished: true }).lean();
	return Response.json({ data: locations });
}
```

