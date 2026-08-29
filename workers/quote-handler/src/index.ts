/**
 * Cloudflare Worker — nhận form báo giá + newsletter từ cả 3 site,
 * đẩy về Telegram Bot (§2 TECH_STACK_v2) và ghi log Google Sheet nếu có cấu hình.
 *
 * Một Worker phục vụ 3 domain: CORS chỉ cho phép đúng 3 origin đã khai báo.
 */

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  /** Tuỳ chọn: URL Google Apps Script Web App để append vào Sheet */
  SHEET_WEBHOOK_URL?: string;
  /** Danh sách origin hợp lệ, phân tách bằng dấu phẩy */
  ALLOWED_ORIGINS: string;
}

interface Lead {
  brand: string;
  kind: "quote" | "subscribe";
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  segment?: string;
  quantity?: string;
  message?: string;
  page?: string;
}

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  const ok = origin && allowed.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0] ?? "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    Vary: "Origin",
  };
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function formatMessage(lead: Lead): string {
  const title =
    lead.kind === "quote"
      ? `🔔 <b>YÊU CẦU BÁO GIÁ — ${esc(lead.brand.toUpperCase())}</b>`
      : `📩 <b>Đăng ký nhận bảng giá — ${esc(lead.brand.toUpperCase())}</b>`;

  const rows: [string, string | undefined][] = [
    ["Họ tên", lead.name],
    ["Điện thoại", lead.phone],
    ["Email", lead.email],
    ["Công ty", lead.company],
    ["Nhóm khách", lead.segment],
    ["Số lượng", lead.quantity],
    ["Nội dung", lead.message],
    ["Trang gửi", lead.page],
  ];

  const body = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<b>${k}:</b> ${esc(v!)}`)
    .join("\n");

  return `${title}\n\n${body}\n\n<i>${new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  })}</i>`;
}

async function sendTelegram(env: Env, text: string): Promise<void> {
  const res = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    },
  );
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    let data: Record<string, string> = {};
    const ct = request.headers.get("Content-Type") ?? "";
    try {
      if (ct.includes("application/json")) {
        data = await request.json();
      } else {
        const form = await request.formData();
        for (const [k, v] of form.entries()) data[k] = String(v);
      }
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "bad_payload" }), {
        status: 400,
        headers: { ...cors, ...jsonHeaders },
      });
    }

    // Honeypot: bot điền field ẩn → giả vờ thành công, không gửi đi đâu.
    if (data.company_website) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, ...jsonHeaders },
      });
    }

    if (!data.phone && !data.email) {
      return new Response(JSON.stringify({ ok: false, error: "missing_contact" }), {
        status: 422,
        headers: { ...cors, ...jsonHeaders },
      });
    }

    const lead: Lead = {
      brand: data.brand ?? "unknown",
      kind: data.kind === "quote" ? "quote" : "subscribe",
      name: data.name,
      phone: data.phone,
      email: data.email,
      company: data.company,
      segment: data.segment,
      quantity: data.quantity,
      message: data.message,
      page: data.page ?? request.headers.get("Referer") ?? undefined,
    };

    try {
      await sendTelegram(env, formatMessage(lead));
    } catch (err) {
      console.error("telegram failed", err);
      return new Response(JSON.stringify({ ok: false, error: "notify_failed" }), {
        status: 502,
        headers: { ...cors, ...jsonHeaders },
      });
    }

    // Ghi Sheet là phụ — không để nó chặn phản hồi cho người dùng.
    if (env.SHEET_WEBHOOK_URL) {
      ctx.waitUntil(
        fetch(env.SHEET_WEBHOOK_URL, {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ ...lead, at: new Date().toISOString() }),
        }).catch((e) => console.error("sheet failed", e)),
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, ...jsonHeaders },
    });
  },
};
