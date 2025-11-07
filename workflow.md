# Claude Code Workflow Guide

This document defines collaboration conventions for working with Claude Code. Follow these principles consistently across all sessions.

---

## 🎯 Core Principles

### Context-First Development
**Before implementing any feature:**
1. Read relevant existing code to understand patterns and conventions
2. Identify similar implementations to maintain consistency
3. Respect established architecture and naming conventions
4. Ask if patterns are unclear or conflicting

### Incremental Development
- Build features in small, testable increments
- Verify each step works before moving to the next
- Make frequent commits at logical checkpoints
- Avoid large, monolithic changes

### Task Management
**Use TodoWrite tool when:**
- Task has 3+ distinct steps
- Multiple files need modification
- User provides a list of items to complete
- Work is complex enough to benefit from tracking

**Don't use TodoWrite for:**
- Single, straightforward actions
- Quick clarification responses
- Simple file edits

---

## 💬 Communication & Planning

### Communication Style
**Core principle**: Be concise, clear, and to the point.

**When presenting options, approaches, or guides:**
- Keep explanations brief and focused
- Use bullet points, not paragraphs
- Provide 2-4 options maximum (not exhaustive lists)
- State the key trade-off for each option in 1-2 sentences
- Don't provide in-depth technical explanations unless asked
- For step-by-step guides: numbered list with clear, actionable steps

**Examples of good vs bad:**

❌ **Too verbose**: "When it comes to state management in React applications, there are numerous approaches you could consider. First, there's the Context API, which is a built-in React feature that was introduced in version 16.3. It provides a way to pass data through the component tree without having to pass props down manually at every level. The Context API consists of two main components: the Provider and the Consumer. The Provider component wraps around your component tree and accepts a value prop that will be accessible to all descendants. The Consumer component allows you to access the context value in your components. However, it's worth noting that..."

✅ **Concise**: "Two main options for state management:
1. **Context API** - Built-in, simple, good for small-medium apps. Can cause unnecessary re-renders at scale.
2. **Zustand** - External library, better performance, easier testing. Adds dependency.

Recommend Context API for your project size. Preference?"

**Apply this to:**
- Clarifying questions
- Technical explanations
- Step-by-step instructions
- Architectural recommendations
- Error explanations

**Exception**: Provide detailed explanations when specifically asked ("explain in detail", "how does X work", etc.)

### Clarifying Requirements
**Trigger**: Feature request with multiple viable approaches OR ambiguous requirements

**Response pattern:**
1. Identify the ambiguities or decision points
2. Propose 2-3 concrete options
3. List pros/cons for each
4. Recommend one with clear reasoning
5. Wait for confirmation before implementing

**Example**: "There are two main approaches for state management here: Context API vs Zustand. Context API is built-in and sufficient for your current scale. Zustand adds a dependency but offers better performance at scale and simpler testing. Given your project size, I recommend Context API. Which would you prefer?"

### Proactive Offers
**When you can perform an action the user could also do:**
- Explicitly offer: "I can run `npm test` for you, or you can run it yourself if you'd like to see the output directly."
- Don't assume - let user choose
- Applies to: terminal commands, file creation, git operations, package installation

### Debugging Assistance
**When errors occur but details are insufficient:**
1. Request specific diagnostic information
2. Suggest exact commands to run for better error output
3. Add logging/debugging statements in next iteration
4. Explain what you're looking for and why

**Example**: "The error is vague. Can you run this with verbose logging: `xcodebuild -verbose ...` This will show us the exact linker failure."

---

## 🎨 UI/UX Development

### Precision Cloning Mode
**Trigger**: User provides design reference (screenshot, Figma mockup, existing app, etc.)

**Workflow:**
1. **Analyze first, code later**
   - Document all visual attributes: colors (exact hex), font sizes, weights, families
   - Measure spacing: margins, padding, gaps between elements
   - Note layout structure: stack, grid, absolute positioning
   - Identify icons, shadows, borders, corner radius

2. **Ask clarifying questions** about:
   - Ambiguous colors or measurements
   - Interactive states (hover, pressed, disabled)
   - Responsive behavior
   - Animations or transitions

3. **Acknowledge limitations**:
   - "I can't perfectly match this custom font - closest system alternative is..."
   - "This shadow effect may need manual tuning..."

4. **Iterate with visual feedback**:
   - Request screenshots after each iteration
   - Compare side-by-side with reference
   - Make pixel-perfect adjustments

**Goal**: Exact replication, not approximation.

### Component Philosophy
- **Before creating**: Search for existing components that can be reused or extended
- **When creating**: Design for reusability (props, composition, variants)
- **Naming**: Follow established component naming patterns
- **Location**: Place in appropriate directory per project structure
- **Document**: Add JSDoc/comments for complex props or usage patterns

### UX Decision-Making
**When specs lack UX details:**
- Apply platform conventions (iOS HIG, Material Design, Web standards)
- Prioritize accessibility (WCAG guidelines, semantic HTML, ARIA)
- Follow established UX principles:
  - Provide feedback for user actions
  - Prevent errors where possible
  - Support keyboard navigation
  - Respect system preferences (dark mode, reduced motion)
- Think like a designer: balance aesthetics with usability

---

## ⚙️ Code Quality & Architecture

### Future-Proof Thinking
**Design every feature considering:**
- **Scalability**: Will this work with 10x the data? 100x?
- **Maintainability**: Can another developer understand this in 6 months?
- **Flexibility**: How hard is it to modify if requirements change?
- **Performance**: What are the performance characteristics? (O(n), O(n²)?)
- **Testability**: Can this be easily unit tested?

**Patterns to favor:**
- Dependency injection over hard-coded dependencies
- Composition over inheritance
- Pure functions where possible
- Clear separation of concerns
- Meaningful variable/function names (not generic names like `data`, `temp`, `handleClick`)

### Error Handling
**Implement defensive coding:**
- Validate inputs at boundaries
- Handle edge cases explicitly (null, undefined, empty arrays, zero, negative numbers)
- Use type guards in TypeScript
- Provide meaningful error messages
- Fail gracefully with user-friendly fallbacks
- Log errors with enough context for debugging

**Don't:**
- Silently swallow errors
- Use generic try/catch without specific handling
- Leave console.logs in production code

### Testing Strategy
**Write tests when:**
- Implementing complex business logic
- Building reusable utilities or functions
- Creating critical user flows (auth, payment, data submission)
- Bug fixing (write test that fails, then fix to make it pass)

**Test types:**
- Unit tests: Pure functions, utilities, individual components
- Integration tests: Component interactions, API flows
- E2E tests: Critical user journeys (when infrastructure exists)

**Don't test:**
- Third-party library internals
- Trivial getters/setters
- Simple UI components without logic

### Dependency Management
**Before adding a new dependency, ask:**
1. Can I implement this myself in <1 hour with reasonable quality?
2. Is this dependency well-maintained? (recent updates, active issues)
3. What's the bundle size impact?
4. Does it bring transitive dependencies?

**Add dependencies for:**
- Complex functionality (date parsing, validation, state management)
- Proven solutions to hard problems (security, i18n)
- Significant time savings

**Implement yourself for:**
- Simple utilities (debounce, throttle, clamp)
- Project-specific logic
- Learning opportunities

### Self-Review Before Completion
**Before marking task complete:**
- Read through all changed code
- Check for: unused imports, console.logs, commented code, TODOs
- Verify naming is clear and consistent
- Ensure formatting matches project style
- Test edge cases manually
- Confirm no new warnings or errors

---

## 📝 Documentation

### What to Document
**Always document:**
- Setup instructions (first-time project setup)
- Environment variables and configuration
- Architecture decisions (why X instead of Y)
- Complex algorithms or business logic
- Public APIs and their contracts
- Non-obvious code that required research

**Consider documenting:**
- Common troubleshooting steps
- Development workflows (build, test, deploy)
- Third-party service integrations

**Don't over-document:**
- Self-explanatory code
- Standard patterns
- Temporary implementation details

### When to Document
- **During development**: Comment complex logic inline
- **After feature completion**: Update README, API docs
- **Proactively**: When changes affect existing documentation, update it immediately

### Documentation Formats
- **README.md**: Project overview, setup, common tasks
- **Code comments**: Complex logic, gotchas, TODOs
- **JSDoc/DocStrings**: Public APIs, function contracts
- **Architecture docs**: High-level design decisions (when needed)

---

## 🔄 Version Control

### Commit Strategy
**Commit after:**
- Completing a logical unit of work (feature, bugfix, refactor)
- Before attempting risky changes
- Before switching tasks

**Commit message format:**
```
<type>: <description>

[optional body]
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`

**Examples:**
- `feat: add dark mode toggle to settings`
- `fix: prevent crash when user profile is null`
- `refactor: extract validation logic to utility functions`

**Include in commits:**
- Generated with Claude Code attribution (auto-added)
- Co-Authored-By: Claude (auto-added)

**Never commit:**
- Secrets, API keys, credentials
- `.env` files with real values
- Large binary files without reason

### When to Commit
**User explicitly requests**: Always honor request
**Completing multi-step feature**: Commit each major milestone
**Before risky refactor**: Commit stable state first
**Don't commit**: Works-in-progress unless explicitly asked

---

## 🔧 Platform-Specific Guidelines

### Xcode Projects

#### Creating New Projects
**Do not create Xcode project files directly** - this frequently fails.

**Instead, provide instructions:**
1. "Open Xcode"
2. "File > New > Project"
3. [Specific template to choose]
4. [Specific settings to configure]
5. "Once created, I can modify the source files"

#### Working with Existing Projects
- Read `.xcodeproj` or `.xcworkspace` to understand structure
- Modify source files (.swift, .m, .h) directly
- Don't manually edit project.pbxproj unless necessary
- Respect existing groups and folder structure

### SwiftUI Projects
- Favor SwiftUI modifiers over custom implementations
- Use proper state management (@State, @Binding, @StateObject, @ObservedObject)
- Preview code should be minimal and useful
- Follow Apple's API design guidelines

---

## 🔐 Security Practices

### Sensitive Data
- Never hardcode secrets, API keys, passwords
- Use environment variables or secure key storage
- Sanitize user input before processing
- Don't log sensitive data
- Use HTTPS for external requests

### Input Validation
- Validate at trust boundaries (API endpoints, user inputs)
- Use allowlists over blocklists when possible
- Escape output properly (XSS prevention)
- Rate limit where appropriate

---

## 🚀 Performance Considerations

### When to Optimize
**Optimize upfront for:**
- Known performance-critical paths (rendering, data processing)
- O(n²) or worse algorithms when n can be large
- Database queries

**Don't prematurely optimize:**
- One-time operations
- Code that runs infrequently
- Without measuring first

### Performance Patterns
- Memoize expensive computations
- Debounce/throttle frequent events
- Virtualize long lists
- Lazy load when appropriate
- Use proper data structures (Set for lookups, Map for key-value)

---

## 🔄 Meta-Workflow

### Continuous Improvement
**When user gives workflow feedback:**
1. Acknowledge the feedback
2. Ask: "Should I add this principle to workflow.md for future sessions?"
3. If yes, propose specific wording
4. Update this document

### Session Continuity
**At session start:**
- This workflow.md is your primary guidance
- When in conflict, this document takes precedence
- Suggest improvements when you notice workflow gaps

---

## ⚡ Quick Reference

| Situation | Response |
|-----------|----------|
| Presenting options, guides, or explanations | Be concise: bullet points, 2-4 options max, key trade-offs only |
| Feature request with multiple approaches | Ask clarifying questions, propose 2-3 options with pros/cons |
| UI cloning from design | Enter precision mode: analyze thoroughly, ask questions, iterate with screenshots |
| Before creating new component | Search for existing reusable components first |
| Complex task (3+ steps) | Use TodoWrite to track progress |
| Can perform action yourself | Offer explicitly: "I can do X, or you can do it yourself" |
| Insufficient error details | Guide user to get diagnostics OR add debugging statements |
| New Xcode project | Provide setup instructions, don't create files |
| Completed feature | Self-review, update docs if needed |
| User gives workflow feedback | Ask if should be added to workflow.md |
| Adding dependency | Ask: Can I build this quickly? Is it well-maintained? |
| Before committing | Ensure no secrets, remove console.logs, follow commit format |
| Writing tests | Focus on business logic, utilities, critical flows |
| Unclear UX specs | Apply platform conventions and UX best practices |

---

## 📋 Checklist Template

**Before marking any feature complete:**
- [ ] Code is self-reviewed
- [ ] Naming is clear and consistent
- [ ] Edge cases are handled
- [ ] No console.logs or commented code
- [ ] Tests added (if applicable)
- [ ] Documentation updated (if needed)
- [ ] Committed with clear message (if requested)
- [ ] No secrets or sensitive data included

---

*Last updated: 2025-10-29 (added Communication Style principle)*
