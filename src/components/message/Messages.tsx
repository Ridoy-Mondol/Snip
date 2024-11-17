import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";

import Message from "./Message";
import NewMessageBox from "./NewMessageBox";
import { MessageProps, MessagesProps } from "@/types/MessageProps";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabaseUrl = "https://edduuatujlvepjzkvtau.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZHV1YXR1amx2ZXBqemt2dGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMDkwNDMsImV4cCI6MjA0Njg4NTA0M30._bT8Un-DaoDE30O-jPSmP4_ZCGnBIn56miAZPr1FGzU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Messages({ selectedMessages, messagedUsername, handleConversations, token }: MessagesProps) {
    const [freshMessages, setFreshMessages] = useState<MessageProps[]>([]);
    const messagesWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setFreshMessages(selectedMessages);
    }, [selectedMessages]);

    useEffect(() => {
        const messagesWrapper = messagesWrapperRef.current;
        messagesWrapper?.scrollTo({
            top: messagesWrapper.scrollHeight,
            behavior: "smooth",
        });
    }, [freshMessages]);

    useEffect(() => {
        const channel = supabase
            .channel("realtime:Message")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "Message" }, async (payload: any) => {
                const newMessage = payload.new;

                const { data: senderData, error: senderError } = await supabase
                    .from("User")
                    .select("username")
                    .eq("id", newMessage.senderId)
                    .single();
                
                const { data: recipientData, error: recipientError } = await supabase
                    .from("User")
                    .select("username")
                    .eq("id", newMessage.recipientId)
                    .single();

                if (senderError || recipientError) {
                    console.error("Error fetching sender or recipient data:", senderError || recipientError);
                    return;
                }

                const formattedCreatedAt = new Date(newMessage.createdAt + "Z").toISOString();

                // Construct the complete message object
                const updatedMessage: MessageProps = {
                    ...newMessage,
                    sender: {
                        username: senderData.username,
                        id: newMessage.senderId,
                    },
                    recipient: {
                        username: recipientData.username,
                        id: newMessage.recipientId,
                    },
                    createdAt: formattedCreatedAt,
                    photoUrl: newMessage.photoUrl || "",
                    text: newMessage.text,
                };

                // Check if the message is for the current conversation
                if (updatedMessage.sender.username === messagedUsername || updatedMessage.recipient.username === messagedUsername) {
                    setFreshMessages((prevMessages) => [...prevMessages, updatedMessage]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [messagedUsername]);


    return (
        <main className="messages-container">
            <div className="back-to">
                <button className="icon-hoverable btn btn-white" onClick={() => handleConversations(false)}>
                    <FaArrowLeft />
                </button>
                <div className="top">
                    <span className="top-title">{messagedUsername}</span>
                </div>
            </div>
            <div className="messages-wrapper" ref={messagesWrapperRef}>
                {freshMessages.length > 0 &&
                    freshMessages.map((message: MessageProps) => (
                        <Message key={message.id} message={message} messagedUsername={messagedUsername} />
                    ))}
            </div>
            <NewMessageBox
                messagedUsername={messagedUsername}
                token={token}
                setFreshMessages={setFreshMessages}
                freshMessages={freshMessages}
            />
        </main>
    );
}

