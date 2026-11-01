# Shirin Shila — Technical Documentation Directory

This directory contains the authoritative technical architecture, infrastructure setup, security specifications, and recovery guides for the official **Shirin Shila** portfolio website.

---

## 📚 Documentation Index

| Guide | Description | Key Topics |
| :--- | :--- | :--- |
| [**DATABASE_SETUP.md**](./DATABASE_SETUP.md) | Database Setup & Environment Configuration | Hostinger MariaDB setup, credentials, environment variables, schema initialization |
| [**DATABASE_ARCHITECTURE.md**](./DATABASE_ARCHITECTURE.md) | Database Architecture Specification | Hybrid relational/document store pattern, connection pooling, table schemas |
| [**DOMAIN_CONFIGURATION.md**](./DOMAIN_CONFIGURATION.md) | Domain Configuration & Canonical Origin | Canonical URL hierarchy, origin normalization, DNS directives |
| [**USER_SECURITY_AND_ROLES.md**](./USER_SECURITY_AND_ROLES.md) | Security, Authentication & RBAC | Role-based access control (`admin` vs `manager`), salted bcrypt hashing, token revocation |
| [**ADMIN_SETTINGS_MAPPING.md**](./ADMIN_SETTINGS_MAPPING.md) | Admin Settings & Full-Stack Data Mapping | Mapping of all 14 CMS editorial sections to REST endpoints, database keys, and stores |
| [**BACKUP_AND_RECOVERY.md**](./BACKUP_AND_RECOVERY.md) | Backup, Recovery & Disaster Prevention | Dual-tier backup architecture, offline JSON archives, SQL restore procedures |

---

## 🏛️ System Overview

- **Production URL:** [https://shirinshila.com/](https://shirinshila.com/)
- **Admin Panel:** [https://shirinshila.com/admin](https://shirinshila.com/admin)
- **Runtime:** Node.js 22 LTS on Hostinger Cloud
- **Database Engine:** MariaDB 11.8 (`u473489494_shirin`)
- **Primary Repository Documentation:** See root [README.md](../README.md) for full project overview, local development setup, and release audit results.
