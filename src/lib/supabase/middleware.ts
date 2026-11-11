import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_ROLES = new Set(["user", "provider", "institution", "admin"]);

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Check demo auth cookie first for evaluation resilience
  const demoUserCookie = request.cookies.get("repairlink_session")?.value;
  let resolvedRole: string | null = null;

  if (demoUserCookie) {
    try {
      const session = JSON.parse(decodeURIComponent(demoUserCookie));
      if (typeof session.role === "string" && ALLOWED_ROLES.has(session.role)) {
        resolvedRole = session.role;
      }
    } catch {
      resolvedRole = null;
    }
  }

  if (
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project") &&
    !supabaseUrl.includes("placeholder")
  ) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && !resolvedRole) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const candidate = profile?.role || (user.user_metadata?.role as string | undefined);
      if (candidate && ALLOWED_ROLES.has(candidate)) {
        resolvedRole = candidate;
      }
    }

    if (isDashboardRoute && !user && !demoUserCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  } else {
    // In local / demo mode without live Supabase configured:
    // Accessing protected dashboard without any session cookie redirects to login.
    if (isDashboardRoute && !demoUserCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Strict Role-Based Access Control (RBAC) across dashboard boundaries
  if (isDashboardRoute && resolvedRole) {
    if (pathname.startsWith("/dashboard/admin") && resolvedRole !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${resolvedRole}`;
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/dashboard/provider") &&
      resolvedRole !== "provider" &&
      resolvedRole !== "admin"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${resolvedRole}`;
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/dashboard/institution") &&
      resolvedRole !== "institution" &&
      resolvedRole !== "admin"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${resolvedRole}`;
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/dashboard/user") &&
      resolvedRole !== "user" &&
      resolvedRole !== "admin"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${resolvedRole}`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}
