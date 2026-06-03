import InfoPage from "../components/InfoPage";

export const metadata = {
  title: "Accessibility — GenZ Flash",
  description: "Our commitment to an accessible reading experience.",
};

export default function AccessibilityPage() {
  return (
    <InfoPage
      title="Accessibility"
      subtitle="We want everyone to be able to read the news comfortably."
    >
      <h2>Our commitment</h2>
      <p>
        GenZ Flash aims to follow widely-recognised accessibility guidelines (WCAG) so the site is usable by as many
        people as possible, including those who use assistive technologies.
      </p>

      <h2>What we provide</h2>
      <ul>
        <li>A high-contrast light and dark theme you can switch at any time.</li>
        <li>Keyboard-navigable menus, search, and links with visible focus states.</li>
        <li>Descriptive labels on interactive controls and images for screen readers.</li>
        <li>Responsive layouts that adapt to phones, tablets, and desktops.</li>
        <li>Khmer and English language support with appropriate fonts.</li>
      </ul>

      <h2>Feedback</h2>
      <p>
        If you encounter an accessibility barrier, please tell us via the <a href="/contact">Contact</a> page so we
        can fix it.
      </p>
    </InfoPage>
  );
}
