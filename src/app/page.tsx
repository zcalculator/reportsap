"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import logo from "@/logo.jpg";

function formatAdditionalPointLabel(key: string): string {
  const spaced = key.replace(/_/g, " ").trim();
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function AdditionalPointValue({
  value,
  depth,
}: {
  value: unknown;
  depth: number;
}): ReactNode {
  if (value === null || value === "") {
    return <p className="mt-0.5 font-medium text-[#9ca3af]">—</p>;
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return (
      <p className="mt-0.5 font-medium text-[#1a1a1a]">{String(value)}</p>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="mt-0.5 font-medium text-[#9ca3af]">—</p>;
    }
    const primitivesOnly = value.every(
      (item) =>
        item === null ||
        ["string", "number", "boolean"].includes(typeof item)
    );
    if (primitivesOnly) {
      return (
        <p className="mt-0.5 font-medium text-[#1a1a1a]">
          {value.map((v) => (v === null ? "—" : String(v))).join(", ")}
        </p>
      );
    }
    return (
      <ul className="mt-0.5 list-inside list-disc space-y-1 font-medium text-[#1a1a1a]">
        {value.map((item, i) => (
          <li key={i}>
            {isPlainObject(item) ? (
              <AdditionalPointsFields data={item} depth={depth + 1} />
            ) : (
              String(item)
            )}
          </li>
        ))}
      </ul>
    );
  }
  if (isPlainObject(value)) {
    return (
      <div className="mt-1">
        <AdditionalPointsFields data={value} depth={depth + 1} />
      </div>
    );
  }
  return <p className="mt-0.5 font-medium text-[#1a1a1a]">{String(value)}</p>;
}

function AdditionalPointsFields({
  data,
  depth = 0,
}: {
  data: Record<string, unknown>;
  depth?: number;
}) {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return null;

  return (
    <div
      className={
        depth > 0
          ? "space-y-3 rounded border border-dashed border-[#e5e7eb] bg-[#fafafa] p-2"
          : "grid grid-cols-1 gap-3 sm:grid-cols-2"
      }
    >
      {entries.map(([key, value]) => (
        <div key={key}>
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
            {formatAdditionalPointLabel(key)}
          </span>
          <AdditionalPointValue value={value} depth={depth} />
        </div>
      ))}
    </div>
  );
}

interface ReportSummary {
  id: string;
  reference_number: string | null;
  report_date: string;
  maintenance_type: string;
  status: string;
  description: string | null;
  /** When the file was processed and this report was created */
  created_at?: string;
  equipment?: {
    equipment_number: string;
    equipment_type: string;
    site_location: string | null;
  } | null;
}

interface ReportDetail {
  id: string;
  reference_number?: string;
  created_at?: string;
  report_date: string;
  scheduled_start_date?: string;
  scheduled_finish_date?: string;
  actual_start_date?: string;
  actual_finish_date?: string;
  order_type?: string;
  maintenance_type: string;
  status: string;
  priority?: string;
  plant_id?: string;
  work_center?: string;
  cost_center?: string;
  company_code?: string;
  functional_location?: string;
  description?: string;
  work_performed?: string;
  findings?: string;
  recommendations?: string;
  technician_name?: string;
  technician_company?: string;
  hours_worked?: number;
  labor_cost?: number;
  total_cost?: number;
  next_scheduled_maintenance?: string;
  equipment?: {
    equipment_number: string;
    equipment_type: string;
    serial_number?: string;
    manufacturer?: string;
    model?: string;
    site_location?: string;
    functional_location?: string;
  };
  report_operations?: Array<{
    operation_number: number;
    description?: string;
    work_center?: string;
    labor_hours?: number;
  }>;
  report_components?: Array<{
    material_number?: string;
    material_description?: string;
    quantity: number;
    unit?: string;
    unit_cost?: number;
  }>;
  additional_points?: Record<string, unknown>;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<ReportDetail | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess("Document processed and saved successfully!");
      setFile(null);
      fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (id: string) => {
    setLoadingReport(true);
    setViewingReport(null);
    try {
      const res = await fetch(`/api/reports?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setViewingReport(data);
      }
    } catch {
      setViewingReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleExport = (id: string) => {
    window.open(`/api/export-xml?id=${id}`, "_blank");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatUploadDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a]">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6">
        <header className="mb-8 flex flex-col items-center">
          <Image
            src={logo}
            alt="ReportSAP - Converts any report to SAP ready XML"
            width={420}
            height={126}
            className="h-auto w-full max-w-[420px]"
            priority
          />
          <p className="mt-2 text-center text-xs text-[#6b7280]">
            Upload service/maintenance documents (CSV, Excel, XML). Data is
            extracted with AI and saved for SAP PM export.
          </p>
        </header>

        <section className="mb-8 rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[#6b7280]">
            Upload Document
          </h2>
          <form onSubmit={handleUpload} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="file"
                  className="mb-1 block text-xs text-[#6b7280]"
                >
                  Select file (CSV, XLSX, XLS, XML, TXT)
                </label>
                <input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls,.xml,.txt,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/xml,text/xml,text/plain"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-xs text-[#1a1a1a] file:mr-3 file:rounded file:border-0 file:bg-[#ffd21e] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#1a1a1a] hover:file:bg-[#f5c60a]"
                />
              </div>
              <button
                type="submit"
                disabled={!file || uploading}
                className="rounded-md bg-[#ffd21e] px-4 py-2 text-xs font-medium text-[#1a1a1a] transition hover:bg-[#f5c60a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Processing…" : "Upload & Extract"}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            {success && (
              <p className="text-xs text-emerald-600">{success}</p>
            )}
          </form>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[#6b7280]">
            Reports
          </h2>
          {loading ? (
            <p className="text-xs text-[#9ca3af]">Loading…</p>
          ) : reports.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#e5e7eb] bg-white py-10 text-center text-xs text-[#9ca3af]">
              No reports yet. Upload a document to get started.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
              <table className="min-w-full divide-y divide-[#e5e7eb]">
                <thead className="bg-[#f9fafb]">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                      Reference
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                      Report date
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                      Uploaded
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                      Equipment
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                      Status
                    </th>
                    <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-[#fafafa]">
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-[#1a1a1a]">
                        {r.reference_number || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-[10px] leading-tight text-[#6b7280]">
                        {formatDate(r.report_date)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-[10px] leading-tight text-[#6b7280]">
                        {formatUploadDate(r.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-[#6b7280]">
                        {r.maintenance_type}
                      </td>
                      <td className="px-3 py-2 text-xs text-[#6b7280]">
                        {r.equipment
                          ? `${r.equipment.equipment_number} (${r.equipment.equipment_type})`
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            r.status === "exported"
                              ? "bg-emerald-100 text-emerald-700"
                              : r.status === "draft"
                                ? "bg-[#ffd21e]/30 text-[#b45309]"
                                : "bg-[#f3f4f6] text-[#6b7280]"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleView(r.id)}
                            className="rounded border border-[#e5e7eb] bg-white px-2.5 py-1 text-[10px] font-medium text-[#6b7280] transition hover:bg-[#f9fafb] hover:border-[#d1d5db]"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleExport(r.id)}
                            className="rounded border border-[#e5e7eb] bg-white px-2.5 py-1 text-[10px] font-medium text-[#6b7280] transition hover:bg-[#f9fafb] hover:border-[#d1d5db]"
                          >
                            SAP XML
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Report view modal */}
        {loadingReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="rounded-lg bg-white px-6 py-4 text-xs text-[#6b7280]">
              Loading report…
            </div>
          </div>
        )}
        {viewingReport && !loadingReport && (() => {
          const eq = viewingReport.equipment
            ? (Array.isArray(viewingReport.equipment) ? viewingReport.equipment[0] : viewingReport.equipment)
            : null;
          return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
            onClick={() => setViewingReport(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-3">
                <h3 className="text-sm font-semibold text-[#1a1a1a]">
                  Report: {viewingReport.reference_number || viewingReport.id.slice(0, 8)}
                </h3>
                <button
                  onClick={() => setViewingReport(null)}
                  className="rounded p-1 text-[#6b7280] hover:bg-[#f3f4f6]"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 p-4 text-xs">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <span className="text-[#6b7280]">Report date</span>
                    <p className="font-medium">{formatDate(viewingReport.report_date)}</p>
                  </div>
                  <div>
                    <span className="text-[#6b7280]">Uploaded</span>
                    <p className="text-[10px] font-medium leading-tight text-[#1a1a1a]">
                      {formatUploadDate(viewingReport.created_at)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#6b7280]">Type</span>
                    <p className="font-medium">{viewingReport.maintenance_type}</p>
                  </div>
                  <div>
                    <span className="text-[#6b7280]">Status</span>
                    <p className="font-medium">{viewingReport.status}</p>
                  </div>
                  {viewingReport.technician_name && (
                    <div>
                      <span className="text-[#6b7280]">Technician</span>
                      <p className="font-medium">{viewingReport.technician_name}</p>
                    </div>
                  )}
                  {viewingReport.hours_worked != null && (
                    <div>
                      <span className="text-[#6b7280]">Hours</span>
                      <p className="font-medium">{viewingReport.hours_worked}</p>
                    </div>
                  )}
                </div>

                {eq && (
                  <div className="rounded border border-[#e5e7eb] p-3">
                    <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                      Equipment
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <p><span className="text-[#6b7280]">Number:</span> {eq.equipment_number}</p>
                      <p><span className="text-[#6b7280]">Type:</span> {eq.equipment_type}</p>
                      {eq.site_location && (
                        <p className="col-span-2"><span className="text-[#6b7280]">Site:</span> {eq.site_location}</p>
                      )}
                    </div>
                  </div>
                )}

                {viewingReport.description && (
                  <div>
                    <h4 className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">Description</h4>
                    <p className="text-[#1a1a1a]">{viewingReport.description}</p>
                  </div>
                )}
                {viewingReport.work_performed && (
                  <div>
                    <h4 className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">Work performed</h4>
                    <p className="text-[#1a1a1a]">{viewingReport.work_performed}</p>
                  </div>
                )}
                {viewingReport.findings && (
                  <div>
                    <h4 className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">Findings</h4>
                    <p className="text-[#1a1a1a]">{viewingReport.findings}</p>
                  </div>
                )}
                {viewingReport.recommendations && (
                  <div>
                    <h4 className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">Recommendations</h4>
                    <p className="text-[#1a1a1a]">{viewingReport.recommendations}</p>
                  </div>
                )}

                {viewingReport.report_operations && viewingReport.report_operations.length > 0 && (
                  <div className="rounded border border-[#e5e7eb] p-3">
                    <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">Operations</h4>
                    <div className="space-y-2">
                      {viewingReport.report_operations.map((op, i) => (
                        <div key={i} className="flex gap-2 border-b border-[#f3f4f6] pb-2 last:border-0 last:pb-0">
                          <span className="font-medium">{op.operation_number}.</span>
                          <span>{op.description || "—"}</span>
                          {op.labor_hours != null && <span className="text-[#6b7280]">({op.labor_hours}h)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingReport.report_components && viewingReport.report_components.length > 0 && (
                  <div className="rounded border border-[#e5e7eb] p-3">
                    <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">Components / Parts</h4>
                    <div className="space-y-2">
                      {viewingReport.report_components.map((c, i) => (
                        <div key={i} className="flex justify-between gap-2">
                          <span>{c.material_description || c.material_number || "—"}</span>
                          <span className="text-[#6b7280]">{c.quantity} {c.unit || "EA"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingReport.additional_points &&
                  Object.keys(viewingReport.additional_points).length > 0 && (
                  <div className="rounded border border-[#e5e7eb] p-3">
                    <h4 className="mb-3 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                      Additional Points
                    </h4>
                    <AdditionalPointsFields data={viewingReport.additional_points} />
                  </div>
                )}
              </div>
              <div className="border-t border-[#e5e7eb] px-4 py-3">
                <button
                  onClick={() => handleExport(viewingReport.id)}
                  className="rounded-md bg-[#ffd21e] px-4 py-2 text-xs font-medium text-[#1a1a1a] transition hover:bg-[#f5c60a]"
                >
                  Export SAP XML
                </button>
              </div>
            </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
}
