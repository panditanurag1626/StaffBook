# Resume-Pro API Documentation

**Base URL:** `http://localhost:3000` (development)  
**Total Endpoints:** 17 functional + 16 OPTIONS (CORS)

---

## Quick Reference

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | POST | `/api/upload-resume` | Upload resume file (PDF/DOCX/TXT/IMG) |
| 2 | GET | `/api/resume/{upload_id}` | Fetch stored resume by ID |
| 3 | GET | `/api/jsonresume/{upload_id}` | Fetch resume with JSON Resume schema |
| 4 | GET | `/api/schema` | Get JSON Resume schema + sample |
| 5 | POST | `/api/ats-analyze` | Full ATS score analysis |
| 6 | POST | `/api/jd-match` | Match resume vs job description |
| 7 | POST | `/api/ai-generate-text` | AI generate achievement bullets |
| 8 | POST | `/api/ai-apply` | Apply all AI suggestions |
| 9 | POST | `/api/ai-apply/summary` | Apply summary rewrite only |
| 10 | POST | `/api/ai-apply/keywords` | Apply keyword suggestions only |
| 11 | POST | `/api/ai-apply/verbs` | Apply action verb upgrades only |
| 12 | GET | `/api/templates` | List all templates (with filters) |
| 13 | GET | `/api/templates/categories` | List template categories |
| 14 | GET | `/api/templates/{id}` | Get single template metadata |
| 15 | GET | `/api/templates/{id}/preview` | Preview template HTML |
| 16 | POST | `/api/templates/{id}/render` | Render template to HTML (JSON) |
| 17 | POST | `/api/templates/{id}/html` | Render template to HTML (raw) |
| 18 | POST | `/api/templates/{id}/pdf` | Generate PDF download |

---

## 1. Upload Resume

```
POST /api/upload-resume
```

**Content-Type:** `multipart/form-data`

**Body (form field):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Resume file (.pdf, .docx, .txt, .png, .jpg) — Max 16 MB |

**Example (fetch):**

```js
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const res = await fetch("http://localhost:3000/api/upload-resume", {
  method: "POST",
  body: formData,
});
const data = await res.json();
```

**Example (curl):**

```bash
curl -X POST http://localhost:3000/api/upload-resume \
  -F "file=@resume.pdf"
```

**Response:**

```json
{
  "ok": true,
  "upload_id": "664f1a2b3c...",
  "resume": { /* JSON Resume object */ },
  "ats_scores": { /* ATS compatibility scores */ }
}
```

---

## 2. Get Resume by ID

```
GET /api/resume/{upload_id}
```

| Param | Type | In | Description |
|-------|------|----|-------------|
| `upload_id` | string | path | MongoDB ObjectId |

**Example:**

```js
const res = await fetch("http://localhost:3000/api/resume/664f1a2b3c...");
const data = await res.json();
```

**Response:**

```json
{
  "ok": true,
  "resume": { /* JSON Resume object */ },
  "filename": "my_resume.pdf",
  "ats_scores": { /* ATS scores */ }
}
```

---

## 3. Get JSON Resume by ID

```
GET /api/jsonresume/{upload_id}
```

Same as `/api/resume/{upload_id}` but includes JSON Resume schema metadata.

| Param | Type | In | Description |
|-------|------|----|-------------|
| `upload_id` | string | path | MongoDB ObjectId |

**Example:**

```js
const res = await fetch("http://localhost:3000/api/jsonresume/664f1a2b3c...");
const data = await res.json();
```

**Response:**

```json
{
  "ok": true,
  "schema": "https://jsonresume.org/schema/",
  "resume": { /* JSON Resume object */ },
  "ats_scores": { /* ATS scores */ }
}
```

---

## 4. Get JSON Resume Schema

```
GET /api/schema
```

**Example:**

```js
const res = await fetch("http://localhost:3000/api/schema");
const data = await res.json();
```

**Response:**

```json
{
  "ok": true,
  "schema_version": "v1.0.0",
  "schema_url": "https://jsonresume.org/schema/",
  "sample_resume": { /* Complete sample JSON Resume */ }
}
```

---

## 5. ATS Analyze

```
POST /api/ats-analyze
```

**Body (any one shape):**

```json
{
  "resume": { /* JSON Resume */ }
}
```

or

```json
{
  "upload_id": "664f1a2b3c..."
}
```

**Example:**

```js
const res = await fetch("http://localhost:3000/api/ats-analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resume: jsonResumeObject }),
});
const data = await res.json();
```

**Response:**

```json
{
  "ok": true,
  "rule_based": { /* Rule-based ATS scores */ },
  "ai_analysis": { /* AI-powered feedback */ }
}
```

---

## 6. JD Match

```
POST /api/jd-match
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | object | Yes | JSON Resume object |
| `job_description` | string | Yes | Job description text |

**Example:**

```js
const res = await fetch("http://localhost:3000/api/jd-match", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    resume: jsonResumeObject,
    job_description: "We are looking for a React developer...",
  }),
});
const data = await res.json();
```

**Response:**

```json
{
  "ok": true,
  "match_score": 78,
  "matched_keywords": ["react", "javascript", "node.js"],
  "missing_keywords": ["typescript", "aws"],
  "suggestions": ["Add TypeScript experience..."]
}
```

---

## 7. AI Generate Text

```
POST /api/ai-generate-text
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | object | Yes | JSON Resume object |
| `attempt_number` | number | No | 1 (balanced), 2 (technical/FAANG), 3 (leadership/startup) |

**Example:**

```js
const res = await fetch("http://localhost:3000/api/ai-generate-text", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resume: jsonResumeObject, attempt_number: 1 }),
});
const data = await res.json();
```

**Response:**

```json
{
  "ok": true,
  "generated_text": "Led migration of monolithic architecture...",
  "attempt_number": 1
}
```

---

## 8. AI Apply (All Suggestions)

```
POST /api/ai-apply
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | object | Yes | JSON Resume object |
| `ai_analysis` | object | Yes | Contains `summary_rewrite`, `keyword_suggestions`, `action_verb_upgrades` |

**Example:**

```js
const res = await fetch("http://localhost:3000/api/ai-apply", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    resume: jsonResumeObject,
    ai_analysis: {
      summary_rewrite: "Senior engineer with 8+ years...",
      keyword_suggestions: [{ keyword: "TypeScript", section: "skills" }],
      action_verb_upgrades: [{ from: "helped", to: "spearheaded" }],
    },
  }),
});
const data = await res.json();
```

**Response:**

```json
{
  "ok": true,
  "resume": { /* Updated JSON Resume */ },
  "changes": ["Summary rewritten", "1 keyword added", "1 verb upgraded"]
}
```

---

## 9. AI Apply Summary Only

```
POST /api/ai-apply/summary
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | object | Yes | JSON Resume object |
| `summary_rewrite` | string | Yes* | New summary text |

*or `summary` field

**Example:**

```js
const res = await fetch("http://localhost:3000/api/ai-apply/summary", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    resume: jsonResumeObject,
    summary_rewrite: "Results-driven engineer...",
  }),
});
const data = await res.json();
```

---

## 10. AI Apply Keywords Only

```
POST /api/ai-apply/keywords
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | object | Yes | JSON Resume object |
| `keyword_suggestions` | array | Yes | Array of keyword suggestion objects |

**Example:**

```js
const res = await fetch("http://localhost:3000/api/ai-apply/keywords", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    resume: jsonResumeObject,
    keyword_suggestions: [
      { keyword: "AWS", section: "skills" },
      { keyword: "microservices", section: "work" },
    ],
  }),
});
const data = await res.json();
```

---

## 11. AI Apply Verbs Only

```
POST /api/ai-apply/verbs
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | object | Yes | JSON Resume object |
| `action_verb_upgrades` | array | Yes | Array of verb upgrade objects |

**Example:**

```js
const res = await fetch("http://localhost:3000/api/ai-apply/verbs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    resume: jsonResumeObject,
    action_verb_upgrades: [
      { from: "helped", to: "spearheaded" },
      { from: "made", to: "engineered" },
    ],
  }),
});
const data = await res.json();
```

---

## 12. List Templates

```
GET /api/templates
```

**Query Parameters (all optional):**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | — | Filter: `"modern"`, `"classic"`, `"creative"` |
| `is_premium` | string | — | `"true"`/`"1"` or `"false"`/`"0"` |
| `search` | string | — | Keyword search across name/description/tags |
| `page` | number | 1 | Pagination page |
| `limit` | number | 10 | Items per page |

> If neither `page` nor `limit` is provided, returns ALL templates.

**Example:**

```js
const res = await fetch(
  "http://localhost:3000/api/templates?category=modern&is_premium=false&page=1&limit=5"
);
const data = await res.json();
```

**Response:**

```json
{
  "ok": true,
  "templates": [
    {
      "id": 1,
      "name": "Minimalist",
      "category": "modern",
      "is_premium": false,
      "render_url": "http://localhost:3000/api/templates/1/render",
      "preview_url": "http://localhost:3000/api/templates/1/preview"
    }
  ],
  "pagination": { "page": 1, "limit": 5, "total": 62 }
}
```

---

## 13. Get Template Categories

```
GET /api/templates/categories
```

**Example:**

```js
const res = await fetch("http://localhost:3000/api/templates/categories");
const data = await res.json();
```

**Response:**

```json
{
  "ok": true,
  "total": 62,
  "categories": [
    { "name": "modern", "count": 25 },
    { "name": "classic", "count": 20 },
    { "name": "creative", "count": 17 }
  ]
}
```

---

## 14. Get Template by ID

```
GET /api/templates/{id}
```

| Param | Type | In | Description |
|-------|------|----|-------------|
| `id` | number | path | Template numeric ID (1–62) |

**Example:**

```js
const res = await fetch("http://localhost:3000/api/templates/1");
const data = await res.json();
```

**Response:**

```json
{
  "ok": true,
  "template": {
    "id": 1,
    "name": "Minimalist",
    "category": "modern",
    "is_premium": false,
    "render_url": "http://localhost:3000/api/templates/1/render",
    "preview_url": "http://localhost:3000/api/templates/1/preview"
  }
}
```

---

## 15. Preview Template HTML

```
GET /api/templates/{id}/preview
```

| Param | Type | In | Description |
|-------|------|----|-------------|
| `id` | number | path | Template numeric ID |
| `upload_id` | string | query | (Optional) MongoDB ObjectId for real data |

**Example:**

```js
// Preview with sample data
const res = await fetch("http://localhost:3000/api/templates/1/preview");
const html = await res.text(); // Returns raw HTML

// Preview with real resume
const res2 = await fetch(
  "http://localhost:3000/api/templates/1/preview?upload_id=664f1a2b3c..."
);
const html2 = await res2.text();
```

**Response:** Raw HTML (`Content-Type: text/html`)

---

## 16. Render Template (JSON)

```
POST /api/templates/{id}/render
```

| Param | Type | In | Description |
|-------|------|----|-------------|
| `id` | number | path | Template numeric ID |

**Body (any one shape):**

```json
{ "resume_data": { /* JSON Resume */ } }
```

or

```json
{ "upload_id": "664f1a2b3c..." }
```

**Example:**

```js
const res = await fetch("http://localhost:3000/api/templates/1/render", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resume_data: jsonResumeObject }),
});
const data = await res.json();
```

**Response:**

```json
{
  "ok": true,
  "template_id": 1,
  "template_name": "Minimalist",
  "html": "<!DOCTYPE html>..."
}
```

---

## 17. Render Template HTML (Raw)

```
POST /api/templates/{id}/html
```

| Param | Type | In | Description |
|-------|------|----|-------------|
| `id` | number | path | Template numeric ID |

**Body:** Same as `/render` endpoint. 

**Example:**

```js
const res = await fetch("http://localhost:3000/api/templates/1/html", { 
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ upload_id: "664f1a2b3c..." }),
});
const html = await res.text(); // Raw HTML
```

**Response:** Raw HTML (`Content-Type: text/html`)

---

## 18. Generate PDF

```
POST /api/templates/{id}/pdf
```

| Param | Type | In | Description |
|-------|------|----|-------------|
| `id` | number | path | Template numeric ID |

**Body (any one shape):**

```json
{ "resume": { /* JSON Resume */ } }
```

or

```json
{ "upload_id": "664f1a2b3c..." }
```

**Example:**

```js
const res = await fetch("http://localhost:3000/api/templates/1/pdf", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ upload_id: "664f1a2b3c..." }),
});
const blob = await res.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "resume.pdf";
a.click();
```

**Response:** Binary PDF (`Content-Type: application/pdf`)

---

## Common Response Envelope

All endpoints use a consistent envelope:

```json
// Success
{ "ok": true, ... }

// Error
{
  "ok": false,
  "status": 404,
  "statusText": "Not Found",
  "message": "Template not found"
}
```

---

## CORS

All `POST` endpoints support `OPTIONS` preflight requests for CORS. Include standard headers when calling from a different origin:

```js
const res = await fetch("http://localhost:3000/api/ats-analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Origin": "http://your-other-app.com",
  },
  body: JSON.stringify({ resume: jsonResumeObject }),
});
```
