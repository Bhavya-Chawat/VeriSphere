# VeriSphere REST API Documentation

Base URL: `http://localhost:4000/api`

Authentication: Requires `Authorization: Bearer <clerk-jwt-token>` or `x-api-key: <org-secret-key>` on all endpoints except health checks.

---

## 📌 Endpoint: Candidate Intake (Trigger Verification)

- **URL**: `/verification/intake`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Payload Request**:
```json
{
  "firstName": "Sarah",
  "lastName": "Jenkins",
  "email": "sarah.j@gmail.com",
  "githubUrl": "https://github.com/sarahj-dev",
  "resumeFileUrl": "https://uploadthing.com/f/sarah-resume.pdf",
  "certificateUrls": [
    "https://uploadthing.com/f/aws-cert.pdf"
  ]
}
```
- **Response Shape (202 Accepted)**:
```json
{
  "success": true,
  "candidateId": "cand-99b3-4f9e-ba21-12f5a6b0c2e9",
  "jobId": "job-11b3-4f9e-ba21-12f5a6b0c2a1"
}
```
- **Errors**:
  - `400 Bad Request`: Email address format invalid or GitHub URL malformed.
  - `401 Unauthorized`: API Key or session token expired.

---

## 📌 Endpoint: Retrieve Verification Job Status

- **URL**: `/verification/jobs/:jobId/status`
- **Method**: `GET`
- **Response Shape (200 OK)**:
```json
{
  "jobId": "job-11b3-4f9e-ba21-12f5a6b0c2a1",
  "status": "ANALYZING",
  "progressPercent": 60,
  "startedAt": "2026-06-05T12:00:01.000Z",
  "completedAt": null,
  "errors": []
}
```
- **Errors**:
  - `404 Not Found`: Job ID does not exist.

---

## 📌 Endpoint: Fetch Audit Report & Questions

- **URL**: `/verification/reports/:jobId`
- **Method**: `GET`
- **Response Shape (200 OK)**:
```json
{
  "candidate": {
    "id": "cand-99b3-4f9e-ba21-12f5a6b0c2e9",
    "firstName": "Sarah",
    "lastName": "Jenkins",
    "email": "sarah.j@gmail.com",
    "githubUrl": "https://github.com/sarahj-dev"
  },
  "job": {
    "id": "job-11b3-4f9e-ba21-12f5a6b0c2a1",
    "status": "COMPLETED",
    "startedAt": "2026-06-05T12:00:01.000Z",
    "completedAt": "2026-06-05T12:00:15.000Z"
  },
  "report": {
    "findingsSummary": "Candidate demonstrates strong knowledge of Go backend frameworks but shows high code similarity on frontend React projects to boilerplate repos.",
    "semanticMatches": [
      {
        "claimedSkill": "Go Frameworks",
        "matchedRepo": "go-rest-api",
        "evidenceLevel": "STRONG",
        "notes": "42 commits across 4 months matches resume claim durations."
      }
    ],
    "contradictions": [
      "Claims production Kubernetes management, but GitHub repos feature zero configuration files or push history to cluster definitions."
    ],
    "riskIndicators": [
      {
        "category": "CLONED_REPOSITORY",
        "severity": "MEDIUM",
        "description": "Frontend template cloning detected.",
        "evidence": "Matches visual mock assets on public repositories."
      }
    ],
    "trustScore": {
      "overallScore": 76,
      "resumeConsistency": 80,
      "githubEvidence": 70,
      "certificateValidity": 95,
      "contributionConfidence": 65,
      "activityConfidence": 70
    }
  },
  "questions": [
    {
      "id": "q-1",
      "question": "Your resume details production Kubernetes architecture, but your public code utilizes local docker-compose environments exclusively. Can you explain your cluster setup workflow?",
      "targetedSkillOrClaim": "Kubernetes Administration",
      "difficulty": "MEDIUM"
    }
  ]
}
```

---

## 📌 Endpoint: Manage API Keys (Admin)

- **URL**: `/admin/keys`
- **Method**: `POST`
- **Payload Request**:
```json
{
  "name": "Production ATS Integration Key"
}
```
- **Response Shape (201 Created)**:
```json
{
  "id": "key-uuid",
  "name": "Production ATS Integration Key",
  "apiKey": "vs_live_83ba91ef0021bcda993f...",
  "note": "Copy this key now. It will never be displayed in plain text again."
}
```
