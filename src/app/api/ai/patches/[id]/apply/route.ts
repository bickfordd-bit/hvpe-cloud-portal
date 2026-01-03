import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patchLog = await prisma.aIPatchLog.findUnique({ where: { id } });
  if (!patchLog) return NextResponse.json({ error: 'not found' }, { status: 404 });

  // require approval
  if (!patchLog.approvedAt)
    return NextResponse.json({ error: 'patch not approved' }, { status: 403 });

  // require admin secret to apply
  const secret = process.env.ADMIN_DASH_TOKEN || process.env.ADMIN_APPLY_SECRET;
  if (secret) {
    const h = req.headers.get('x-admin-secret');
    if (h !== secret) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const [{ default: fs }, { default: path }, { execSync }] = await Promise.all([
    import('fs'),
    import('path'),
    import('child_process'),
  ]);

  const tmp = path.join(process.cwd(), `tmp_ai_patch_${id}.diff`);
  fs.writeFileSync(tmp, patchLog.patch, 'utf-8');

  const branch = `ai/review-${Date.now()}`;
  try {
    execSync(`git checkout -b ${branch}`, { stdio: 'inherit' });
    execSync(`git apply --index ${tmp}`, { stdio: 'inherit' });
    execSync(`git add -A`, { stdio: 'inherit' });
    execSync(
      `git commit -m "AI approved: ${patchLog.instruction.slice(0, 120).replace(/\"/g, "'")}"`,
      { stdio: 'inherit' }
    );
    try {
      execSync(`git push origin HEAD:${branch}`, { stdio: 'inherit' });
    } catch (e: unknown) {}

    let prUrl: string | null = null;
    try {
      if (process.env.GITHUB_TOKEN) {
        const title = `AI: ${patchLog.instruction.slice(0, 80)}`;
        const bodyMsg = `Approved AI patch: ${patchLog.instruction}`;
        const out = execSync(
          `gh pr create --title "${title.replace(/"/g, "'")}" --body "${bodyMsg.replace(/"/g, "'")}" --head ${branch}`,
          { encoding: 'utf-8' }
        );
        prUrl = out;
      }
    } catch (e: unknown) {}

    await prisma.aIPatchLog.update({
      where: { id },
      data: { applied: true, branch, prUrl: prUrl || undefined },
    });
    return NextResponse.json({ applied: true, branch, prUrl });
  } catch (err: unknown) {
    try {
      execSync(`git checkout -`, { stdio: 'ignore' });
    } catch (e: unknown) {}
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch (e: unknown) {}
  }
}
