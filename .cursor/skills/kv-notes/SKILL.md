---
name: kv-notes
description: Use when editing kv-notes. POST/GET/DELETE /notes; Workers KV NOTES binding.
---

# KV Notes

- **Routes**: `POST /notes`, `GET /notes?id=`, `DELETE /notes?id=`
- **Response**: `{ id, content, updatedAt }`
- **Bindings**: KV namespace `NOTES`
