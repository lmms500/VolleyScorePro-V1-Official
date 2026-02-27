---
name: skill-creator
description: >
  Create new skills, modify and improve existing skills, and validate skill structure.
  Use when users want to create a skill from scratch, update or optimize an existing
  skill, debug skill triggering issues, validate a skill's SKILL.md format, audit
  all skills, or improve skill descriptions and decision trees.
---

# Skill Creator

## Decision Tree

```
Skill task → What type?
    ├─ Create new skill → Full workflow (Steps 1-5) below
    ├─ Improve existing skill → Read + validate against checklist
    ├─ Skill not triggering → Troubleshooting Triggers below
    ├─ Validate structure → Validation Checklist below
    ├─ Audit all skills → Read each + check against guidelines
    └─ Register in router → Update dev/SKILL.md tables
```

Create and iterate on agent skills for VolleyScore-Pro.

## Workflow

```
1. Capture Intent → 2. Interview → 3. Write SKILL.md → 4. Test → 5. Iterate
```

## Step 1: Capture Intent

1. What should this skill enable Claude to do?
2. When should this skill trigger? (keywords, contexts)
3. What's the expected output format?
4. Does it need test cases?

## Step 2: Interview & Research

- Ask about edge cases, input/output formats, success criteria
- Check existing skills in `.claude/skills/` for overlap
- Review the `dev/SKILL.md` router to understand trigger classification

## Step 3: Write the SKILL.md

### File Structure

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description required)
│   └── Markdown instructions
└── references/ (optional - docs loaded as needed)
```

### Frontmatter Template

```yaml
---
name: skill-name
description: >
  Clear description of what this skill does AND when to use it.
  Include trigger contexts. Be slightly "pushy" — mention related
  keywords that should also trigger this skill.
---
```

### Writing Guidelines

- **Imperative form** for instructions ("Use X", "Check Y")
- **Explain WHY** things matter instead of heavy MUST/NEVER
- **Include examples** with Input/Output patterns
- **Decision trees** at the top for quick routing
- Keep under 500 lines — use `references/` for detailed docs
- **Progressive disclosure**: metadata → body → references

### VolleyScore-Pro Naming Convention

All skill files in this project follow the pattern:
- Folder: `kebab-case` (e.g., `code-review/`)
- File: `UPPER-KEBAB-CASE.md` (e.g., `CODE-REVIEW.md`)
- Exception: the `dev/SKILL.md` router uses standard naming

## Step 4: Register in Router

After creating a skill, update `.claude/skills/dev/SKILL.md` to add:
1. A row in the appropriate trigger table (UI, Game, Infrastructure, etc.)
2. Relevant entries in the Decision Matrix

## Step 5: Validate

Checklist:
- [ ] YAML frontmatter has `name` and `description`
- [ ] Description includes trigger keywords
- [ ] Decision tree at the top of the skill
- [ ] Examples included for non-obvious patterns
- [ ] Under 500 lines
- [ ] No overlap with existing skills (or documented as complementary)
- [ ] Registered in `dev/SKILL.md` router
- [ ] Uses project conventions (path aliases, TypeScript, design system)

## Troubleshooting Triggers

If a skill isn't activating when expected:
1. Check the `description` field — it's the primary trigger mechanism
2. Add more specific keywords and contexts
3. Make the description slightly more "pushy" about when to activate
4. Verify it's listed in the `dev/SKILL.md` router tables
