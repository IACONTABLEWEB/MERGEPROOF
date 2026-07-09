const token = "temporary-secret-for-testing";

async function pay(userId, price) {
  const user = await db.query(`SELECT * FROM users WHERE id = ${userId}`);
  return stripe.checkout.sessions.create({
    customer_email: user.email,
    mode: "payment",
    line_items: [{ price, quantity: 1 }]
  });
}
