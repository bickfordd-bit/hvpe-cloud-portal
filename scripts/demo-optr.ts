#!/usr/bin/env tsx
/**
 * OPTR Live Demo - Shows weighted scoring in action
 * Run: npx tsx scripts/demo-optr.ts
 */

import { processOpportunity } from '../src/lib/optr/processor';
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
      type: 'pdf',
      sha256: 'abc123...'
    }
  ]
};

// Requirements (note: actual Requirement type only supports "high" | "medium" | "low" for priority)
const requirements: Requirement[] = [
  {
    id: 'REQ-001',
    priority: 'high',
    text: 'The system shall provide 24/7 security monitoring and threat detection capabilities with real-time alerting',
  },
  {
    id: 'REQ-002',
    priority: 'high',
    text: 'The solution shall comply with NIST 800-53 security controls and FedRAMP High authorization',
  },
  {
    id: 'REQ-003',
    priority: 'high',
    text: 'The system shall integrate with existing SIEM platforms including Splunk and QRadar',
  },
  {
    id: 'REQ-004',
    priority: 'medium',
    text: 'The solution should provide automated incident response playbooks and orchestration',
  },
  {
    id: 'REQ-005',
    priority: 'low',
    text: 'The system should include AI-powered threat intelligence and predictive analytics',
  },
  {
    id: 'REQ-006',
    priority: 'high',
    text: 'The contractor shall maintain active Secret facility clearance and employ cleared personnel',
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
  const priorityMap = { high: 5, medium: 3, low: 2 };
  const priorityNum = priorityMap[req.priority];
  const priority = '★'.repeat(priorityNum) + '☆'.repeat(5 - priorityNum);
  console.log(`   ${req.id}: [${req.priority.toUpperCase()}] ${priority}`);
  console.log(`      ${req.text.slice(0, 80)}...`);
});

console.log('\n\n⚙️  Running OPTR Processor...\n');

async function runDemo() {
  try {
    const startTime = Date.now();
    
    // Run OPTR analysis (requires opportunity to be in database)
    // For demo purposes, this would need the opportunity ID to be saved first
    console.log('⚠️  Note: This demo requires database setup and opportunity to be saved');
    console.log('Use demo-optr-mock.ts for a standalone demo without database dependency\n');
    
    const result = await processOpportunity(opportunity.id);
    
    const duration = Date.now() - startTime;
    
    console.log('═'.repeat(80));
    console.log('\n✅ OPTR Analysis Complete!\n');
    
    // Display results
    console.log('📊 RESULTS:');
    console.log(`   Success: ${result.success ? 'Yes' : 'No'}`);
    console.log(`   Total Requirements: ${result.summary.totalRequirements}`);
    console.log(`   Average Score: ${result.summary.averageScore}%`);
    console.log(`   Coverage: ${result.summary.coverage}%`);
    console.log(`   Execution Time: ${result.summary.executionTimeMs}ms`);
    
    console.log('\n🔍 Requirement Traces:');
    result.traces.forEach((trace, idx) => {
      console.log(`\n   ${idx + 1}. ${trace.stage}: ${trace.status}`);
      console.log(`      Message: ${trace.message}`);
      console.log(`      Time: ${trace.timestamp}`);
    });
    
    console.log(`\n⏱️  Processing Time: ${duration}ms`);
    
    if (result.requirements && result.requirements.length > 0) {
      console.log('\n\n📋 Scored Requirements:');
      result.requirements.forEach((req) => {
        console.log(`\n   ${req.id}: ${req.score}% - ${req.status}`);
        console.log(`      ${req.text.slice(0, 80)}...`);
        if (req.explanation) {
          console.log(`      Explanation: ${req.explanation}`);
        }
      });
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('🎉 Demo Complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error running OPTR demo:');
    console.error(error);
    process.exit(1);
  }
}

runDemo();
