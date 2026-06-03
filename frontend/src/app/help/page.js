import InfoPage from "../components/InfoPage";

export const metadata = {
  title: "Help & FAQ — GenZ Flash",
  description: "Answers to common questions about using GenZ Flash.",
};

export default function HelpPage() {
  return (
    <InfoPage title="Help & FAQ" subtitle="Quick answers to the questions readers ask most.">
      <h2>What is GenZ Flash?</h2>
      <p>
        GenZ Flash is a Cambodian news platform that brings together the latest stories from trusted local and
        international sources into one clean, fast, modern reading experience — in English and Khmer.
      </p>

      <h2>Do I need an account?</h2>
      <p>
        No. You can browse, search, and read all news without an account. Creating a free account lets you save
        articles and get a more personalised feed.
      </p>

      <h2>How do I create an account?</h2>
      <p>
        Click <a href="/register">Register Free</a> in the header or footer, enter your details, and you're in.
        Already have one? <a href="/login">Sign in here</a>.
      </p>

      <h2>How often is the news updated?</h2>
      <p>
        Our aggregator pulls fresh stories from its sources continuously, and the homepage refreshes automatically
        every couple of minutes so you always see the latest headlines.
      </p>

      <h2>Where do the articles come from?</h2>
      <p>
        Headlines are aggregated from established publishers (such as the BBC, Al Jazeera, The Guardian, Khmer Times,
        and others). Each article links back to its original source so you can read the full story at the publisher.
      </p>

      <h2>How do I switch language or theme?</h2>
      <p>
        Use the EN / ខ្មែរ toggle in the header to switch language, and the light/dark switch to change the theme.
        Your choice is remembered on your device.
      </p>

      <h2>Still need help?</h2>
      <p>
        Visit our <a href="/contact">Contact</a> page and we'll be glad to assist.
      </p>
    </InfoPage>
  );
}
