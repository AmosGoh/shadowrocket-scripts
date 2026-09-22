const raw = $response.body;

try {
  const data = JSON.parse(raw);

  if (Array.isArray(data.items)) {
    data.items = data.items.filter(item => item?.category !== "card");
  }

  $done({ body: JSON.stringify(data) });
} catch {
  $done({ body: raw });
}