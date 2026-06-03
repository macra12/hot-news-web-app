import InfoPage from "../components/InfoPage";

export const metadata = {
  title: "Contact Us — GenZ Flash",
  description: "Get in touch with the GenZ Flash newsroom.",
};

export default function ContactPage() {
  return (
    <InfoPage title="Contact Us" subtitle="We'd love to hear from you — questions, story tips, or feedback.">
      <h2>Newsroom</h2>
      <p>
        For news tips, corrections, or editorial enquiries, email{" "}
        <a href="mailto:newsroom@genzflash.app">newsroom@genzflash.app</a>.
      </p>

      <h2>General &amp; support</h2>
      <p>
        For account help or general questions, email{" "}
        <a href="mailto:support@genzflash.app">support@genzflash.app</a>. We aim to reply within two business days.
      </p>

      <h2>Partnerships</h2>
      <p>
        Interested in syndication or collaboration? Reach us at{" "}
        <a href="mailto:hello@genzflash.app">hello@genzflash.app</a>.
      </p>

      <h2>Institution</h2>
      <p>
        GenZ Flash is a capstone project of the Faculty of Engineering, Department of Information Technology
        Engineering, Royal University of Phnom Penh (RUPP), Cambodia.
      </p>
    </InfoPage>
  );
}
