export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: "Missing messages array in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: body.messages
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return new Response(JSON.stringify({ error: `Groq API error: ${errText}` }), {
        status: groqResponse.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await groqResponse.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
