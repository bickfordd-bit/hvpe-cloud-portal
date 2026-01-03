'use client';

import { type Dispatch, type FormEvent, type SetStateAction, useMemo, useState } from 'react';

type SamOpportunity = {
  noticeId?: string;
  title?: string;
  agency?: string;
  postedDate?: string;
  type?: string;
  naics?: string[];
  psc?: string[];
  url?: string;
  [key: string]: unknown;
};

type Filters = {
  q: string;
  naics: string;
  psc: string;
  type: string;
  setAsideCode: string;
  agencyCode: string;
  postedFrom: string;
  postedTo: string;
  limit: string;
};

const defaultFilters: Filters = {
  q: 'AI OR cloud',
  naics: '541512',
  psc: '',
  type: 'Solicitation,Presolicitation',
  setAsideCode: '',
  agencyCode: 'DOD',
  postedFrom: '',
  postedTo: '',
  limit: '15',
};

export default function SamSearchClient() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [rows, setRows] = useState<SamOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [total, setTotal] = useState<number | undefined>();

  const paramsToQuery = useMemo(() => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return query.toString();
  }, [filters]);

  async function search(ev?: FormEvent<HTMLFormElement>) {
    ev?.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch(`/api/sam/search?${paramsToQuery}`);
      const body = await res.json();
      if (!res.ok || body?.success === false) {
        throw new Error(body?.error ?? body?.message ?? `${res.status} ${res.statusText}`);
      }
      const data = body?.data ?? body;
      const opportunities: SamOpportunity[] =
        data?.opportunities || data?.data?.opportunities || [];
      setRows(opportunities);
      setTotal(data?.totalRecords);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setRows([]);
      setTotal(undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase text-neutral-500">OPTR · Derek Instance</p>
          <h1 className="text-2xl font-semibold">SAM.gov Opportunity Search</h1>
          <p className="text-sm text-neutral-400">
            Live proxy to SAM.gov. Provide filters, run search, and click through to notices.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-neutral-700 px-3 py-1 text-sm text-neutral-200 hover:border-neutral-500"
          onClick={() => setFilters(defaultFilters)}
        >
          Reset filters
        </button>
      </header>

      <form
        onSubmit={search}
        className="mb-6 grid gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/50 p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Input
          label="Query"
          name="q"
          value={filters.q}
          onChange={setFilters}
          placeholder="AI OR cloud"
        />
        <Input
          label="NAICS"
          name="naics"
          value={filters.naics}
          onChange={setFilters}
          placeholder="541512"
        />
        <Input
          label="PSC"
          name="psc"
          value={filters.psc}
          onChange={setFilters}
          placeholder="DA10"
        />
        <Input
          label="Notice Type"
          name="type"
          value={filters.type}
          onChange={setFilters}
          placeholder="Solicitation,Presolicitation"
        />
        <Input
          label="Set-Aside"
          name="setAsideCode"
          value={filters.setAsideCode}
          onChange={setFilters}
          placeholder="SB,8A,WOSB"
        />
        <Input
          label="Agency Code"
          name="agencyCode"
          value={filters.agencyCode}
          onChange={setFilters}
          placeholder="DOD,NASA"
        />
        <Input
          label="Posted From"
          name="postedFrom"
          value={filters.postedFrom}
          onChange={setFilters}
          placeholder="2024-12-01"
        />
        <Input
          label="Posted To"
          name="postedTo"
          value={filters.postedTo}
          onChange={setFilters}
          placeholder="2025-01-31"
        />
        <Input
          label="Limit"
          name="limit"
          value={filters.limit}
          onChange={setFilters}
          placeholder="15"
        />

        <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Searching…' : 'Run search'}
          </button>
          <span className="text-xs text-neutral-500">
            Requires SAM_API_KEY on the server. Results are proxied via /api/sam/search.
          </span>
          {error && <span className="text-xs text-red-400">{error}</span>}
          {typeof total === 'number' && (
            <span className="text-xs text-neutral-400">Total records: {total}</span>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {rows.map((opp) => (
          <article
            key={opp.noticeId || opp.title}
            className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white">{opp.title || 'Untitled'}</h2>
              <div className="text-xs text-neutral-500">
                {opp.postedDate ? `Posted: ${opp.postedDate}` : ''}
              </div>
            </div>
            <p className="text-sm text-neutral-400">{opp.agency}</p>
            <p className="text-xs text-neutral-500">{opp.type}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-400">
              {opp.naics && opp.naics.length > 0 && <span>NAICS: {opp.naics.join(', ')}</span>}
              {opp.psc && opp.psc.length > 0 && <span>PSC: {opp.psc.join(', ')}</span>}
            </div>
            {opp.url && (
              <a
                href={opp.url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-sm text-blue-300 hover:text-blue-200"
              >
                View notice →
              </a>
            )}
          </article>
        ))}

        {!loading && rows.length === 0 && !error && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm text-neutral-400">
            No results yet. Adjust filters and run a search.
          </div>
        )}
      </div>
    </div>
  );
}

type InputProps = {
  label: string;
  name: keyof Filters;
  value: string;
  placeholder?: string;
  onChange: Dispatch<SetStateAction<Filters>>;
};

function Input({ label, name, value, placeholder, onChange }: InputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-neutral-200">
      <span className="text-xs uppercase tracking-wide text-neutral-500">{label}</span>
      <input
        className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-neutral-500"
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange((prev) => ({ ...prev, [name]: e.target.value }))}
      />
    </label>
  );
}
