/* =====================================================================
   Shared hover glossary — auto-wraps the first occurrence of each term
   on the page and shows a definition balloon on hover / focus / tap.
   To add a term: append an entry to TERMS below. That's it.
   ===================================================================== */
(function () {
  "use strict";

  // Each entry: { id, terms: [aliases, longest/most-specific first], title, def }
  const TERMS = [
    { id: "sidecar", terms: ["sidecar"], title: "Sidecar container",
      def: "A helper container deployed next to your main app container — same pod/host, shared local network and lifecycle — that takes over a cross-cutting job (here, all token handling) so it stays out of your app code." },
    { id: "blueprint", terms: ["agent identity blueprint", "agent blueprint", "blueprint"], title: "Agent (identity) blueprint",
      def: "The template and credential holder that issues agent identities. One blueprint can mint many agent identities and defines the policies they share." },
    { id: "agentIdentity", terms: ["agent identities", "agent identity"], title: "Agent identity",
      def: "The runtime identity of one specific AI agent — its own app ID, permissions, and audit trail — created from a blueprint." },
    { id: "agentUser", terms: ["agent's user account", "agent user account", "agent's user", "agent user"], title: "Agent's user account",
      def: "An optional 1:1 user account paired with an agent identity, needed only when the agent must use systems that require a real user object (mailbox, Teams)." },
    { id: "servicePrincipal", terms: ["service principal"], title: "Service principal",
      def: "The local instance of an app's identity inside a tenant — the object that actually signs in, holds permissions, and shows up in audit logs." },
    { id: "managedIdentity", terms: ["user-assigned managed identity", "managed identity", "UAMI"], title: "Managed identity",
      def: "An Azure-managed credential with no secret for you to store or rotate. Your code gets tokens automatically; Azure handles the lifecycle." },
    { id: "fic", terms: ["federated identity credentials", "federated identity credential", "FIC"], title: "Federated identity credential (FIC)",
      def: "A trust link that lets one identity present a token from a trusted issuer (like a managed identity) instead of a stored secret — removing passwords/secrets from config." },
    { id: "clientCredentials", terms: ["client-credentials", "client credentials"], title: "Client-credentials flow",
      def: "An OAuth flow where an app authenticates as itself (no user) to get a token — used for autonomous, app-only operations." },
    { id: "obo", terms: ["on-behalf-of", "on behalf of", "OBO"], title: "On-Behalf-Of (OBO)",
      def: "An OAuth flow where a service exchanges a user's token for a new one, so it can call downstream APIs as that user, with their permissions." },
    { id: "conditionalAccess", terms: ["conditional access policies", "Conditional Access", "conditional access"], title: "Conditional Access",
      def: "Entra policies that allow, block, or limit sign-ins based on conditions (user, device, risk, location) — the main control surface for governing agent access." },
    { id: "mfa", terms: ["MFA"], title: "Multi-factor authentication (MFA)",
      def: "Requiring more than a password to sign in. Agent users can't hold auth factors, so they're exempt and governed by Conditional Access instead." },
    { id: "entra", terms: ["Microsoft Entra ID", "Microsoft Entra", "Entra ID", "Entra"], title: "Microsoft Entra ID",
      def: "Microsoft's cloud identity service (formerly Azure AD). It issues and validates the tokens every agent flow relies on." },
    { id: "graph", terms: ["Microsoft Graph", "Graph scopes", "Graph"], title: "Microsoft Graph",
      def: "The unified API for Microsoft 365 data and services (mail, calendar, files, Teams). Agent permissions are largely Graph scopes." },
    { id: "tenant", terms: ["tenant"], title: "Tenant",
      def: "A single organization's dedicated instance of Entra / Microsoft 365 — its own directory, users, and security boundary." },
    { id: "trustBoundary", terms: ["trust boundaries", "trust boundary"], title: "Trust boundary",
      def: "The shared risk surface where one compromise is assumed to affect everything inside it. Crossing one means using a separate blueprint." },
    { id: "claims", terms: ["token claims", "claims"], title: "Claims",
      def: "The pieces of information encoded inside a token (who, which app, which permissions). Resource servers read them to decide what to allow." },
    { id: "scope", terms: ["delegated permissions", "scopes", "scope"], title: "Scope (delegated permission)",
      def: "A permission granted in a user context (e.g. Mail.Read). Present when an agent acts for a user; absent in pure app-only tokens." },
    { id: "roles", terms: ["app-level permissions", "application permissions", "app roles"], title: "App roles (application permissions)",
      def: "Permissions granted to an app identity itself rather than via a user — what app-only / autonomous tokens carry." },
    { id: "accessToken", terms: ["access tokens", "access token"], title: "Access token",
      def: "The short-lived credential a client presents to call an API. Clients treat it as opaque; the API validates it and reads its claims." },
    { id: "refreshToken", terms: ["refresh tokens", "refresh token"], title: "Refresh token",
      def: "A longer-lived token used to silently obtain new access tokens — useful for background / async work when no user is present." },
    { id: "tokenExchange", terms: ["token exchange", "token-exchange"], title: "Token exchange",
      def: "Trading one token for another at the identity provider — e.g. swapping a credential for a scoped resource token. The backbone of every agent flow." },
    { id: "pod", terms: ["pod"], title: "Pod",
      def: "In Kubernetes, the smallest deployable unit: one or more containers sharing a network and lifecycle. The agent and its sidecar run in the same pod." },
    { id: "kubernetes", terms: ["Kubernetes namespace", "Kubernetes", "namespace"], title: "Kubernetes / namespace",
      def: "Kubernetes orchestrates containers; a namespace is an isolated grouping within a cluster. Agents in one namespace often share a trust boundary." },
    { id: "orchestrator", terms: ["orchestration", "orchestrator"], title: "Orchestrator",
      def: "An agent that coordinates other agents, routing each task to the right specialist ('domain worker') at runtime." },
    { id: "ephemeral", terms: ["ephemeral agent identities", "ephemeral agent identity", "ephemeral"], title: "Ephemeral (agent) identity",
      def: "A short-lived agent identity created for a single session or task and deleted afterward, to limit the blast radius of a compromise." },
    { id: "leastPrivilege", terms: ["least privilege"], title: "Least privilege",
      def: "Granting only the minimum permissions needed for a task — a core security principle applied per agent identity." },
    { id: "auditLog", terms: ["sign-in logs", "audit logs", "audit log"], title: "Audit / sign-in logs",
      def: "Entra records of who did what and who signed in. Per-agent identities make these entries attributable to a specific agent." },
    { id: "exchange", terms: ["Exchange"], title: "Exchange (Online)",
      def: "Microsoft's email and calendar service. Accessing a mailbox requires a real user object — a reason an agent might need an agent's user account." },
    { id: "teams", terms: ["Microsoft Teams", "Teams"], title: "Microsoft Teams",
      def: "Microsoft's chat and meetings app. Agents can be @mentioned and present in Teams when they have an agent's user account." },
    { id: "oneDrive", terms: ["OneDrive"], title: "OneDrive",
      def: "Microsoft's cloud file storage tied to a user account — provisioned for an agent's user account when licensed." },
    { id: "gal", terms: ["Global Address List", "GAL"], title: "Global Address List (GAL)",
      def: "The organization-wide directory of mailboxes in Exchange. A fully-autonomous 'digital worker' agent can be listed here like an employee." },
    { id: "clientSecret", terms: ["client secrets", "client secret"], title: "Client secret",
      def: "A password-like string an app uses to authenticate. Discouraged in production for agents — prefer FIC or certificates." },
    { id: "appService", terms: ["App Service Plan", "App Service", "Web App"], title: "Azure App Service",
      def: "Azure's managed hosting for web apps and APIs. A blueprint can define these as the infrastructure an agent runs on." },
    { id: "spa", terms: ["Client SPA", "single-page app", "SPA"], title: "Single-page app (SPA)",
      def: "A browser app that signs the user in and obtains the initial user token that is later exchanged via OBO." },
    { id: "instantOn", terms: ["instant-on"], title: "Instant-on",
      def: "The agent user is usable immediately after creation, even though backing resources (mailbox, OneDrive) may finish provisioning a little later." },
    { id: "blastRadius", terms: ["blast radius"], title: "Blast radius",
      def: "How far the damage spreads if one identity or secret is compromised. Per-agent identities and separate blueprints keep it small." }
  ];

  const DEF = {};
  TERMS.forEach(function (t) { DEF[t.id] = t; });

  /* ---- inject styles (uses the page's existing --cp-* variables) ---- */
  var style = document.createElement("style");
  style.textContent =
    '.gterm{color:var(--cp-accent);border-bottom:1.5px dotted var(--cp-accent);cursor:help;font-weight:600;}' +
    '.gterm:hover,.gterm:focus{background:var(--cp-accent-soft);border-radius:4px 4px 0 0;outline:none;}' +
    '.gloss-balloon{position:fixed;z-index:9999;max-width:300px;background:var(--cp-panel-strong,#fff);border:1px solid var(--cp-border);border-radius:12px;padding:14px 16px;box-shadow:var(--cp-shadow);opacity:0;transform:translateY(4px);pointer-events:none;transition:opacity .15s ease,transform .15s ease;font-family:"Segoe UI",Aptos,Calibri,-apple-system,BlinkMacSystemFont,sans-serif;}' +
    '.gloss-balloon.show{opacity:1;transform:none;pointer-events:auto;}' +
    '.gloss-balloon h6{font-size:.72rem;text-transform:uppercase;letter-spacing:.09em;color:var(--cp-accent);margin:0 0 6px;}' +
    '.gloss-balloon p{font-size:.85rem;color:var(--cp-text-muted);line-height:1.5;margin:0;}';
  document.head.appendChild(style);

  /* ---- which nodes we never wrap inside ---- */
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, A: 1, BUTTON: 1, CODE: 1, PRE: 1, OPTION: 1, SVG: 1,
    H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, HEADER: 1, FOOTER: 1, TEXTAREA: 1, INPUT: 1 };
  var SKIP_CLASS = { gterm: 1, "gloss-balloon": 1, "nav-links": 1, topbar: 1, brand: 1 };

  function isExcluded(node) {
    for (var el = node.parentElement; el; el = el.parentElement) {
      if (SKIP_TAGS[el.tagName]) return true;
      if (el.classList) {
        for (var c in SKIP_CLASS) { if (el.classList.contains(c)) return true; }
      }
    }
    return false;
  }

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function wrapMatch(textNode, index, matched, id) {
    var after = textNode.splitText(index);
    after.splitText(matched.length); // leaves `after` containing exactly the match
    var span = document.createElement("span");
    span.className = "gterm";
    span.setAttribute("data-glossary", id);
    span.setAttribute("tabindex", "0");
    span.textContent = matched;
    after.parentNode.replaceChild(span, after);
  }

  function tagFirstOccurrence(entry) {
    for (var i = 0; i < entry.terms.length; i++) {
      var rx = new RegExp("\\b" + esc(entry.terms[i]) + "\\b", "i");
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = walker.nextNode())) {
        if (isExcluded(node)) continue;
        var m = rx.exec(node.nodeValue);
        if (m) { wrapMatch(node, m.index, m[0], entry.id); return true; }
      }
    }
    return false;
  }

  /* ---- balloon ---- */
  var balloon = document.createElement("div");
  balloon.className = "gloss-balloon";
  document.body.appendChild(balloon);
  var hideTimer = null;

  function show(el) {
    var g = DEF[el.getAttribute("data-glossary")];
    if (!g) return;
    clearTimeout(hideTimer);
    balloon.innerHTML = "<h6></h6><p></p>";
    balloon.querySelector("h6").textContent = g.title;
    balloon.querySelector("p").textContent = g.def;
    balloon.classList.add("show");
    var r = el.getBoundingClientRect();
    var bw = balloon.offsetWidth, bh = balloon.offsetHeight;
    var left = r.left + r.width / 2 - bw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - bw - 8));
    var top = r.top - bh - 10;
    if (top < 8) top = r.bottom + 10;
    balloon.style.left = left + "px";
    balloon.style.top = top + "px";
  }
  function hide() { hideTimer = setTimeout(function () { balloon.classList.remove("show"); }, 90); }

  function init() {
    TERMS.forEach(tagFirstOccurrence);
    var terms = document.querySelectorAll(".gterm[data-glossary]");
    terms.forEach(function (el) {
      el.addEventListener("mouseenter", function () { show(el); });
      el.addEventListener("mouseleave", hide);
      el.addEventListener("focus", function () { show(el); });
      el.addEventListener("blur", hide);
      el.addEventListener("click", function (e) { e.preventDefault(); show(el); });
    });
    balloon.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    balloon.addEventListener("mouseleave", hide);
    window.addEventListener("scroll", function () { balloon.classList.remove("show"); }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
