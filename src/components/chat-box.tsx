import { useEffect, useState, useRef } from "react";
import { authClient } from "../lib/auth-client";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

const getWorkerUrl = () => {
  return import.meta.env.VITE_WORKER_URL || "http://localhost:8787";
};

const getWsUrl = () => {
  const url = getWorkerUrl();
  if (url.startsWith("https://")) {
    return url.replace("https://", "wss://");
  }
  return url.replace("http://", "ws://");
};

function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function ChatBox() {
  const { data: session, isPending } = authClient.useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${getWorkerUrl()}/api/chat/messages`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        scrollToBottom();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setErrorMsg("Chỉ chấp nhận đăng nhập bằng email có đuôi @vnu.edu.vn!");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;
    fetchMessages();
  }, [session, isPending]);

  useEffect(() => {
    if (isPending || !session) return;

    // Connect WS
    const ws = new window.WebSocket(`${getWsUrl()}/api/chat/ws`);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg].slice(-50));
        scrollToBottom();
      } catch {
        // Ignore invalid message JSON
      }
    };

    return () => {
      ws.close();
    };
  }, [session, isPending]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await fetch(`${getWorkerUrl()}/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: input })
      });
      setInput("");
    } catch (e) {
      console.error(e);
    }
  }

  if (isPending) return <div className="text-sm p-4">Đang tải...</div>;

  return (
    <div className="flex flex-col border border-border rounded-xl p-4 h-[400px] w-full bg-card text-card-foreground shadow-lg">
      <div className="flex justify-between items-center mb-2 border-b pb-2">
        <h2 className="font-semibold text-lg">Khu Vực Trò Chuyện</h2>
        {session && (
          <button
            title="Đăng xuất"
            onClick={() => authClient.signOut()}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-muted"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-3 py-2 rounded-lg mb-2 relative text-sm" role="alert">
          <span className="block sm:inline font-medium">{errorMsg}</span>
          <button className="absolute top-0 bottom-0 right-0 px-3 py-2" onClick={() => setErrorMsg("")}>
            <span className="sr-only">Đóng</span>
            <svg className="fill-current h-4 w-4" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Đóng</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-4 space-y-3 mt-2 scrollbar-thin">
        {messages.map((m) => {
          const isMe = session?.user?.id && m.user?.id === session.user.id;
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <span className="font-medium text-xs text-muted-foreground mb-1">
                {isMe ? "Bạn" : (m.user?.name || 'Guest')}
              </span>
              <span
                className={`text-sm p-2 rounded-xl inline-block w-fit ${isMe
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-primary/10 text-primary rounded-bl-sm"
                  }`}
                style={{ wordBreak: 'break-word', maxWidth: '85%' }}
              >
                {m.content}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {!session ? (
        <div className="text-center mt-auto flex flex-col items-center border-t pt-4">
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Bạn đang xem 5 tin nhắn gần nhất. Đăng nhập bằng email <b>@vnu.edu.vn</b> để xem toàn bộ và nhắn tin.
          </p>
          <Button variant="outline" className="gap-2" onClick={() => authClient.signIn.social({
            provider: "google",
            callbackURL: window.location.href,
            errorCallbackURL: window.location.href
          })}>
            <GoogleIcon />
            Đăng nhập với Google
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex gap-2 mt-auto border-t pt-4">
          <input
            type="text"
            className="flex-1 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="Viết tin nhắn..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <Button type="submit">Gửi</Button>
        </form>
      )}
    </div>
  )
}
