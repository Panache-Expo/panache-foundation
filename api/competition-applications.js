const message = "email is required";

export default function handler(req, res) {
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, message }));
}
