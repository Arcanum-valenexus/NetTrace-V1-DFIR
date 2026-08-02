# NetTrace V1 Enterprise Backend Development Rules

## CRITICAL DIRECTIVES
1. **100% Frontend Isolation**:
   - The React frontend is complete and production-ready.
   - NEVER modify any frontend file inside `src/` or `frontend/`.
   - NEVER modify React components, UI, styling, routes, or TypeScript models.
   - The backend MUST adapt strictly to the frontend specifications.

2. **Frontend Compatibility & Schema Rules**:
   - Do NOT rename frontend fields, parameter names, or property keys.
   - Do NOT rename API routes or endpoint paths.
   - Do NOT modify expected JSON response formats or structure.
   - Replace all frontend mock data with real production API endpoints.

3. **Frontend Inspection Requirement**:
   - Inspect all pages, components, buttons, modals, forms, API calls, states, uploads, charts, and tables before implementing endpoints.

4. **Enterprise Quality & Production Standard**:
   - Production code ONLY.
   - No placeholders in final implementations.
   - No fake APIs or dummy responses.
   - Everything must be fully connected to database repositories, services, and background workers.

5. **DFIR Core Requirements & Forensic Standards**:
   - Every feature must adhere strictly to Digital Forensics & Incident Response (DFIR) best practices.
   - Cryptographic hashing (SHA256, MD5, SHA1) must be computed for all uploaded evidence.
   - Digital Chain of Custody must be immutable and audit-logged.
   - Audit logs must be created for every critical security event and analyst action.
   - Every API endpoint must enforce Role-Based Access Control (RBAC) and permission guards.

6. **Transactional Atomicity & Data Consistency**:
   - Every multi-table database operation MUST use atomic SQLAlchemy 2.0 transactions (`async with session.begin()` or atomic unit of work in services).
   - If any step fails, automatic rollback MUST occur immediately. Never leave partial data.

7. **Backend Progress Tracking**:
   - Maintain `backend_progress_doc.md` after every phase update documenting completed modules, pending modules, database tables, APIs, services, repositories, schemas, test results, and remaining work.
