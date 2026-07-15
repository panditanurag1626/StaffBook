# Resume API — Endpoint Documentation

> **Base URL:** `https://resume.codekrafters.co.in`
> **Local Dev:** `http://localhost:3000`

---

## Quick Start

### 1. Upload & Parse a Resume

```bash
curl -X POST https://resume.codekrafters.co.in/api/upload-resume \
  -F "file=@./my_resume.pdf"
```

### 2. Run ATS Analysis

```bash
curl -X POST https://resume.codekrafters.co.in/api/ats-analyze \
  -H "Content-Type: application/json" \
  -d '{"resume": <JSON Resume object>}'
```

### 3. Render a Template

```bash
curl -X POST https://resume.codekrafters.co.in/api/templates/1/render \
  -H "Content-Type: application/json" \
  -d '{"resume": <JSON Resume object>}'
```

---

## Integration in Next.js

```typescript
const API_BASE = "https://resume.codekrafters.co.in";

// Upload resume
const form = new FormData();
form.append("file", selectedFile);
const uploadRes = await fetch(`${API_BASE}/api/upload-resume`, {
  method: "POST",
  body: form,
});
const { data, ats_scores, upload_id } = await uploadRes.json();

// Get ATS score
const atsRes = await fetch(`${API_BASE}/api/ats-analyze`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resume: data }),
});
const { rule_based, ai_analysis } = (await atsRes.json()).data;

// Render template
const renderRes = await fetch(`${API_BASE}/api/templates/1/render`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ upload_id }),
});
const { html } = (await renderRes.json()).data;

// Preview in iframe
// <iframe src={`${API_BASE}/api/templates/1/preview?upload_id=${upload_id}`} />
```

---

## All Endpoints

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | `POST` | `/api/upload-resume` | Upload & parse a resume file |
| 2 | `POST` | `/api/ats-analyze` | ATS score analysis (rule-based + AI) |
| 3 | `GET` | `/api/resume/{upload_id}` | Fetch stored resume |
| 4 | `GET` | `/api/jsonresume/{upload_id}` | Fetch stored resume (JSON Resume spec) |
| 5 | `GET` | `/api/schema` | JSON Resume schema info + sample |
| 6 | `GET` | `/api/templates` | List all templates (filter/paginate) |
| 7 | `GET` | `/api/templates/categories` | List template categories |
| 8 | `GET` | `/api/templates/{id}` | Get single template metadata |
| 9 | `POST` | `/api/templates/{id}/render` | Render template → HTML (JSON response) |
| 10 | `GET` | `/api/templates/{id}/preview` | Render preview (raw HTML) |
| 11 | `POST` | `/api/templates/{id}/html` | Render template → raw HTML |

---

## Endpoint Details

### 1. `POST /api/upload-resume`

Upload a resume file (PDF, DOCX, TXT, PNG, JPG) and get back parsed JSON Resume data + ATS scores.

**Request:**
- Content-Type: `multipart/form-data`
- Body field: `file` (max 16MB)

**Success Response (200):**
```json
{
  "status": 200,
  "statusText": "OK",
  "message": "Resume parsed successfully",
  "resume_file": "john_doe_resume.pdf",
  "schema": "jsonresume",
  "data": {
    "basics": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-123-4567",
      "location": "New York, NY",
      "summary": "Software engineer with 5+ years..."
    },
    "work": [...],
    "education": [...],
    "skills": [...]
  },
  "ats_scores": {
    "overall_score": 82,
    "breakdown": { "contact_info": 90, "summary": 75, ... },
    "feedback": { ... }
  }
}
```

**Error Codes:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `NO_FILE_FIELD` | No file field in request |
| 400 | `EMPTY_FILENAME` | Empty filename |
| 413 | `FILE_TOO_LARGE` | File too large (max 16MB) |
| 415 | `INVALID_FILE_TYPE` | Only PDF, DOCX, TXT, PNG, JPG accepted |
| 422 | `EMPTY_TEXT` | Could not extract text from file |
| 422 | `AI_PARSE_FAILED` | AI parsing failed |
| 500 | `SAVE_FAILED` | Failed to read uploaded file |

---

### 2. `POST /api/ats-analyze`

Run ATS (Applicant Tracking System) analysis on resume data. Returns rule-based scores + AI-generated insights.

**Request:**
- Content-Type: `application/json`
- Body (any of these formats):

```json
// Option A: Full JSON Resume object
{ "resume": { "basics": {...}, "work": [...], ... } }

// Option B: By upload_id (fetched from DB)
{ "upload_id": "64f1a2b3c4d5e6f7a8b9c0d1" }

// Option C: Direct fields
{ "basics": {...}, "work": [...], ... }
```

**Success Response (200):**
```json
{
  "status": 200,
  "statusText": "OK",
  "message": "ATS analysis complete",
  "data": {
    "rule_based": {
      "overall_score": 82,
      "breakdown": {
        "contact_info": { "score": 90, "max_score": 100, "percentage": 90 },
        "summary": { "score": 75, "max_score": 100, "percentage": 75 },
        "work_experience": { "score": 85, "max_score": 100, "percentage": 85 },
        "quantification": { "score": 70, "max_score": 100, "percentage": 70 },
        "skills": { "score": 88, "max_score": 100, "percentage": 88 },
        "education": { "score": 92, "max_score": 100, "percentage": 92 },
        "projects": { "score": 65, "max_score": 100, "percentage": 65 },
        "certifications": { "score": 50, "max_score": 100, "percentage": 50 }
      },
      "feedback": {
        "contact_info": ["Missing LinkedIn URL"],
        "summary": ["Summary is too short"],
        ...
      }
    },
    "ai_analysis": {
      "missing_sections": ["Certifications", "Projects"],
      "weak_areas": [...],
      "keyword_suggestions": [...],
      "action_verb_upgrades": [...],
      "summary_rewrite": "...",
      "career_upgrades": [...]
    }
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Missing or invalid resume data |
| 500 | ATS analysis failed |

---

### 3. `GET /api/resume/{upload_id}`

Fetch a previously uploaded resume by its MongoDB ObjectId.

**Request:**
- Path param: `upload_id` (24-char hex string)

**Success Response (200):**
```json
{
  "status": 200,
  "statusText": "OK",
  "message": "Resume fetched successfully",
  "upload_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "resume_file": "resume.pdf",
  "schema": "jsonresume",
  "data": { "<JSON Resume object>" },
  "ats_scores": { "<ATS scores>" }
}
```

**Errors:** 404 Not Found, 500 Database Error

---

### 4. `GET /api/jsonresume/{upload_id}`

Same as `/api/resume/{upload_id}` but includes `spec_url` field.

**Success Response (200):**
```json
{
  "status": 200,
  "statusText": "OK",
  "message": "Resume fetched successfully",
  "upload_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "resume_file": "resume.pdf",
  "schema": "jsonresume",
  "spec_url": "https://jsonresume.org/schema/",
  "data": { "<JSON Resume object>" },
  "ats_scores": { "<ATS scores>" }
}
```

---

### 5. `GET /api/schema`

Returns JSON Resume schema metadata and a full sample resume.

**Success Response (200):**
```json
{
  "status": 200,
  "statusText": "OK",
  "schema": "jsonresume v1.0.0",
  "spec_url": "https://jsonresume.org/schema/",
  "example": { "<full sample JSON Resume>" }
}
```

---

### 6. `GET /api/templates`

List all 62 resume templates with optional filtering, search, and pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | all | Filter: `modern`, `classic`, `creative` |
| `is_premium` | string | all | `true`/`1`/`yes` = premium only |
| `search` | string | `""` | Search name, description, tags |
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page |

**Success Response (200):**
```json
{
  "status": 200,
  "statusText": "OK",
  "message": "Templates fetched successfully",
  "data": {
    "total": 62,
    "page": 1,
    "limit": 10,
    "pages": 7,
    "templates": [
      {
        "id": 1,
        "slug": "minimalist-clean",
        "name": "The Minimalist",
        "description": "Clean, structured layout",
        "category": "modern",
        "thumbnail": "/static/templates/thumb/1.png",
        "color_scheme": {
          "primary": "#2c3e50",
          "secondary": "#f7f9fa",
          "text": "#333333",
          "accent": "#2c3e50"
        },
        "font_family": "Inter, sans-serif",
        "layout": "two_column",
        "is_premium": false,
        "template_file": "resume_1_minimalist.html",
        "sections": ["summary", "experience", "education", "skills"],
        "tags": ["minimal", "corporate", "ats-friendly"],
        "render_url": "https://resume.codekrafters.co.in/api/templates/1/render",
        "preview_url": "https://resume.codekrafters.co.in/api/templates/1/preview"
      }
    ]
  }
}
```

---

### 7. `GET /api/templates/categories`

List template categories with counts.

**Success Response (200):**
```json
{
  "status": 200,
  "statusText": "OK",
  "message": "Categories fetched successfully",
  "data": {
    "total": 3,
    "categories": [
      { "name": "modern", "count": 35 },
      { "name": "classic", "count": 15 },
      { "name": "creative", "count": 12 }
    ]
  }
}
```

---

### 8. `GET /api/templates/{id}`

Get metadata for a single template.

**Path param:** `id` (integer, 1-62)

**Success Response (200):**
```json
{
  "status": 200,
  "statusText": "OK",
  "message": "Template fetched successfully",
  "data": {
    "id": 1,
    "slug": "minimalist-clean",
    "name": "The Minimalist",
    "description": "Clean, structured layout",
    "category": "modern",
    "thumbnail": "/static/templates/thumb/1.png",
    "color_scheme": { "primary": "#2c3e50", "secondary": "#f7f9fa", "text": "#333333", "accent": "#2c3e50" },
    "font_family": "Inter, sans-serif",
    "layout": "two_column",
    "is_premium": false,
    "template_file": "resume_1_minimalist.html",
    "sections": ["summary", "experience", "education", "skills"],
    "tags": ["minimal", "corporate", "ats-friendly"],
    "render_url": "https://resume.codekrafters.co.in/api/templates/1/render",
    "preview_url": "https://resume.codekrafters.co.in/api/templates/1/preview"
  }
}
```

**Errors:** 404 Template not found

---

### 9. `POST /api/templates/{id}/render`

Render a template with resume data and return HTML inside a JSON response.

**Request:**
- Content-Type: `application/json`
- Body (any of these):

```json
{ "resume": { "<JSON Resume>" } }
{ "resume_data": { "<JSON Resume>" } }
{ "data": { "<JSON Resume>" } }
{ "upload_id": "64f1a2b3c4d5e6f7a8b9c0d1" }
```

**Success Response (200):**
```json
{
  "status": 200,
  "statusText": "OK",
  "message": "Template rendered successfully",
  "data": {
    "template_id": 1,
    "template_name": "The Minimalist",
    "html": "<!DOCTYPE html><html>...</html>"
  }
}
```

**Errors:** 400 No resume data, 404 Template not found, 500 Render error

---

### 10. `GET /api/templates/{id}/preview`

Render a template preview as raw HTML (useful for `<iframe src="...">`).

**Path param:** `id` (integer)
**Query param:** `upload_id` (optional, MongoDB ObjectId)

- With `upload_id`: renders that resume, `Cache-Control: no-store`
- Without `upload_id`: renders sample data, `Cache-Control: public, max-age=3600`

**Response:** Raw `text/html` (not JSON)

```html
<!DOCTYPE html>
<html>
  <head>...</head>
  <body>... rendered resume ...</body>
</html>
```

**Usage in Next.js:**
```tsx
<iframe
  src={`https://resume.codekrafters.co.in/api/templates/${templateId}/preview?upload_id=${uploadId}`}
  className="w-full h-full border-0"
/>
```

---

### 11. `POST /api/templates/{id}/html`

Same as `/render` but returns raw HTML (for iframe `srcDoc` live previews).

**Request:** Same as `/render`

**Response:** Raw `text/html` (not JSON), `Cache-Control: no-store`

---

## Resume Data Format (JSON Resume)

All endpoints accept data in [JSON Resume](https://jsonresume.org/schema/) format:

```json
{
  "basics": {
    "name": "John Doe",
    "label": "Software Engineer",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "url": "https://johndoe.com",
    "location": { "city": "New York", "region": "NY", "countryCode": "US" },
    "summary": "Software engineer with 5+ years of experience..."
  },
  "work": [
    {
      "name": "Tech Corp",
      "position": "Senior Developer",
      "startDate": "2021-01",
      "endDate": "2024-01",
      "summary": "Led development of...",
      "highlights": ["Built X, reducing costs by 30%", "Managed team of 5"]
    }
  ],
  "education": [
    {
      "institution": "MIT",
      "area": "Computer Science",
      "studyType": "Bachelor",
      "startDate": "2015",
      "endDate": "2019"
    }
  ],
  "skills": [
    { "name": "JavaScript", "level": "Advanced", "keywords": ["React", "Node.js"] }
  ],
  "projects": [
    {
      "name": "Open Source Project",
      "description": "A tool for...",
      "highlights": ["500+ GitHub stars"],
      "startDate": "2020",
      "endDate": "2023"
    }
  ]
}
```

---

## ATS Score Breakdown

| Category | Weight | What It Checks |
|----------|--------|----------------|
| Contact Info | 10% | Email, phone, location, LinkedIn |
| Summary | 10% | Length, relevance, keywords |
| Work Experience | 25% | Bullet points, action verbs, relevance |
| Quantification | 15% | Numbers, metrics, percentages in bullets |
| Skills | 15% | Relevance, grouping, format |
| Education | 10% | Degree, dates, relevance |
| Projects | 10% | Presence, description quality |
| Certifications | 5% | Presence, relevance |

---

## CORS

All endpoints include CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
```

Preflight `OPTIONS` requests return `204 No Content`.

---

## Error Response Formats

### Standard Error (upload-resume, resume endpoints):
```json
{
  "status": 400,
  "statusText": "Bad Request",
  "message": "No file field in request",
  "data": {
    "resume_file": null,
    "resume_analysed": false,
    "parsed_data": {
      "status": "error",
      "message": "No file field in request",
      "code": "NO_FILE_FIELD",
      "data": null
    }
  }
}
```

### Simple Error (ats-analyze, templates):
```json
{
  "status": 400,
  "statusText": "Bad Request",
  "message": "Missing or invalid resume data",
  "data": null
}
```
