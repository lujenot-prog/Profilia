import JSZip from "jszip";

type ChatMessage = {
  role: string;
  content: string;
  create_time?: number | null;
};

type ParseOutput = {
  text: string;
  stats: {
    conversations: number;
    messages: number;
    filesRead: number;
  };
};

function normalizeContent(content: unknown): string {
  if (!content) return "";

  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((item) => normalizeContent(item))
      .filter(Boolean)
      .join("\n");
  }

  if (typeof content === "object") {
    const obj = content as Record<string, unknown>;

    if (Array.isArray(obj.parts)) {
      return obj.parts
        .map((part) => normalizeContent(part))
        .filter(Boolean)
        .join("\n");
    }

    if (typeof obj.text === "string") return obj.text;
  }

  return "";
}

function extractMessagesFromConversation(conversation: any): ChatMessage[] {
  const mapping = conversation?.mapping;
  if (!mapping || typeof mapping !== "object") return [];

  const messages: ChatMessage[] = [];

  for (const node of Object.values(mapping) as any[]) {
    const message = node?.message;
    const authorRole = message?.author?.role;
    const content = normalizeContent(message?.content);

    if (!authorRole || !content.trim()) continue;
    if (authorRole === "system" || authorRole === "tool") continue;

    messages.push({
      role: authorRole,
      content: content.trim(),
      create_time: message?.create_time ?? null,
    });
  }

  return messages.sort((a, b) => (a.create_time ?? 0) - (b.create_time ?? 0));
}

function conversationsToText(conversations: any[]): ParseOutput {
  const blocks: string[] = [];
  let messageCount = 0;

  for (const conversation of conversations) {
    const title = conversation?.title || "Conversation sans titre";
    const messages = extractMessagesFromConversation(conversation);
    if (!messages.length) continue;

    const rendered = messages
      .map(
        (msg) => `${msg.role === "user" ? "Utilisateur" : "Assistant"} : ${msg.content}`
      )
      .join("\n\n");

    blocks.push(`### ${title}\n${rendered}`);
    messageCount += messages.length;
  }

  return {
    text: blocks.join("\n\n---\n\n"),
    stats: {
      conversations: blocks.length,
      messages: messageCount,
      filesRead: 1,
    },
  };
}

function tryParseJson(raw: string): any[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function parseChatExportFile(file: File): Promise<ParseOutput> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".zip")) {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const convoFiles = Object.keys(zip.files)
      .filter((name) => /^conversations-\d+\.json$/i.test(name.split("/").pop() || ""))
      .sort((a, b) => a.localeCompare(b));

    const allConversations: any[] = [];

    for (const name of convoFiles) {
      const zipEntry = zip.file(name);
      if (!zipEntry) continue;

      const raw = await zipEntry.async("string");
      const parsed = tryParseJson(raw);
      if (parsed) allConversations.push(...parsed);
    }

    if (allConversations.length) {
      const out = conversationsToText(allConversations);
      out.stats.filesRead = convoFiles.length;
      return out;
    }

    const htmlEntry = zip.file("chat.html");
    if (htmlEntry) {
      const html = await htmlEntry.async("string");
      const stripped = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

      return {
        text: stripped,
        stats: { conversations: 0, messages: 0, filesRead: 1 },
      };
    }

    throw new Error(
      "Aucun fichier conversations-xxx.json lisible n’a été trouvé dans ce zip."
    );
  }

  const raw = await file.text();
  const parsed = tryParseJson(raw);

  if (parsed) {
    return conversationsToText(parsed);
  }

  return {
    text: raw,
    stats: { conversations: 0, messages: 0, filesRead: 1 },
  };
}