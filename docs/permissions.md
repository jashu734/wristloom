# Wristloom Permissions & Role Matrix
**Layer 4: Auth & Permissions (15-Layer SaaS Playbook, p. 10)**

## Roles Overview

Wristloom operates three primary user roles:
1. **CUSTOMER**: High-net-worth collectors and timepiece enthusiasts booking repairs, requesting concierge services, purchasing timepieces, and storing watches in their digital vault.
2. **TECHNICIAN**: Certified master watchmakers and horologists accepting assigned service appointments, navigating en-route, completing on-site diagnostic repairs, and updating status with customer PIN verification.
3. **ADMIN**: Atelier administrators managing catalog inventory, customer disputes, technician roster credentials, pricing authority, and platform analytics.

---

## Role x Action Permissions Matrix

| Resource | Action | CUSTOMER | TECHNICIAN | ADMIN | Condition / Server Verification |
|---|---|:---:|:---:|:---:|---|
| **Orders** | `order:create` | ✅ | ✅ | ✅ | Authoritative price computed on server |
| | `order:read` | Own | ❌ | All | `userId === session.user.id` or Guest token |
| | `order:cancel` | Own (Pending only) | ❌ | All | Allowed only when status is `PENDING` |
| | `order:list_all` | ❌ | ❌ | ✅ | Filterable by status and date |
| **Bookings** | `booking:create` | ✅ | ❌ | ✅ | Authoritative service price from catalog |
| | `booking:read` | Own | Assigned | All | PII masked for unauthorized callers |
| | `booking:cancel` | Own (Pending only) | ❌ | All | Cannot cancel once en-route or in progress |
| | `booking:update_status` | ❌ | Assigned | All | Technician requires customer completion PIN |
| | `booking:assign_technician` | ❌ | ❌ | ✅ | Load-balanced queue or admin override |
| | `booking:reprice` | ❌ | ❌ | ✅ | Only admin can modify agreed deposit/price |
| | `booking:list_all` | ❌ | ❌ | ✅ | Full atelier backlog |
| **Watch Vault** | `vault:create` | ✅ | ❌ | ✅ | Scoped to `ownerId: session.user.id` |
| | `vault:read` | Own | ❌ | All | Returns 404 if not owner |
| | `vault:update` | Own | ❌ | All | Protected against mass assignment |
| | `vault:delete` | Own | ❌ | All | User-initiated deletion |
| **Catalog** | `product:create` | ❌ | ❌ | ✅ | Timepiece name, specs, price, stock |
| | `product:update` | ❌ | ❌ | ✅ | Stock adjustments, price adjustments |
| | `product:delete` | ❌ | ❌ | ✅ | Catalog deactivation |
| **Technicians** | `technician:create` | ❌ | ❌ | ✅ | Admin invites certified horologists |
| | `technician:update_location` | ❌ | Self | All | Real-time GPS coordinates updates |
| | `technician:view_private_info`| ❌ | Self | All | Phone & email masked from public roster |
| **Admin Panel** | `admin:access_dashboard` | ❌ | ❌ | ✅ | Guarded by middleware and API checks |
| | `admin:view_analytics` | ❌ | ❌ | ✅ | Platform financial GMV and booking counts |

---

## Implementation Details

All server authorization checks are centralized in `src/lib/permissions.ts` via the `can(user, action, resource)` function.
Ad-hoc string comparisons in routes are strictly prohibited.
If a user attempts to access a resource that belongs to another user/tenant, the API responds with **HTTP 404** rather than 403 to prevent resource ID enumeration (IDOR protection).
