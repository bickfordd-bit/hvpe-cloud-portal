import { NextResponse } from 'next/server';

const SAM_API_KEY = process.env.OPTR_SAM_API_KEY;

type SamRecord = {
  noticeId?: string;
  title?: string;
  agency?: string;
  responseDate?: string;
};

type OptrListing = {
  id: string;
  title: string;
  agency: string;
  responseDate: string;
  readinessScore: number;
  status: string;
};

export async function GET() {
  const fallback = NextResponse.json({
    results: placeholderResults(),
  });

  if (!SAM_API_KEY) {
    return fallback;
  }

  try {
    const url = new URL('https://api.sam.gov/prod/opportunities/v2/search');
    url.searchParams.set('limit', '10');
    url.searchParams.set('api_key', SAM_API_KEY);
    url.searchParams.set('ptype', 'o'); // open

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      console.error('SAM.gov top10 error:', await res.text());
      return fallback;
    }

    const data = (await res.json()) as { opportunitiesData?: { opportunities?: SamRecord[] } };
    const records = data.opportunitiesData?.opportunities || [];

    const mapped: OptrListing[] = records.slice(0, 10).map((rec, idx) => {
      const readinessScore = score(rec);
      return {
        id: rec.noticeId || String(idx + 1),
        title: rec.title || 'Untitled Opportunity',
        agency: rec.agency || 'Unknown Agency',
        responseDate: rec.responseDate || 'TBD',
        readinessScore,
        status: statusFromScore(readinessScore),
      };
    });

    if (!mapped.length) {
      return fallback;
    }

    return NextResponse.json({ results: mapped });
  } catch (err: unknown) {
    console.error('SAM.gov fetch failed:', err);
    return fallback;
  }
}

function score(rec: SamRecord): number {
  let s = 50;
  const title = (rec.title || '').toLowerCase();
  const agency = (rec.agency || '').toLowerCase();

  if (title.includes('ai') || title.includes('ml')) s += 10;
  if (title.includes('cyber') || title.includes('security')) s += 8;
  if (title.includes('cloud')) s += 5;
  if (title.includes('maintenance') || title.includes('logistics')) s += 5;
  if (agency.includes('air force')) s += 4;
  if (agency.includes('army') || agency.includes('peo')) s += 3;

  // nudge for closer deadlines (sooner = higher priority)
  const days = daysUntil(rec.responseDate);
  if (days !== null) {
    if (days <= 7) s += 8;
    else if (days <= 14) s += 6;
    else if (days <= 30) s += 3;
  }

  return Math.max(30, Math.min(97, s));
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function statusFromScore(score: number): string {
  if (score >= 80) return 'READY';
  if (score >= 65) return 'EVALUATE';
  return 'REVIEW';
}

function placeholderResults(): OptrListing[] {
  return [
    {
      id: '1',
      title: 'Advanced Battle Management System Support (USAF)',
      agency: 'Department of the Air Force',
      responseDate: '2026-01-14',
      readinessScore: 82,
      status: 'READY',
    },
    {
      id: '2',
      title: 'AI/ML Transformation and Mission Automation',
      agency: 'Department of Defense',
      responseDate: '2026-02-01',
      readinessScore: 80,
      status: 'READY',
    },
    {
      id: '3',
      title: 'Cyber Defense Analytics Platform Modernization',
      agency: 'DISA',
      responseDate: '2026-01-10',
      readinessScore: 76,
      status: 'READY',
    },
    {
      id: '4',
      title: 'Predictive Maintenance for Aviation Fleet',
      agency: 'USAF',
      responseDate: '2026-01-30',
      readinessScore: 74,
      status: 'EVALUATE',
    },
    {
      id: '5',
      title: 'Enterprise Data and Analytics Support Services',
      agency: 'US Army PEO EIS',
      responseDate: '2026-02-01',
      readinessScore: 70,
      status: 'EVALUATE',
    },
    {
      id: '6',
      title: 'Next-Gen Logistics Optimization',
      agency: 'USTRANSCOM',
      responseDate: '2026-01-18',
      readinessScore: 68,
      status: 'EVALUATE',
    },
    {
      id: '7',
      title: 'Command and Control Modernization',
      agency: 'USN',
      responseDate: '2026-02-12',
      readinessScore: 66,
      status: 'REVIEW',
    },
    {
      id: '8',
      title: 'Secure Cloud Migration for Legacy Systems',
      agency: 'USMC',
      responseDate: '2026-01-25',
      readinessScore: 64,
      status: 'REVIEW',
    },
    {
      id: '9',
      title: 'Integrated Training Simulation Environment',
      agency: 'USSF',
      responseDate: '2026-02-05',
      readinessScore: 62,
      status: 'REVIEW',
    },
    {
      id: '10',
      title: 'AI-Driven Threat Detection and Response',
      agency: 'NSA',
      responseDate: '2026-01-28',
      readinessScore: 78,
      status: 'READY',
    },
  ];
}
