# User/Authorization Management

## User Management

This class is intended for the initial creation of users. If you want to create roles, permissions or add/remove roles to users, use the class `AuthorizationManagement`.

### Methods

- retrieveAccessToken(): Promise
- async createUser(accessToken, data): Promise
- async retrieveUser(accessToken, userId): Promise
- async updateUser(accessToken, userId): Promise
- async deleteUser(accessToken, userId): Promise
- async getUsers(accessToken): Promise

### Usage
The following lines demonstrate the initialization:

```javascript
const UserManagement = require("auth0/userManagement/userManagement");
const userApi = new UserManagement();
// obtain an access token
const accessToken = userApi.retrieveAccessToken();
// get a user (usage in async functions)
let user = await userApi.retrieveUser(accessToken, userId);
```

## Authorization Management

This class is intended to create roles, permissions and add/remove roles to users. If you want to create a new user, use the class `UserManagement`.

### Methods

- async retrieveAccessToken(): Promise
- async getRoles(accessToken): Promise
- async retrieveRole(accessToken, roleId): Promise
- async createRole(accessToken, roleName, permissions): Promise
- async updateRole(accessToken, roleId, roleName, permissions): Promise
- async deleteRole(accessToken, roleId): Promise
- async getPermissions(accessToken): Promise
- async getPermission(accessToken, permissionId): Promise
- async createPermission(accessToken, permissionName): Promise
- async updatePermission(accessToken, permissionId, permissionName): Promise
- async deletePermission(accessToken, permissionId): Promise
- async getAllUsers(accessToken): Promise
- async getUser(accessToken, userId): Promise
- async getUserRoles(accessToken, userId): Promise
- async assignRoleToUser(accessToken, userId, roleId): Promise
- async removeRoleFromUser(accessToken, userId, roleId): Promise

### Usage
The following lines demonstrate the initialization:

```javascript
const AuthorizationManagement = require("auth0/userManagement/authorizationManagement");
const authApi = new AuthorizationManagement();
// obtain an access token (usage in async function)
const accessToken = await authApi.retrieveAccessToken();
// get roles of a user (usage in async function)
let userRoles = await authApi.getUserRoles(accessToken, userId);
```
