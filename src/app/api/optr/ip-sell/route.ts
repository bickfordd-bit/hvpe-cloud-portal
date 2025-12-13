import { NextResponse } from "next/server";
import { IPSellingEngine, type IPSaleOpportunity } from "@/lib/optr/ipSelling";
import { defaultDashboardData } from "@/lib/hvpeDashboardData";
import { optrClient } from "@/lib/optr/client";

export async function POST() {
  try {
    // Get IP portfolio data from dashboard
    const portfolio = defaultDashboardData.billionaires.people;

    // Create IP sale opportunities
    const opportunities = await IPSellingEngine.createIPOpportunities(portfolio);

    // Submit each opportunity to OPTR system
    const submittedOpportunities: IPSaleOpportunity[] = [];

    for (const opp of opportunities) {
      try {
        // Convert to base Opportunity type for API
        const baseOpp = {
          id: opp.id,
          source: opp.source,
          title: opp.title,
          agency: opp.agency,
          naics: opp.naics,
          psc: opp.psc,
          deadline_iso: opp.deadline_iso,
          links: opp.links,
          documents: opp.documents
        };

        const submitted = await optrClient.create(baseOpp);
        submittedOpportunities.push({ ...opp, ...submitted });
      } catch (error) {
        console.error(`Failed to submit opportunity ${opp.id}:`, error);
      }
    }

    return NextResponse.json({
      message: `Created ${submittedOpportunities.length} IP sale opportunities`,
      opportunities: submittedOpportunities,
      totalValue: submittedOpportunities.reduce((sum, opp) => sum + opp.ipValue, 0)
    });

  } catch (error) {
    console.error('IP selling error:', error);
    return NextResponse.json(
      { message: `Failed to create IP opportunities: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all opportunities and filter for IP sales
    const allOpportunities = await optrClient.list();
    const ipOpportunities = allOpportunities.filter(opp =>
      opp.source === 'internal-ip-portfolio' || opp.id.startsWith('ip-sale-')
    );

    return NextResponse.json({
      opportunities: ipOpportunities,
      count: ipOpportunities.length
    });

  } catch (error) {
    console.error('Failed to fetch IP opportunities:', error);
    return NextResponse.json(
      { message: `Failed to fetch IP opportunities: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}