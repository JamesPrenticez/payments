# Build Specification: Payment Simulator

## 1. Project Goal

Build a full-stack payment-processing simulator that demonstrates how reliable payment systems handle successful payments, failures, retries, duplicate requests and uncertain provider outcomes.

The application will have a Vue dashboard and a C# ASP.NET Core API backed by PostgreSQL. A deterministic mock payment provider will simulate external payment processing without moving real money.

The project should be developed incrementally. Each milestone must produce a working application, with automated tests added alongside the functionality they verify.

### Primary learning objectives

- Build a typed, full-stack application using Vue, TypeScript and C#.
- Design REST APIs and relational database models.
- Implement idempotency and safe retry behaviour.
- Handle concurrent requests and database transactions correctly.
- Model payment state transitions and ambiguous outcomes.
- Write meaningful unit and integration tests.
- Demonstrate the system through a polished, interactive dashboard.

## 2. Technology Stack

| Area              | Technology                    |
| ----------------- | ----------------------------- |
| Frontend          | Vue 3, TypeScript, Vapor Mode |
| Frontend tooling  | Vite, pnpm                    |
| Backend           | C#, ASP.NET Core Web API      |
| Database          | PostgreSQL                    |
| ORM               | Entity Framework Core         |
| Backend tests     | xUnit                         |
| Frontend tests    | Vitest                        |
| API documentation | OpenAPI / Swagger             |
| Version control   | Git and GitHub                |
| CI                | GitHub Actions                |

Use Vue Single-File Components with TypeScript and Vapor compilation. Verify the compatible Vue version and compiler setup at project initialization, as Vapor Mode requires the appropriate Vue 3.6-era tooling and has evolving compatibility constraints.

Use a single backend application. Do not introduce microservices, message brokers, authentication, cloud infrastructure or third-party payment integrations.

## 3. Development Principles

1. **Build vertically:** every milestone should leave the application runnable.
2. **Keep the architecture simple:** introduce abstractions when they support a real requirement, not speculatively.
3. **Test as you build:** add tests with each feature rather than postponing testing until the end.
4. **Use integer monetary amounts:** store NZD in cents, never floating-point values.
5. **Make state transitions explicit:** payments must not move into invalid states.
6. **Treat external calls as a separate reliability boundary:** a database transaction cannot atomically commit a provider operation.
7. **Prefer demonstrable behaviour:** important reliability features must be observable through the dashboard and tests.
8. **Avoid premature extensibility:** support one currency and one mock provider initially.

---

# 4. Milestones

## Milestone 0 — Project Foundation

**Goal:** Establish the development environment and prove the frontend, backend and database work together.

### Features and tasks

- [ ] Create the repository and initial README.
- [ ] Scaffold a Vue 3 + TypeScript application with Vapor Mode.
- [ ] Scaffold an ASP.NET Core Web API.
- [ ] Configure PostgreSQL for local development.
- [ ] Configure Entity Framework Core and database migrations.
- [ ] Configure frontend-to-backend communication.
- [ ] Add environment-based configuration and a health endpoint.
- [ ] Add basic frontend and backend test infrastructure.
- [ ] Add GitHub Actions to run builds and tests.

### Acceptance criteria

- The frontend starts locally.
- The API starts locally and exposes a health endpoint.
- The API can connect to PostgreSQL.
- A database migration can be applied successfully.
- The frontend can call the API.
- CI can build the projects and run the initial tests.

**Deliverable:** A working full-stack skeleton with no payment functionality yet.

## Milestone 1 — Create and Store Payments

**Goal:** Create persistent payment records and retrieve them through the API.

### Features

**Backend**

- Define the initial `Payment` entity.
- Store amount in minor currency units, currency, reference, status and timestamps.
- Support NZD only.
- Validate amounts, supported precision and configured limits.
- Create the database migration.
- Implement payment creation and listing endpoints.
- Return consistent validation and error responses.

**Frontend**

- Create a basic payment dashboard.
- Display a table of payments.
- Build a form for creating payments.
- Display validation errors and submission results.
- Refresh the list after creating a payment.

### Initial API

- `POST /api/payments`
- `GET /api/payments`

The initial payment status is `Pending`. No provider calls or processing attempts are required yet.

### Acceptance criteria

- A user can create a payment from the dashboard.
- The payment persists in PostgreSQL.
- The payment appears in the dashboard after creation.
- Invalid amounts and unsupported input are rejected by the API.
- Automated tests cover valid and invalid payment creation.

**Deliverable:** A functioning payment registry.

## Milestone 2 — Payment Details and History

**Goal:** Make individual payment records inspectable and introduce an auditable history.

### Features

- Add a payment details view.
- Add a `PaymentAttempt` entity.
- Add a `PaymentEvent` entity.
- Record payment creation as an event.
- Display payment metadata and its event timeline.
- Display the number of processing attempts.
- Define initial payment statuses and valid transitions.
- Prevent historical events from being silently overwritten or deleted through normal application operations.

### Initial statuses

- `Pending`
- `Processing`
- `Succeeded`
- `Failed`
- `Unknown`

At this stage, only the transitions necessary for payment creation are exercised. Later milestones will introduce the remaining transitions.

### API

- `GET /api/payments/{id}`

The details endpoint returns the payment and its associated attempts and events.

### Acceptance criteria

- A user can open any existing payment.
- Creation appears in its history.
- Payments and history survive application restarts.
- Attempt and event records have the correct relationships.
- Tests cover retrieval, missing payments and history persistence.

**Deliverable:** An inspectable payment record with an auditable history.

## Milestone 3 — Mock Provider and Basic Processing

**Goal:** Process payments through a simulated external provider.

### Features

- Define an `IPaymentProvider` interface.
- Implement a deterministic `MockPaymentProvider`.
- Introduce a processing service that owns payment state transitions.
- Allow the user to select a scenario when processing a payment.
- Persist attempts, provider results and relevant events.
- Display the final result in the dashboard.

### Initial scenarios

1. **Success:** the provider approves the payment.
2. **Decline:** the provider definitively rejects the payment.
3. **Provider error:** a temporary provider failure occurs.

For this milestone, success and decline produce definitive outcomes. A temporary provider error must not automatically be treated as a definitive payment decline.

### API

- `POST /api/payments/{id}/process`

The request specifies the desired mock scenario.

### Acceptance criteria

- A pending payment can be processed.
- Successful processing sets the status to `Succeeded`.
- A decline sets the status to `Failed`.
- A temporary provider error is recorded accurately.
- Every processing attempt has a corresponding history record.
- An already successful payment cannot be processed again.
- Tests cover each scenario and invalid state transitions.

**Deliverable:** An end-to-end payment simulator with observable processing outcomes.

## Milestone 4 — Idempotency and Safe Retries

**Goal:** Ensure repeated requests do not create duplicate payments or duplicate successful provider operations.

This is the first major reliability milestone.

### Features

- Require an idempotency key when creating a payment.
- Store a normalized request fingerprint.
- Add a database uniqueness constraint for the appropriate idempotency-key scope.
- Return the existing payment when the same key and equivalent request are submitted again.
- Return a conflict response when the same key is reused with a different payload.
- Define retry behaviour for payments in each status.
- Prevent retries of completed payments from triggering another provider operation.
- Record retry attempts in the payment history.

### API behaviour

For `POST /api/payments`:

- Same key and same payload: return the existing payment.
- Same key and different payload: return `409 Conflict`.
- New key: create a new payment.

For payment processing and retries:

- A completed payment must not be charged again.
- A retry must respect the current payment state.
- An operation already in progress must not be duplicated.
- A retry must return a meaningful result when the previous outcome is already known.

### Acceptance criteria

- Repeating a create request does not create a duplicate payment.
- Reusing a key with a different payload returns a conflict.
- Repeating a processing request does not duplicate a successful operation.
- Idempotency is enforced by both application logic and database constraints.
- Automated tests verify duplicate requests and safe retries.

**Deliverable:** A payment simulator with basic idempotency guarantees.

## Milestone 5 — Timeouts, Unknown Outcomes and Reconciliation

**Goal:** Handle the hardest payment scenario: the provider may have processed a payment, but the application does not know the result.

### Features

- Add a timeout scenario.
- Add a delayed-result scenario.
- Simulate a provider operation that succeeds even though the initial request times out.
- Introduce an `Unknown` outcome for ambiguous processing results.
- Add a provider-side operation record to the mock provider, with a stable operation identifier and recorded result.
- Allow the application to query the mock provider for the original operation's result.
- Resolve an ambiguous payment without blindly submitting a second operation.
- Record reconciliation activity in the payment history.

### Important design rule

A timeout does not prove that a payment failed.

The application must retain enough information to identify and reconcile the original provider operation. Retrying an uncertain payment must reuse that operation's identity rather than creating a new simulated charge.

The mock provider should support querying an existing operation so that the application can discover whether it succeeded, was declined or remains unresolved.

### API

- `POST /api/payments/{id}/retry` — retry or reconcile according to the payment state.
- Extend payment details to expose the operation and reconciliation history.

### Acceptance criteria

- A timeout can leave a payment in `Unknown`.
- The dashboard clearly distinguishes unknown outcomes from definite failures.
- The mock provider can retain a result despite the caller timing out.
- Reconciliation discovers the original operation's result.
- A successful original operation cannot be charged a second time during reconciliation.
- The history shows the timeout and subsequent resolution.
- Automated tests cover both ambiguous success and unresolved outcomes.

**Deliverable:** A simulator demonstrating safe recovery from uncertain provider results.

## Milestone 6 — Concurrency and Database Reliability

**Goal:** Prove that the application remains correct when multiple requests arrive simultaneously.

### Features

- Test simultaneous payment creation with the same idempotency key.
- Test concurrent processing requests for the same payment.
- Enforce database uniqueness constraints.
- Use transactions for payment-state changes and associated database records.
- Introduce appropriate concurrency control, such as optimistic concurrency tokens or database-level coordination.
- Handle uniqueness violations and concurrency conflicts gracefully.
- Ensure the provider-operation boundary is safe when multiple application requests compete to process the same payment.

### Acceptance criteria

- Concurrent create requests produce one logical payment for the same idempotency key.
- Concurrent processing requests cannot create multiple successful provider operations for the same logical payment.
- Database state remains consistent if an operation fails partway through.
- Events and attempts remain consistent with the resulting payment state.
- PostgreSQL-backed integration tests exercise actual database constraints and concurrency behaviour.

**Deliverable:** A simulator with tested database and request-concurrency guarantees.

## Milestone 7 — Dashboard Polish and Demonstration

**Goal:** Turn the completed backend into a clear, professional engineering demonstration.

### Features

- Display payment summary totals for successful, pending, failed and unknown payments.
- Add status badges and useful error messages.
- Display attempt counts and timestamps.
- Improve the payment detail timeline.
- Add processing and retry controls appropriate to each payment status.
- Show the selected mock scenario and resulting provider outcome.
- Provide loading, empty and error states.
- Ensure the interface is usable on desktop and mobile.
- Add frontend tests for key interactions.

### Acceptance criteria

- Users can understand a payment's current state without reading server logs.
- Users can create, process, inspect and safely retry payments through the UI.
- Invalid operations are disabled or explained.
- The complete timeout-and-reconciliation flow is demonstrable.
- Frontend and backend test suites pass.

**Deliverable:** A polished, interactive full-stack portfolio project.

## Milestone 8 — Documentation and Final Verification

**Goal:** Make the project easy for another developer or interviewer to run and evaluate.

### Features

- Document prerequisites and setup instructions.
- Document configuration and database migrations.
- Document the architecture and payment lifecycle.
- Include representative API requests and responses.
- Explain idempotency and concurrency decisions.
- Explain why database transactions cannot make external provider calls atomic.
- Document how to run unit, integration and frontend tests.
- Provide a step-by-step demonstration script.
- Ensure CI runs the required checks.

### Acceptance criteria

A developer unfamiliar with the project can follow the README, start the application, run the tests and reproduce the main payment scenarios.

**Deliverable:** A complete repository ready to share with employers.

---

# 5. Core Data Model

Implement these entities as the requirements demand them.

### Payment

- ID
- Amount in minor units
- Currency
- Reference or order ID
- Status
- Idempotency key
- Request fingerprint
- Provider operation identifier, when available
- Provider reference, when available
- Created and updated timestamps
- Concurrency token, if required by the chosen concurrency strategy

### PaymentAttempt

- ID
- Payment ID
- Attempt number
- Scenario
- Outcome
- Provider operation identifier
- Provider reference, when available
- Non-sensitive error details
- Started and completed timestamps

### PaymentEvent

- ID
- Payment ID
- Event type
- Timestamp
- Relevant non-sensitive details

### Mock provider operation

Add this only when implementing Milestone 5. It represents the provider's record of an operation and its outcome, independently of the application's view of that outcome.

This separation is essential: the mock provider may know that a payment succeeded while the application still believes the outcome is unknown.

---

# 6. Testing Strategy

Tests should be added throughout development rather than saved for a final testing phase.

| Milestone | Required testing                                         |
| --------- | -------------------------------------------------------- |
| 0         | Build checks, health endpoint and database connectivity  |
| 1         | Payment creation and input validation                    |
| 2         | Payment retrieval and history persistence                |
| 3         | Success, decline, provider error and invalid transitions |
| 4         | Idempotency, payload conflicts and duplicate submissions |
| 5         | Timeouts, ambiguous outcomes and reconciliation          |
| 6         | PostgreSQL constraints and concurrent requests           |
| 7         | Dashboard interactions and error states                  |
| 8         | Complete test suite and documented setup verification    |

Use unit tests for isolated business rules and integration tests for API behaviour, database persistence and concurrency.

Prefer real PostgreSQL for tests that verify PostgreSQL-specific constraints or locking behaviour. A substitute database may behave differently and cannot prove those properties.

---

# 7. Explicitly Out of Scope

Do not implement these until the MVP is complete:

- Real card payments or bank transfers
- Stripe integration
- Webhook delivery
- Refunds or chargebacks
- Recurring billing
- Multiple currencies or payment providers
- Authentication and user roles
- Microservices or message brokers
- Production deployment
- Payment compliance certification
- Advanced analytics or a complex design system

Stripe test mode is a future extension. It should reuse the provider abstraction while adding provider-specific operation identifiers, webhook handling, duplicate webhook protection and reconciliation.

---

# 8. Definition of Done

The MVP is complete when all of the following are true:

- [ ] A user can create a payment from the Vue dashboard.
- [ ] Payment records persist in PostgreSQL.
- [ ] A user can process payments using deterministic mock scenarios.
- [ ] Payment details show the full attempt and event history.
- [ ] Duplicate create requests are handled idempotently.
- [ ] Reusing an idempotency key with a different payload produces a conflict.
- [ ] Timeout scenarios can produce ambiguous outcomes.
- [ ] Unknown outcomes can be reconciled safely.
- [ ] A completed payment cannot be charged twice through retries.
- [ ] Concurrent requests are handled correctly.
- [ ] Automated tests cover the critical payment lifecycle.
- [ ] The README explains how to run the project and demonstrate its reliability features.

## 9. Recommended Build Order

Build the milestones in order. Do not move into concurrency and reconciliation before the basic processing workflow is working.

The first practical target is **Milestone 0 followed by Milestone 1**. At that point, you should have a Vue Vapor dashboard that creates payments through a C# API and persists them to PostgreSQL. That gives you a small, working foundation to extend rather than a large unfinished payment-system implementation.
