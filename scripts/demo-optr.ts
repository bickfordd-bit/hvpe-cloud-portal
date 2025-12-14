#!/usr/bin/env tsx
/**
 * OPTR Live Demo - Shows weighted scoring in action
 * Run: npx tsx scripts/demo-optr.ts
 */

import { runOptr } from '../src/lib/optr/processor';
import type { Opportunity, Requirement } from '../src/lib/optr/types';

console.log('\n🎯 OPTR Live Demo - Department of Defense Contract\n');
console.log('═'.repeat(80));

// Sample DoD Opportunity
const opportunity: Opportunity = {
  id: 'demo-001',
  source: 'SAM.gov',
  title: 'Cyber Security Operations Center (CSOC) Modernization',
  agency: 'Department of Defense',
  deadline_iso: '2025-03-15T23:59:59Z',
  links: [
    'https://www.example.com/rfi-cyber-security',
    'https://www.example.com/technical-specs'
  ],
  documents: [
    {
      id: 'doc-001',
      filename: 'Statement of Work.pdf',
      type: 'solicitation',
      sha256: 'abc123...'
    }
  ]
};

// Requirements with varying priorities (1-5 scale)
const requirements: Requirement[] = [
  {
    id: 'REQ-001',
    kind: 'shall',
    priority: 5, // Critical
    text: 'The system shall provide 24/7 security monitoring and threat detection capabilities with real-time alerting',
    source: 'SOW Section 3.1'
  },
  {
    id: 'REQ-002',
    kind: 'shall',
    priority: 5, // Critical
    text: 'The solution shall comply with NIST 800-53 security controls and FedRAMP High authorization',
    source: 'SOW Section 2.4'
  },
  {
    id: 'REQ-003',
    kind: 'shall',
    priority: 4, // High
    text: 'The system shall integrate with existing SIEM platforms including Splunk and QRadar',
    source: 'SOW Section 3.2'
  },
  {
    id: 'REQ-004',
    kind: 'should',
    priority: 3, // Medium
    text: 'The solution should provide automated incident response playbooks and orchestration',
    source: 'SOW Section 4.1'
  },
  {
    id: 'REQ-005',
    kind: 'should',
    priority: 2, // Low
    text: 'The system should include AI-powered threat intelligence and predictive analytics',
    source: 'SOW Section 4.3'
  },
  {
    id: 'REQ-006',
    kind: 'shall',
    priority: 4, // High
    text: 'The contractor shall maintain active Secret facility clearance and employ cleared personnel',
    source: 'SOW Section 1.2'
  }
];

console.log(`\n📋 Opportunity Details:`);
console.log(`   Title: ${opportunity.title}`);
console.log(`   Agency: ${opportunity.agency} (1.3x multiplier)`);
console.log(`   Source: ${opportunity.source}`);
console.log(`   Deadline: ${opportunity.deadline_iso}`);
console.log(`   Documents: ${opportunity.links?.length || 0} links, ${opportunity.documents?.length || 0} attachments`);

console.log(`\n📝 Requirements (${requirements.length} total):`);
requirements.forEach(req => {
  const priority = '★'.repeat(req.priority) + '☆'.repeat(5 - req.priority);
  console.log(`   ${req.id}: [${req.kind.toUpperCase()}] ${priority}`);
  console.log(`      ${req.text.slice(0, 80)}...`);
});

console.log('\n\n⚙️  Running OPTR Processor...\n');

async function runDemo() {
  try {
    const startTime = Date.now();
    
    // Run OPTR analysis
    const result = await runOptr(opportunity, requirements);
    
    const duration = Date.now() - startTime;
    
    console.log('═'.repeat(80));
    console.log('\n✅ OPTR Analysis Complete!\n');
    
    // Display results
    console.log('📊 RESULTS:');
    console.log(`   Phase: ${result.state.phase}`);
    console.log(`   Coverage: ${(result.state.coverage * 100).toFixed(1)}% (simple count)`);
    console.log(`   Win Probability: ${(result.state.win_prob * 100).toFixed(1)}%`);
    console.log(`   Expected Contract Value: $${result.state.ecv.toLocaleString()}`);
    console.log(`   Blocked: ${result.state.blocked ? 'Yes' : 'No'}`);
    
    console.log('\n🔍 Requirement Traces:');
    result.traces.forEach((trace, idx) => {
      const req = requirements[idx];
      const confidence = (trace.confidence * 100).toFixed(1);
      const status = trace.confidence >= 0.7 ? '✓' : trace.confidence >= 0.5 ? '⚠' : '✗';
      
      console.log(`\n   ${status} ${req.id} (Priority ${req.priority}, ${req.kind}): ${confidence}% confidence`);
      console.log(`      Evidence: ${trace.evidence_doc_ids[0]}`);
      
      if (trace.evidence_snippets[0]) {
        const snippet = trace.evidence_snippets[0].slice(0, 100).replace(/\s+/g, ' ');
        console.log(`      Snippet: "${snippet}..."`);
      }
      
      if (trace.gaps.length > 0) {
        console.log(`      Gaps:`);
        trace.gaps.forEach(gap => console.log(`         - ${gap}`));
      }
    });
    
    console.log('\n\n📦 Deliverable Package:');
    console.log(`   Package ID: ${result.package.id}`);
    console.log(`   Filename: ${result.package.filename}`);
    console.log(`   URL: ${result.package.url}`);
    
    console.log(`\n⏱️  Processing Time: ${duration}ms`);
    
    // Analysis breakdown
    console.log('\n\n📈 SCORING BREAKDOWN:');
    const totalPriority = requirements.reduce((sum, r) => sum + r.priority, 0);
    const weightedCovered = result.traces.reduce((sum, t, i) => {
      const req = requirements[i];
      return sum + (t.confidence >= 0.5 ? req.priority : 0);
    }, 0);
    const weightedCoverage = weightedCovered / totalPriority;
    const avgConfidence = result.traces.reduce((sum, t) => sum + t.confidence, 0) / result.traces.length;
    
    console.log(`   Total Priority Weight: ${totalPriority}`);
    console.log(`   Weighted Coverage: ${(weightedCoverage * 100).toFixed(1)}%`);
    console.log(`   Average Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    
    const shallReqs = requirements.filter(r => r.kind === 'shall');
    const shallMet = result.traces.filter((t, i) => 
      requirements[i].kind === 'shall' && t.confidence >= 0.7
    );
    console.log(`   Mandatory Compliance: ${shallMet.length}/${shallReqs.length} "shall" requirements met`);
    
    console.log('\n   Formula: coverage^0.8 × confidence^0.2 × shallPenalty × agencyMultiplier(1.3)');
    console.log(`   Result: ${Math.pow(weightedCoverage, 0.8).toFixed(3)} × ${Math.pow(avgConfidence, 0.2).toFixed(3)} × ${(shallMet.length / shallReqs.length).toFixed(3)} × 1.3`);
    console.log(`   = ${(result.state.win_prob * 100).toFixed(1)}% win probability`);
    
    console.log('\n' + '═'.repeat(80));
    console.log('🎉 Demo Complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error running OPTR demo:');
    console.error(error);
    process.exit(1);
  }
}

runDemo();
