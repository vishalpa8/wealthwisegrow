import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const title = searchParams.get('title') || 'WealthWiseGrow';
    const description = searchParams.get('description') || 'Comprehensive Financial Calculators';

    return new ImageResponse(
      (
        <div
          tw="flex flex-col items-center justify-center w-full h-full text-white bg-slate-900"
          style={{
            backgroundImage: 'radial-gradient(circle at 25px 25px, #334155 2%, transparent 0%), radial-gradient(circle at 75px 75px, #334155 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          <div tw="flex flex-col items-center justify-center p-10 text-center">
            <h1 tw="text-7xl font-extrabold mb-5 text-slate-50 tracking-tight">
              {title}
            </h1>
            <p tw="text-4xl text-slate-300 max-w-4xl m-0 leading-tight">
              {description}
            </p>
          </div>
          <div tw="absolute bottom-10 flex items-center">
            <div tw="text-3xl font-bold text-sky-400 flex items-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              WealthWiseGrow.com
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error(`Failed to generate OG image: ${(e as Error).message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
