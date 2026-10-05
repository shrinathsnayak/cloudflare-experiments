import type { Metadata } from "next";
import { StaticPageShell } from "@/components/static-page-shell";
import { appName, brandProductName, contactChannels } from "@/lib/shared";

export const metadata: Metadata = {
  title: `Contact ${brandProductName}`,
  description: `How to reach the ${appName} maintainers for bugs, ideas, security reports, and agent feedback.`,
};

export default function ContactPage() {
  return (
    <StaticPageShell
      title={`Contact ${brandProductName}`}
      description={`Reach the maintainers of ${appName} through public GitHub channels or email. We do not offer Cloudflare account support.`}
    >
      <p>
        {appName} is an open-source project. The fastest way to get a response is a public GitHub
        issue or discussion so other developers can find the answer later. Use email for private
        security or maintainer-only topics.
      </p>
      <h2>Technical support and feature ideas</h2>
      <ul>
        <li>
          <a href={contactChannels.githubIssues}>Open a GitHub Issue</a> for bugs, broken docs
          links, or new experiment proposals.
        </li>
        <li>
          <a href={contactChannels.githubDiscussions}>GitHub Discussions</a> for open-ended design
          questions and show-and-tell.
        </li>
        <li>
          Maintainer profile: <a href={contactChannels.githubProfile}>github.com/shrinathsnayak</a>{" "}
          and portfolio <a href={contactChannels.portfolio}>snayak.dev</a>.
        </li>
      </ul>
      <h2>Email</h2>
      <p>
        Email{" "}
        <a href="mailto:contact@cloudflare-experiments.com">contact@cloudflare-experiments.com</a> for
        private correspondence. Prefer GitHub for anything that can be public - responses are faster
        there and help the community.
      </p>
      <h2>Social</h2>
      <ul>
        <li>
          <a href={contactChannels.x}>X / Twitter</a>
        </li>
        <li>
          <a href={contactChannels.linkedin}>LinkedIn</a>
        </li>
      </ul>
      <p>
        Please do not use these channels for Cloudflare billing, account recovery, or production
        incident response for Cloudflare Inc. products - contact Cloudflare support for those.
        {appName} only covers this catalog and its product experiments (usually deployed as
        Workers).
      </p>
    </StaticPageShell>
  );
}
