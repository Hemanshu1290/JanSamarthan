import { NextResponse } from "next/server";
import React from "react";
import {
  renderToStream,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 12, fontWeight: "bold" },
  section: {
    margin: 8,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  label: { fontWeight: "bold" },
});

const CSR2Report = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>
        Form CSR-2 / Government Grant Audit Report
      </Text>
      <View style={styles.section}>
        <Text>
          <Text style={styles.label}>NITI Aayog Darpan ID:</Text>{" "}
          {data.darpanId}
        </Text>
        <Text>
          <Text style={styles.label}>NGO Name:</Text> {data.ngoName}
        </Text>
        <Text>
          <Text style={styles.label}>CSR-1 Registration:</Text>{" "}
          {data.csr1Number}
        </Text>
      </View>
      <View style={styles.section}>
        <Text>
          <Text style={styles.label}>Allocated Grant:</Text> ₹{data.amount}
        </Text>
        <Text>
          <Text style={styles.label}>EXIF Geo Audit:</Text> {data.geoStatus}
        </Text>
        <Text>
          <Text style={styles.label}>CAG Audit Ref:</Text> {data.cagRef}
        </Text>
      </View>
    </Page>
  </Document>
);

export async function GET() {
  const mockData = {
    darpanId: "NGO/DARPAN/2026/00192",
    ngoName: "Rural Water Relief Foundation",
    csr1Number: "CSR00012345",
    amount: "10,00,000",
    geoStatus: "VERIFIED PASSED",
    cagRef: `CAG-${Date.now()}`,
  };

  const stream = await renderToStream(<CSR2Report data={mockData} />);
  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Form_CSR2_Compliance.pdf"',
    },
  });
}
