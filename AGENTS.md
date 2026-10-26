# Repository Guide

## Architecture

- This is a Java 21 Maven reactor: `frontend` builds before `apigateway`. The Vue bundle is packaged as `static/` in the gateway JAR; never edit generated `frontend/dist/` files.
- `frontend/` is a Vue 3/Vite/TypeScript application using Vuetify and Pinia. `src/main.ts` is its entrypoint and `@/` maps to `frontend/src/`.
- `apigateway/` is a reactive Spring Cloud Gateway. It serves the UI and proxies `/api/dave-backend-service/**` to the DAVe backend.

## Commands

- Run the full build from the repository root: `mvn clean verify`. During `generate-sources`, the frontend module runs `npm install`, `npm run build`, and `npm run test:unit`; `frontend/package-lock.json` is the dependency lockfile.
- In `frontend/`, run `npm run lint` (Prettier check, ESLint, Vue type check) and `npm run test:unit`. Run a focused frontend test with `npm run test:unit -- tests/path/to/spec.ts`.
- Run a focused gateway test from the root with `mvn -pl apigateway -am -Dtest=ClassNameTest test`.
- Gateway builds enforce Spotless. Apply its Java formatting with `mvn -pl apigateway spotless:apply`.

## Local Development

- `npm run dev` in `frontend/` starts Vite on port 8086; its API base URL is gateway port 8084.
- Run `apigateway/runLocalNoSecurity.bat` on Windows or `apigateway/runLocalNoSecurity.sh` on Unix for a local gateway without OAuth. It enables `local,no-security` and targets the backend at `http://localhost:50001/`.
- The default gateway launcher enables external SSO and requires a configured SSO session.

## Constraints

- Frontend lint rejects `console`, requires kebab-case Vue component names in templates, and only warns on explicit `any`.
- Gateway tests use a random-port WireMock backend from `apigateway/src/test/resources/application-unittest.yml`; do not require a live backend for them.
