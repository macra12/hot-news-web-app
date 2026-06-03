import InfoPage from "../components/InfoPage";

export const metadata = {
  title: "Editorial Guidelines — GenZ Flash",
  description: "The principles that guide how GenZ Flash selects and presents news.",
};

export default function GuidelinesPage() {
  return (
    <InfoPage
      title="Editorial Guidelines"
      subtitle="The standards we hold ourselves to when aggregating and presenting the news."
    >
      <h2>Accuracy first</h2>
      <p>
        We aggregate from established, reputable publishers and preserve their original headlines and summaries.
        Every article links back to its source so readers can verify and read the full story.
      </p>

      <h2>Attribution</h2>
      <p>
        Each story clearly shows its source and publication date. We do not claim third-party reporting as our own,
        and we never alter the meaning of an original headline or summary.
      </p>

      <h2>Freshness</h2>
      <p>
        Our system only stores recent, dated articles and removes duplicates, so the feed stays timely and avoids
        recycling stale content.
      </p>

      <h2>Balance &amp; diversity</h2>
      <p>
        We draw from a range of local and international outlets across multiple categories — Cambodia, World,
        Politics, Technology, Sports, Business, Entertainment, and Education — to offer a broad view of events.
      </p>

      <h2>Sensitive content</h2>
      <p>
        Stories are automatically classified by topic and sensitivity. This helps us present content responsibly and
        gives our editors visibility into the nature of what is published.
      </p>

      <h2>Corrections</h2>
      <p>
        If you spot an error or a mis-attributed story, please tell us via the{" "}
        <a href="/contact">Contact</a> page and we'll review it promptly.
      </p>
    </InfoPage>
  );
}
