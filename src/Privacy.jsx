import React, { useEffect } from "react";

const CONTACT_EMAIL = "liamkrubin@gmail.com";
const EFFECTIVE_DATE = "October 27, 2026";

const sectionStyle = { marginTop: "28px" };
const headingStyle = { fontSize: "20px", marginBottom: "8px" };

function Privacy() {
  useEffect(() => {
    document.title = "StatKeeper | Privacy Policy";
  }, []);
  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "40px 20px 80px",
        lineHeight: 1.6,
        color: "white",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img src="/sk.png" alt="Logo" className="mainLogo" />
        <p className="logoName">StatKeeper</p>
      </div>

      <h1 style={{ fontSize: "32px", marginTop: "24px" }}>Privacy Policy</h1>
      <p style={{ opacity: 0.7 }}>Effective {EFFECTIVE_DATE}</p>

      <p style={sectionStyle}>
        StatKeeper is a basketball stat tracker available as an iPhone and iPad
        app and at stat-keeper.vercel.app. This policy explains what
        information StatKeeper collects, how it is used, and the choices you
        have.
      </p>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Information we collect</h2>
        <ul>
          <li>
            <strong>Account information.</strong> If you sign in with Google or
            Apple, we receive your name, email address, and an account ID from
            that service. Google also provides your profile photo. If you use
            Sign in with Apple and choose to hide your email, we only receive
            Apple's private relay address.
          </li>
          <li>
            <strong>Stats you enter.</strong> Team names, jersey numbers,
            games, opponents, and the shots you log.
          </li>
        </ul>
        <p>
          We do not collect your location, contacts, or device advertising
          identifiers, and StatKeeper does not use analytics or ad tracking.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>How your information is stored</h2>
        <ul>
          <li>
            <strong>Signed out:</strong> your stats are saved only on your
            device (in the app) or in your browser (on the website).
          </li>
          <li>
            <strong>Signed in:</strong> your account information and stats are
            stored with Google Firebase (Authentication and Realtime Database)
            so they sync between the app and the website. Only you can access
            your account's data.
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>How we use your information</h2>
        <p>
          Your information is used only to sign you in, show your name and
          photo in the app, and save and sync your stats. We do not sell your
          information, share it with advertisers, or use it for marketing.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Third-party services</h2>
        <ul>
          <li>
            <strong>Google Firebase</strong> stores account and stats data for
            signed-in users.
          </li>
          <li>
            <strong>Google Sign-In and Sign in with Apple</strong> handle
            signing in. Their own privacy policies apply to the information
            you give them.
          </li>
          <li>
            <strong>MaxPreps.</strong> When you use Import Players, StatKeeper
            loads the MaxPreps roster page you enter to read the jersey
            numbers. On the website this request goes through ScraperAPI. Only
            the jersey numbers are saved.
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Exporting and deleting your data</h2>
        <ul>
          <li>
            In the app, <strong>Account → Export Data</strong> saves a copy of
            all your stats as a file.
          </li>
          <li>
            In the app, <strong>Account → Delete Account</strong> permanently
            deletes your account and all its stats from our servers. When
            signed out, <strong>Delete All Data</strong> erases the stats saved
            on your device.
          </li>
          <li>
            You can also email us at the address below to request deletion.
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Children</h2>
        <p>
          StatKeeper is not directed to children under 13, and we do not
          knowingly collect personal information from them. If you believe a
          child has given us information, contact us and we will delete it.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Changes to this policy</h2>
        <p>
          If this policy changes, we will update this page and its effective
          date.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Contact</h2>
        <p>
          Questions or requests:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#d94fd5" }}>
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>
    </div>
  );
}

export default Privacy;
