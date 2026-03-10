---
name: website-to-llms-txt
description: Use when editing website-to-llms-txt. GET /llms.txt?url=; returns plain-text llms.txt format (title, description, links, contact); no bindings.
---

# Website to llms.txt

- **Route**: `GET /llms.txt?url=`
- **Inputs**: `url` (required, http/https).
- **Outputs**: `text/plain` body in llms.txt style (H1, blockquote, Key Information, Contact).
- **Bindings**: None.
