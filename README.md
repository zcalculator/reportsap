# ReportSAP – SAP PM Integration

A Next.js app that lets clients upload maintenance/service documents (CSV, Excel, XML, unstructured text), extracts data with AI, stores it in Supabase, and exports to SAP PM–compatible XML.

## Features

- **Document upload**: CSV, XLSX, XLS, XML, TXT
- **AI extraction**: Extracts maintenance report fields from documents
- **Database**: Supabase (PostgreSQL) with schema for equipment, reports, operations, components
- **SAP PM export**: XML format aligned with common SAP PM maintenance order structures

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration:

```bash
# Using Supabase CLI (optional)
supabase db push

# Or run the SQL manually in SQL Editor:
# supabase/migrations/001_initial_schema.sql
```

3. Create a storage bucket named `report-files` (optional, for file storage)
4. Copy project URL and keys from **Settings → API**

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel

1. Push to GitHub and import the repo in Vercel
2. Add the same env vars in **Project Settings → Environment Variables**
3. Deploy

## Database schema

- **equipment**: Machinery (wind turbines, gearboxes, etc.)
- **report_files**: Uploaded documents
- **reports**: Main maintenance report header (SAP PM–aligned)
- **report_operations**: Work steps
- **report_components**: Parts/materials used

## SAP PM XML export

Export produces XML with header, equipment, operations, and components. Adjust `src/lib/sap-pm-xml.ts` to match your SAP PM interface (BAPI/IDoc).
