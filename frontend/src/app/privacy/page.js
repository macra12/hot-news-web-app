import InfoPage from "../components/InfoPage";

export const metadata = {
  title: "Privacy Policy — GenZ Flash",
  description: "How GenZ Flash handles your data.",
};

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" updated="June 2026">
      <h2>Overview</h2>
      <p>
        This policy explains what information GenZ Flash collects, how we use it, and the choices you have. We keep
        data collection to the minimum needed to run the Service.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account data</strong> — if you register, we store your username, email, and a securely hashed password.</li>
        <li><strong>Usage data</strong> — anonymous information such as articles viewed and search terms, used to improve relevance and performance.</li>
        <li><strong>Preferences</strong> — your language and theme choices, stored on your device.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To provide and maintain the Service.</li>
        <li>To personalise your feed and recommendations.</li>
        <li>To understand usage trends and improve quality and speed.</li>
      </ul>

      <h2>How we protect it</h2>
      <p>
        Passwords are stored using strong one-way hashing. Traffic is encrypted over HTTPS. Access to administrative
        functions is restricted and authenticated.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell your personal data. Aggregated articles link out to third-party publishers, whose own privacy
        policies apply once you leave our site.
      </p>

      <h2>Your choices</h2>
      <p>
        You can browse without an account. If you have an account and would like it removed, contact us at{" "}
        <a href="mailto:support@genzflash.app">support@genzflash.app</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email <a href="mailto:support@genzflash.app">support@genzflash.app</a>.
      </p>
    </InfoPage>
  );
}
