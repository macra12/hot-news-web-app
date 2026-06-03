import InfoPage from "../components/InfoPage";

export const metadata = {
  title: "Terms of Use — GenZ Flash",
  description: "The terms governing your use of GenZ Flash.",
};

export default function TermsPage() {
  return (
    <InfoPage title="Terms of Use" updated="June 2026">
      <h2>1. Acceptance of terms</h2>
      <p>
        By accessing or using GenZ Flash (&quot;the Service&quot;), you agree to these Terms of Use. If you do not
        agree, please do not use the Service.
      </p>

      <h2>2. The Service</h2>
      <p>
        GenZ Flash aggregates news headlines and summaries from third-party publishers and links to their original
        articles. We are not the author of aggregated content and do not guarantee its accuracy, completeness, or
        availability.
      </p>

      <h2>3. Accounts</h2>
      <p>
        You are responsible for keeping your account credentials secure and for all activity under your account. You
        agree to provide accurate information when registering.
      </p>

      <h2>4. Acceptable use</h2>
      <ul>
        <li>Do not misuse the Service, attempt to disrupt it, or access it through automated means without permission.</li>
        <li>Do not use the Service for any unlawful purpose.</li>
        <li>Do not attempt to gain unauthorised access to accounts, systems, or data.</li>
      </ul>

      <h2>5. Intellectual property</h2>
      <p>
        Headlines, summaries, and images belong to their respective publishers. The GenZ Flash name, design, and
        original software are the property of the project team.
      </p>

      <h2>6. Disclaimer &amp; liability</h2>
      <p>
        The Service is provided &quot;as is&quot; without warranties of any kind. To the extent permitted by law, we
        are not liable for any loss arising from your use of the Service or reliance on aggregated content.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the Service after changes means you accept the
        revised terms.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about these terms? Email <a href="mailto:hello@genzflash.app">hello@genzflash.app</a>.
      </p>

      <p className="text-xs">
        GenZ Flash is an academic capstone project of the Royal University of Phnom Penh (RUPP).
      </p>
    </InfoPage>
  );
}
