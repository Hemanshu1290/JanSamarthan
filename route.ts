import { NextResponse } from "next/server";
import exifr from "exifr";

const MOCK_EXISTING_PROJECTS = ["SITE-DISTRICT-77209-DELHI"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const darpanId = formData.get("darpanId") as string;
    const siteCode = formData.get("siteCode") as string;
    const currentMilestone = formData.get("currentMilestone") as
      | "ADVANCE"
      | "MID_PROOF"
      | "FINAL_AUDIT";
    const imageFile = formData.get("proofImage") as File | null;

    // Feature 1: Duplication Prevention Alert
    if (MOCK_EXISTING_PROJECTS.includes(siteCode)) {
      return NextResponse.json(
        {
          success: false,
          auditStatus: "FLAGGED_DUPLICATE",
          message:
            "ALERT: NGO has already claimed a grant for this exact site location.",
        },
        { status: 409 },
      );
    }

    // Feature 3: NITI Aayog Verification
    const isDarpanValid = darpanId && darpanId.startsWith("NGO/DARPAN");
    if (!isDarpanValid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Disbursal Halted: Invalid or Unverified NITI Aayog Darpan ID.",
        },
        { status: 403 },
      );
    }

    // Feature 2: EXIF Geo-Fenced Audit Engine
    let geoVerified = false;
    let extractedGeo = { lat: 0, lng: 0 };

    if (imageFile && currentMilestone !== "ADVANCE") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const exif = await exifr.gps(buffer);

      if (exif && exif.latitude && exif.longitude) {
        extractedGeo = { lat: exif.latitude, lng: exif.longitude };
        // Target Location Check (Delhi Region Simulation)
        geoVerified = Math.abs(exif.latitude - 28.6139) < 0.25;
      }

      if (!geoVerified) {
        return NextResponse.json(
          {
            success: false,
            auditStatus: "FAILED_GEO",
            extractedGeo,
            message:
              "Geo-Audit Failed: Photo GPS location does not match target district.",
          },
          { status: 422 },
        );
      }
    }

    // Feature 4: Automated Tranche Escrow Calculation
    let tranchePercent = 0.3;
    if (currentMilestone === "MID_PROOF") tranchePercent = 0.4;
    if (currentMilestone === "FINAL_AUDIT") tranchePercent = 0.3;

    const totalSchemeBudget = 1000000; // ₹10,00,000
    const unlockedAmount = totalSchemeBudget * tranchePercent;

    return NextResponse.json({
      success: true,
      auditStatus: "PASSED",
      message: `Verification Passed. Tranche of ₹${unlockedAmount.toLocaleString("en-IN")} unlocked.`,
      unlockedAmount,
      cagAuditTrail: {
        auditId: `CAG-${Date.now()}`,
        darpanId,
        siteCode,
        tranchePercent: `${tranchePercent * 100}%`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Government Audit Engine Error" },
      { status: 500 },
    );
  }
}
