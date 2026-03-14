import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { chatService } from "@/src/lib/services";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export default function ChatScreen() {
  const { token } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hey! I can help with product picks, carts, orders, and coupons. What do you need?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const sendMessage = async () => {
    if (!token || !canSend) return;
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      text: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatService.send(token, userMessage.text);
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: response.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.bubble,
              message.role === "user" ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={message.role === "user" ? styles.userText : styles.assistantText}>
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about products, orders, or coupons..."
          style={styles.input}
          multiline
        />
        <Pressable style={[styles.sendButton, !canSend && styles.sendDisabled]} onPress={sendMessage}>
          <Text style={styles.sendText}>{loading ? "..." : "Send"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f5ee",
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    padding: 14,
    gap: 10,
    paddingBottom: 18,
  },
  bubble: {
    maxWidth: "86%",
    padding: 12,
    borderRadius: 14,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#1f1a14",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e1d4",
  },
  userText: {
    color: "#fff",
    flexShrink: 1,
    flexWrap: "wrap",
    lineHeight: 20,
  },
  assistantText: {
    color: "#1f1a14",
    flexShrink: 1,
    flexWrap: "wrap",
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e8dfcf",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2d8c5",
    borderRadius: 12,
    backgroundColor: "#fffdf8",
  },
  sendButton: {
    alignSelf: "flex-end",
    backgroundColor: "#d67723",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendDisabled: {
    opacity: 0.6,
  },
  sendText: {
    color: "#fff",
    fontWeight: "800",
  },
});
