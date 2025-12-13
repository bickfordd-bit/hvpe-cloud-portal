import { prisma } from "@/lib/prisma";
import type { Opportunity, DocumentRef } from "@/lib/optr/types";
import type { BillionairePerson } from "@/lib/hvpeDashboardData";
import { JsonValue } from "@prisma/client/runtime/library";

export interface IPSaleOpportunity extends Opportunity {
  ipSource: string;
  ipValue: number;
  ipType: 'software' | 'algorithm' | 'data' | 'patent' | 'trade-secret';
  targetBuyers: string[];
  saleStrategy: 'auction' | 'direct-sale' | 'licensing' | 'partnership';
}

export class IPSellingEngine {
  /**
   * Convert IP portfolio data into OPTR opportunities for selling
   */
  static async createIPOpportunities(people: BillionairePerson[]): Promise<IPSaleOpportunity[]> {
    const opportunities: IPSaleOpportunity[] = [];

    for (const person of people) {
      if (!person.ipCreated || person.ipValue === 0) continue;

      const opportunity = await this.createIPOpportunity(person);
      opportunities.push(opportunity);
    }

    return opportunities;
  }

  /**
   * Create a single IP sale opportunity from portfolio data
   */
  private static async createIPOpportunity(person: BillionairePerson): Promise<IPSaleOpportunity> {
    const ipType = this.inferIPType(person.name);
    const targetBuyers = this.identifyTargetBuyers(ipType, person.ipValue);
    const saleStrategy = this.determineSaleStrategy(person.ipValue, person.saleTimeline);

    // Create documents representing the IP
    const documents: DocumentRef[] = [
      {
        id: `ip-${person.name.toLowerCase()}-overview`,
        type: 'pdf',
        sha256: '', // Would be calculated from actual document
        filename: `${person.name}_IP_Portfolio_Overview.pdf`
      },
      {
        id: `ip-${person.name.toLowerCase()}-valuation`,
        type: 'pdf',
        sha256: '',
        filename: `${person.name}_IP_Valuation_Report.pdf`
      }
    ];

    const opportunity: IPSaleOpportunity = {
      id: `ip-sale-${person.name.toLowerCase()}-${Date.now()}`,
      source: 'internal-ip-portfolio',
      title: `IP Portfolio Sale: ${person.name} - ${ipType.charAt(0).toUpperCase() + ipType.slice(1)} Assets`,
      agency: 'Private Sector',
      naics: '541990', // Professional/Technical Services
      psc: 'R499', // Other Professional Services
      deadline_iso: person.saleTimeline,
      links: [
        `https://hvpe-cloud-portal.com/ip/${person.name.toLowerCase()}/portfolio`,
        `https://hvpe-cloud-portal.com/ip/${person.name.toLowerCase()}/valuation`
      ],
      documents,
      ipSource: person.name,
      ipValue: person.ipValue,
      ipType,
      targetBuyers,
      saleStrategy
    };

    // Store in database
    await this.persistIPOpportunity(opportunity);

    return opportunity;
  }

  /**
   * Infer IP type based on person's name and context
   */
  private static inferIPType(name: string): IPSaleOpportunity['ipType'] {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('tech') || nameLower.includes('software')) return 'software';
    if (nameLower.includes('data') || nameLower.includes('analytics')) return 'data';
    if (nameLower.includes('patent') || nameLower.includes('invention')) return 'patent';

    // Default based on typical family IP distribution
    const typeMap: Record<string, IPSaleOpportunity['ipType']> = {
      'derek': 'software',
      'jenna': 'algorithm',
      'penelope': 'data',
      'xavier': 'patent',
      'naomi': 'trade-secret'
    };

    return typeMap[nameLower] || 'software';
  }

  /**
   * Identify potential buyers based on IP type and value
   */
  private static identifyTargetBuyers(ipType: IPSaleOpportunity['ipType'], ipValue: number): string[] {
    const buyers: Record<string, string[]> = {
      software: ['Microsoft', 'Google', 'Amazon', 'Meta', 'Apple', 'Tech Startups'],
      algorithm: ['Quantitative Hedge Funds', 'AI Research Labs', 'FinTech Companies', 'Defense Contractors'],
      data: ['Data Analytics Firms', 'Marketing Agencies', 'Research Institutions', 'Government Agencies'],
      patent: ['Patent Holding Companies', 'Industry Leaders', 'Competitors', 'Licensing Firms'],
      'trade-secret': ['Strategic Partners', 'Competitors', 'Private Equity', 'Family Offices']
    };

    const baseBuyers = buyers[ipType] || buyers.software;

    // Add premium buyers for high-value IP
    if (ipValue >= 100000) {
      baseBuyers.unshift('Private Equity Firms', 'Venture Capital');
    }

    return baseBuyers.slice(0, 5); // Limit to top 5
  }

  /**
   * Determine optimal sale strategy based on value and timeline
   */
  private static determineSaleStrategy(
    ipValue: number,
    saleTimeline: string
  ): IPSaleOpportunity['saleStrategy'] {
    const daysUntilSale = Math.ceil(
      (new Date(saleTimeline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // High value + long timeline = auction
    if (ipValue >= 100000 && daysUntilSale > 180) return 'auction';

    // Medium value + medium timeline = direct sale
    if (ipValue >= 25000 && daysUntilSale > 90) return 'direct-sale';

    // Low value or urgent timeline = licensing
    if (ipValue < 25000 || daysUntilSale < 30) return 'licensing';

    // Default strategy
    return 'partnership';
  }

  /**
   * Persist IP opportunity to database
   */
  private static async persistIPOpportunity(opportunity: IPSaleOpportunity): Promise<void> {
    try {
      // Store base opportunity data
      await prisma.opportunity.upsert({
        where: { id: opportunity.id },
        update: {
          title: opportunity.title,
          agency: opportunity.agency,
          deadline_iso: opportunity.deadline_iso,
          links: opportunity.links,
          documents: opportunity.documents as JsonValue
        },
        create: {
          id: opportunity.id,
          source: opportunity.source,
          title: opportunity.title,
          agency: opportunity.agency,
          deadline_iso: opportunity.deadline_iso,
          links: opportunity.links,
          documents: opportunity.documents as JsonValue
        }
      });

      // Store IP-specific metadata (would need to extend schema)
      console.log(`IP Opportunity created: ${opportunity.id} - ${opportunity.title}`);
    } catch (error) {
      console.error('Failed to persist IP opportunity:', error);
    }
  }

  /**
   * Generate requirements for IP sale opportunities
   */
  static generateIPSaleRequirements(ipType: IPSaleOpportunity['ipType']) {
    const baseRequirements = [
      {
        id: "IP-REQ-001",
        section: "1.1",
        text: "Provide comprehensive IP portfolio documentation including ownership, patents, and licensing history.",
        kind: "shall" as const,
        priority: 5
      },
      {
        id: "IP-REQ-002",
        section: "1.2",
        text: "Demonstrate IP value through financial projections and market analysis.",
        kind: "shall" as const,
        priority: 4
      }
    ];

    const typeSpecificRequirements = {
      software: [
        {
          id: "IP-REQ-SW-001",
          section: "2.1",
          text: "Provide source code repositories, documentation, and deployment procedures.",
          kind: "shall" as const,
          priority: 5
        }
      ],
      algorithm: [
        {
          id: "IP-REQ-ALG-001",
          section: "2.1",
          text: "Include algorithm specifications, performance benchmarks, and validation results.",
          kind: "shall" as const,
          priority: 5
        }
      ],
      data: [
        {
          id: "IP-REQ-DATA-001",
          section: "2.1",
          text: "Provide data schemas, quality metrics, and privacy compliance documentation.",
          kind: "shall" as const,
          priority: 4
        }
      ],
      patent: [
        {
          id: "IP-REQ-PAT-001",
          section: "2.1",
          text: "Include patent filings, examination history, and freedom-to-operate analysis.",
          kind: "shall" as const,
          priority: 5
        }
      ],
      'trade-secret': [
        {
          id: "IP-REQ-TS-001",
          section: "2.1",
          text: "Demonstrate protection measures and provide non-disclosure agreements.",
          kind: "must" as const,
          priority: 5
        }
      ]
    };

    return [...baseRequirements, ...(typeSpecificRequirements[ipType] || [])];
  }
}

export default IPSellingEngine;