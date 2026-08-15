import { auth } from '@/lib/auth';

const rawHandler = auth.handler();

type NextCtx = { params: Promise<{ all: string[] }> };

const remap = (fn: (req: Request, ctx: { params: Promise<{ path: string[] }> }) => Promise<Response>) => {
  return async (req: Request, ctx: NextCtx) => {
    const { all } = await ctx.params;
    const fakeCtx = {
      params: Promise.resolve({ path: all ?? [] }) as Promise<{ path: string[] }>,
    };
    return fn(req, fakeCtx);
  };
};

export const GET = remap(rawHandler.GET);
export const POST = remap(rawHandler.POST);
export const PUT = remap(rawHandler.PUT);
export const PATCH = remap(rawHandler.PATCH);
export const DELETE = remap(rawHandler.DELETE);
