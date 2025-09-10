export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const { email } = JSON.parse(body);

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const response = await fetch(
        `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members`,
        {
          method: "POST",
          headers: {
            Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: email,
            status: "subscribed",
          }),
        }
      );

      const data = await response.json();

      if (response.status >= 400) {
        return res
          .status(400)
          .json({ error: data.detail || "Mailchimp error" });
      }

      return res.status(201).json({ message: "Subscribed successfully", data });
    } catch (err) {
      return res.status(500).json({ error: err.message || "Server error" });
    }
  });
}
