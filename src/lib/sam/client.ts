import { logger } from '@/lib/logger';

const SAM_BASE = 'https://api.sam.gov/prod/opportunities/v2/search';

export type SamSearchParams = {
  q?: string;
  naics?: string;
  psc?: string;
  type?: string;
  setAsideCode?: string;
  agencyCode?: string;
  postedFrom?: string;
  postedTo?: string;
  limit?: number;
  start?: number;
};

export type SamOpportunity = {
  noticeId: string;
  title?: string;
  agency?: string;
  postedDate?: string;
  type?: string;
  naics?: string[];
  psc?: string[];
  url?: string;
  [key: string]: unknown;
};

export type SamSearchResponse = {
  opportunities?: SamOpportunity[];
  totalRecords?: number;
  [key: string]: unknown;
};

export async function searchSamOpportunities(params: SamSearchParams): Promise<SamSearchResponse> {
  const apiKey = process.env.SAM_API_KEY;
  if (!apiKey) {
    throw new Error('SAM_API_KEY is required to call SAM.gov API');
  }

  const query = new URLSearchParams();
  query.set('api_key', apiKey);
  if (params.q) query.set('q', params.q);
  if (params.naics) query.set('naics', params.naics);
  if (params.psc) query.set('psc', params.psc);
  if (params.type) query.set('type', params.type);
  if (params.setAsideCode) query.set('setAsideCode', params.setAsideCode);
  if (params.agencyCode) query.set('agencyCode', params.agencyCode);
  if (params.postedFrom) query.set('postedFrom', params.postedFrom);
  if (params.postedTo) query.set('postedTo', params.postedTo);
  query.set('limit', String(params.limit ?? 10));
  query.set('start', String(params.start ?? 0));
  query.set('sort', params.postedFrom || params.postedTo ? '-postedDate' : '-responseDate');

  const url = `${SAM_BASE}?${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`);
  }

  const data = (await res.json()) as SamSearchResponse;
  logger.info('SAM search completed', {
    q: params.q,
    naics: params.naics,
    psc: params.psc,
    type: params.type,
    setAsideCode: params.setAsideCode,
    agencyCode: params.agencyCode,
    limit: params.limit ?? 10,
    start: params.start ?? 0,
    total: data.totalRecords,
  });
  return data;
}
