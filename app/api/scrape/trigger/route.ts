import { NextResponse } from "next/server";

export async function POST() {
  const githubRepo = process.env.GITHUB_REPO;
  const githubPat = process.env.GITHUB_PAT;

  if (!githubRepo || !githubPat) {
    return NextResponse.json(
      {
        status: "mock-triggered",
        note: "Set GITHUB_REPO and GITHUB_PAT to dispatch the real GitHub Actions workflow.",
      },
      { status: 202 }
    );
  }

  const response = await fetch(
    `https://api.github.com/repos/${githubRepo}/actions/workflows/scrape.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `token ${githubPat}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({ ref: "main" }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: "Failed to trigger scrape workflow", details },
      { status: response.status }
    );
  }

  return NextResponse.json({ status: "triggered" });
}
