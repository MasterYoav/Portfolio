import { NextResponse } from "next/server";

export const runtime = "nodejs"; // חשוב כדי שתהיה גישה ל-env בשרת

type PinnedRepo = {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string; color: string | null } | null;
};

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;

  if (!token) {
    return NextResponse.json(
      { error: "Missing GITHUB_TOKEN in .env.local" },
      { status: 500 },
    );
  }
  if (!username) {
    return NextResponse.json(
      { error: "Missing GITHUB_USERNAME in .env.local" },
      { status: 500 },
    );
  }

  const query = `
    query ($login: String!) {
      user(login: $login) {
        pinnedItems(first: 6, types: [REPOSITORY]) {
          nodes {
            ... on Repository {
              name
              description
              url
              homepageUrl
              stargazerCount
              forkCount
              primaryLanguage { name color }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify({ query, variables: { login: username } }),
      cache: "no-store",
    });

    const json = await res.json();

    if (!res.ok || json.errors) {
      return NextResponse.json(
        { error: "GitHub query failed", details: json.errors ?? json },
        { status: 500 },
      );
    }

    const nodes: PinnedRepo[] = json.data?.user?.pinnedItems?.nodes ?? [];
    return NextResponse.json({ items: nodes });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Request failed", details: String(e?.message ?? e) },
      { status: 500 },
    );
  }
}
