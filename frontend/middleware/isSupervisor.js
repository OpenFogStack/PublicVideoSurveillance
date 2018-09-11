export default function({ store, redirect }) {
  const roles = store.state.auth.loggedIn
    ? store.state.auth.user["https://watchyourfac.es/userAuthorization"].roles
    : [];

  if (!roles.includes("Supervisor")) {
    return redirect("/dashboard");
  }
}
