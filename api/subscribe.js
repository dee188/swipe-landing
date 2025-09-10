export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

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

    if (!response.ok) {
      return res
        .status(400)
        .json({ error: data.detail || JSON.stringify(data) });
    }

    return res.status(201).json({ message: "Subscribed successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
