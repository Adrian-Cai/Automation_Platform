# AI Requirement Parse Schema Review Notes

This document captures the proposed database shape for the AI workbench "Requirement Input & Parsing" feature for DBA review. It is intentionally **not** a runnable initialization script: production table structures are managed by the DBA, and agents must not ship local `CREATE TABLE` or seed-data scripts for these tables.

## Review guardrails

- Treat these notes as a schema-review artifact only; do not apply them directly to an environment.
- Final DDL, migrations, seed data, naming adjustments, and rollout order must be produced through the DBA-managed schema process.
- `Auto_Users.id` is documented as `int(11)`, so every proposed user reference column below must use `INT(11)` with matching signedness before a foreign key to `Auto_Users(id)` is approved.
- Proposed AI feature entity identifiers can remain `BIGINT` where they only reference other new AI requirement-parse tables.
- Large AI inputs, prompts, model responses, and extracted content should use large text columns; structured model output can use JSON columns if the target MySQL/MariaDB version supports it.

## Proposed tables

| Table | Purpose | Key relationships |
| --- | --- | --- |
| `AI_Requirement_Parse_Task` | Root record for a requirement parsing task, including title, product line, raw/cleaned text, status, progress, counts, timing, and failure details. | `created_by` -> `Auto_Users(id)` using `INT(11)`; child table root for attachments, parse config, stage logs, results, modules, test-point suggestions, and model call logs. |
| `AI_Requirement_Attachment` | Uploaded attachment metadata and extracted text for a task. | `task_id` -> `AI_Requirement_Parse_Task(id)`; `created_by` -> `Auto_Users(id)` using `INT(11)`. |
| `AI_Cleaning_Rule` | Reusable text-cleaning rules such as empty-line removal and whitespace normalization. | Referenced by `AI_Task_Cleaning_Rule`. |
| `AI_Task_Cleaning_Rule` | Per-task selected cleaning rules and execution snapshots. | `task_id` -> `AI_Requirement_Parse_Task(id)`; `rule_id` -> `AI_Cleaning_Rule(id)`. |
| `AI_Task_Parse_Config` | Per-task parser options, model selection, prompt version, language, and generation toggles. | One-to-one with `AI_Requirement_Parse_Task`. |
| `AI_Parse_Stage_Log` | Stage-level parse progress, status, timing, messages, and errors. | `task_id` -> `AI_Requirement_Parse_Task(id)`. |
| `AI_Requirement_Parse_Result` | Overall AI-generated summary and structured parse output. | One-to-one with `AI_Requirement_Parse_Task`. |
| `AI_Requirement_Module` | Functional modules recognized from the requirement. | `task_id` -> `AI_Requirement_Parse_Task(id)`; parent for requirement items. |
| `AI_Requirement_Item` | Structured requirement items, source text, acceptance criteria, priority, and confidence. | `task_id` -> `AI_Requirement_Parse_Task(id)`; optional `module_id` -> `AI_Requirement_Module(id)`. |
| `AI_Requirement_Question` | Ambiguities/questions identified during parsing and their answer workflow. | `task_id` -> `AI_Requirement_Parse_Task(id)`; optional `requirement_item_id` -> `AI_Requirement_Item(id)`; `answered_by` -> `Auto_Users(id)` using `INT(11)`. |
| `AI_Requirement_Risk` | Requirement risks, impact/probability, mitigation, and resolution workflow. | `task_id` -> `AI_Requirement_Parse_Task(id)`; optional `requirement_item_id` -> `AI_Requirement_Item(id)`; `resolved_by` -> `Auto_Users(id)` using `INT(11)`. |
| `AI_Test_Point_Suggestion` | AI-suggested test points derived from modules and requirement items. | `task_id` -> `AI_Requirement_Parse_Task(id)`; optional `module_id` -> `AI_Requirement_Module(id)`; optional `requirement_item_id` -> `AI_Requirement_Item(id)`; optional conversion reference to `Auto_TestCase(id)` pending DBA validation of that parent key type. |
| `AI_Model_Call_Log` | Prompt, response, latency, token, status, and error audit trail for AI calls. | `task_id` -> `AI_Requirement_Parse_Task(id)`. |

## User foreign-key columns requiring `INT(11)`

| Table | Column | Referenced table | Required type alignment |
| --- | --- | --- | --- |
| `AI_Requirement_Parse_Task` | `created_by` | `Auto_Users(id)` | `INT(11)` |
| `AI_Requirement_Attachment` | `created_by` | `Auto_Users(id)` | `INT(11)` |
| `AI_Requirement_Question` | `answered_by` | `Auto_Users(id)` | `INT(11)` |
| `AI_Requirement_Risk` | `resolved_by` | `Auto_Users(id)` | `INT(11)` |

## DBA review checklist

1. Confirm final table names, ownership, comments, charset, collation, and storage engine.
2. Validate every parent key type before approving foreign keys, especially references to existing `Auto_Users` and `Auto_TestCase` tables.
3. Decide whether status fields should remain strings or use DBA-approved constrained values.
4. Decide whether JSON fields are acceptable for the deployed MySQL/MariaDB version and reporting requirements.
5. Produce official DDL and any default cleaning-rule seed data through the DBA-controlled migration/release process.
