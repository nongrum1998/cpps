# Employee Mobile

Employee Mobile is a high-security management application designed for employee self-service and HR automation. Built with Expo (SDK 54) and React Native, it features a modular architecture and rigorous security standards.

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v10+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/build/setup/) (for builds)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 54)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS v4)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) & [TanStack Query](https://tanstack.com/query/latest)
- **Testing**: [Maestro](https://maestro.mobile.dev/) (E2E)

## 📁 Project Structure

- `src/app/`: File-based routing.
- `src/features/`: Feature-sliced modules (Auth, Leave, Salary, etc.).
- `src/shared/`: Shared components, hooks, and utilities.
- `.agents/`: Agentic configuration and project memory.

## 📚 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)
- [Environment Variables](./docs/ENV.md)
- [Scripts Reference](./docs/SCRIPTS.md)

## 🔐 Security Features

- **SSL Pinning**: Man-in-the-middle protection.
- **Biometric Auth**: FaceID/Fingerprint support.
- **Secure Storage**: Sensitive data encrypted at rest.
- **RBAC**: Role-based access control.

---

Built with ❤️ by the Pixel Thread team.
