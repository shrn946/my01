import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leads Management</h1>
        <Link href="/admin/extractor">
          <Button><Plus className="w-4 h-4 mr-2" /> Add New Lead</Button>
        </Link>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business / URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No leads found. Start by extracting one.</TableCell>
              </TableRow>
            ) : leads.map(lead => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="font-medium">{lead.businessName || "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">{lead.website}</div>
                </TableCell>
                <TableCell><Badge variant="outline">{lead.status}</Badge></TableCell>
                <TableCell>
                  {lead.leadScore ? (
                    <Badge variant={lead.leadScore < 60 ? "destructive" : lead.leadScore < 80 ? "default" : "secondary"}>
                      {lead.leadScore}
                    </Badge>
                  ) : "-"}
                </TableCell>
                <TableCell>{lead.email ? "Yes" : "No"}</TableCell>
                <TableCell>{lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : "Never"}</TableCell>
                <TableCell>
                  <Link href={`/admin/leads/${lead.id}`}>
                    <Button variant="ghost" size="sm"><Eye className="w-4 h-4 mr-2" /> View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

