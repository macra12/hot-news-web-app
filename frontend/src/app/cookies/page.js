import InfoPage from "../components/InfoPage";

export const metadata = {
  title: "Cookies — GenZ Flash",
  description: "How GenZ Flash uses cookies and local storage.",
};

export default function CookiesPage() {
  return (
    <InfoPage title="Cookies" updated="June 2026">
      <h2>What we store</h2>
      <p>
        GenZ Flash uses a small amount of browser storage to make the site work and remember your preferences. We do
        not use third-party advertising or tracking cookies.
      </p>

      <h2>Types we use</h2>
      <ul>
        <li><strong>Essential</strong> — keep you signed in and maintain your session securely.</li>
        <li><strong>Preferences</strong> — remember your language (EN / ខ្មែរ) and light/dark theme.</li>
        <li><strong>Analytics (anonymous)</strong> — help us understand which articles are popular so we can improve.</li>
      </ul>

      <h2>Managing cookies</h2>
      <p>
        You can clear or block cookies in your browser settings at any time. Note that disabling essential storage
        may sign you out or reset your preferences.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href="mailto:support@genzflash.app">support@genzflash.app</a>.
      </p>
    </InfoPage>
  );
}
