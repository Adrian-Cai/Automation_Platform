# AI Requirement Parse schema review notes

> DBA review artifact only. This document is intentionally non-executable and must not be used as a local database initialization script.

## Purpose

The AI workbench **Requirement Input & Parsing** feature needs persistent storage for requirement parsing tasks, uploaded attachments, cleaning rules, parse configuration, stage logs, parse results, modules, structured requirement items, questions, risks, test-point suggestions, and model-call logs.

Production table structure is DBA-managed for this repository. Use this document as a schema-review checklist before DBA-approved DDL is produced and applied through the managed database-change process.

## Existing schema compatibility

- Existing user references must match `Auto_Users.id`, which is documented as `int(11)`.
- Any proposed column that references `Auto_Users(id)` should therefore use `INT(11)` with the same signedness as the parent column.
- Proposed feature-owned entity identifiers may use `BIGINT` only when they do not reference an existing `INT(11)` parent key.

## Proposed tables

| Table | Purpose | Key relationships |
| --- | --- | --- |
| `AI_Requirement_Parse_Task` | Core task record for a pasted/uploaded requirement parse flow. | `created_by INT(11)` → `Auto_Users(id)` |
| `AI_Requirement_Attachment` | Uploaded attachment metadata and extracted text. | `task_id` → `AI_Requirement_Parse_Task(id)`; `created_by INT(11)` → `Auto_Users(id)` |
| `AI_Cleaning_Rule` | DBA-approved text-cleaning rule definitions. | `created_by INT(11)` and `updated_by INT(11)` → `Auto_Users(id)` |
| `AI_Task_Cleaning_Rule` | Rules selected for a parsing task. | `task_id` → `AI_Requirement_Parse_Task(id)`; `rule_id` → `AI_Cleaning_Rule(id)` |
| `AI_Task_Parse_Config` | Per-task parsing and model configuration. | `task_id` → `AI_Requirement_Parse_Task(id)` |
| `AI_Parse_Stage_Log` | Per-stage parse progress and diagnostics. | `task_id` → `AI_Requirement_Parse_Task(id)` |
| `AI_Requirement_Parse_Result` | Overall AI-generated parse summary and structured JSON. | `task_id` → `AI_Requirement_Parse_Task(id)` |
| `AI_Requirement_Module` | AI-identified functional modules. | `task_id` → `AI_Requirement_Parse_Task(id)` |
| `AI_Requirement_Item` | Structured requirement points extracted from the source text. | `task_id` → `AI_Requirement_Parse_Task(id)`; `module_id` → `AI_Requirement_Module(id)` |
| `AI_Requirement_Question` | Open questions discovered during parsing. | `task_id` → `AI_Requirement_Parse_Task(id)`; `requirement_item_id` → `AI_Requirement_Item(id)`; `answered_by INT(11)` → `Auto_Users(id)` |
| `AI_Requirement_Risk` | Requirement risks found by parsing. | `task_id` → `AI_Requirement_Parse_Task(id)`; `requirement_item_id` → `AI_Requirement_Item(id)`; `resolved_by INT(11)` → `Auto_Users(id)` |
| `AI_Test_Point_Suggestion` | AI-generated test-point suggestions from requirement items. | `task_id` → `AI_Requirement_Parse_Task(id)`; `requirement_item_id` → `AI_Requirement_Item(id)` |
| `AI_Model_Call_Log` | Prompt, response, latency, and token usage diagnostics for model calls. | `task_id` → `AI_Requirement_Parse_Task(id)` |

## User foreign-key columns

The following user reference columns should be reviewed as `INT(11)` to match the existing `Auto_Users.id` definition:

| Table | Column | Reference |
| --- | --- | --- |
| `AI_Requirement_Parse_Task` | `created_by` | `Auto_Users(id)` |
| `AI_Requirement_Attachment` | `created_by` | `Auto_Users(id)` |
| `AI_Cleaning_Rule` | `created_by` | `Auto_Users(id)` |
| `AI_Cleaning_Rule` | `updated_by` | `Auto_Users(id)` |
| `AI_Requirement_Question` | `answered_by` | `Auto_Users(id)` |
| `AI_Requirement_Risk` | `resolved_by` | `Auto_Users(id)` |

## Data-shape guidance

- Use `VARCHAR` status fields rather than database enums so future state changes avoid table rebuilds.
- Use `LONGTEXT` for large AI inputs, cleaned content, prompts, model responses, and extracted attachment text.
- Use `JSON` for structured parse outputs and flexible model/provider metadata when supported by the target database version.
- Keep all DBA-approved constraints and indexes aligned with production naming conventions before implementation.
- Seed data, such as default cleaning rules, should be delivered through the managed DBA migration path rather than committed as local executable SQL.
