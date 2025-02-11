import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { TextField, Button } from "@mui/material";
import { FaPaperPlane, FaRegImage, FaRegSmile } from "react-icons/fa";
import { AiFillAudio, AiOutlineStop } from "react-icons/ai";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import * as yup from "yup";

import CircularLoading from "../misc/CircularLoading";
import Uploader from "../misc/Uploader";
import { createMessage } from "@/utilities/fetch";
import { uploadFile } from "@/utilities/storage";
import { MessageFormProps } from "@/types/MessageProps";
import useSpeechToText from "@/hooks/useSpeechInput";

export default function NewMessageBox({ messagedUsername, token, setFreshMessages, freshMessages }: MessageFormProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [showDropzone, setShowDropzone] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const queryClient = useQueryClient();
    const { transcript, listening, startListening, stopListening, isSupported } = useSpeechToText();

    const mutation = useMutation({
        mutationFn: createMessage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", token.username] });
        },
        onError: (error) => console.log(error),
    });

    const handlePhotoChange = (file: File) => {
        setPhotoFile(file);
    };

    const validationSchema = yup.object({
        text: yup
            .string()
            .max(280, "Message text should be of maximum 280 characters length.")
            .required("Message text can't be empty."),
    });

    const formik = useFormik({
        initialValues: {
            sender: token.username,
            recipient: messagedUsername ? messagedUsername : token.username, // if messagedUsername is null, then the user is messaging themselves
            text: "",
            photoUrl: "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            if (photoFile) {
                const path: string | void = await uploadFile(photoFile);
                if (!path) throw new Error("Error uploading image.");
                values.photoUrl = path;
                setPhotoFile(null);
            }
            mutation.mutate(JSON.stringify(values));
            setShowDropzone(false);
            formik.resetForm({ values: { ...formik.initialValues } });
        },
    });

    const handleStartListening = () => {
        if (!isSupported) {
          return (
            alert("Your browser do not support speechRecognition")
          )
        }
        startListening((newTranscript) => {
          formik.setFieldValue("text", formik.values.text ? formik.values.text + " " + newTranscript : newTranscript);
        });
      };
    
      const handleStopListening = () => {
          stopListening();
      };

    return (
        <div className="new-message-box">
            <form className="new-message-form" onSubmit={formik.handleSubmit}>
                <div className="input">
                    <TextField
                        placeholder="Start a new message"
                        hiddenLabel
                        variant="outlined"
                        name="text"
                        sx={{ width: "65%" }}
                        value={formik.values.text}
                        onChange={formik.handleChange}
                        error={formik.touched.text && Boolean(formik.errors.text)}
                        InputProps={{
                            endAdornment: (listening ? (
                            <Button 
                            onClick={handleStopListening} 
                            color="secondary">
                                <AiOutlineStop size={20} />
                              </Button>
                            ) : (
                              <Button 
                              onClick={() => {
                                handleStartListening()
                              }}
                              color="primary">
                                <AiFillAudio size={20} />
                              </Button>
                            )),
                          }}
                    />
                </div>
                {formik.isSubmitting ? (
                    <CircularLoading />
                ) : (
                    <button
                        type="submit"
                        className={`btn btn-white icon-hoverable ${formik.isValid ? "" : "disabled"}`}
                        disabled={!formik.isValid}
                    >
                        <FaPaperPlane />
                    </button>
                )}
            </form>
            <div className="input-additions">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setShowDropzone(true);
                    }}
                    className="icon-hoverable"
                >
                    <FaRegImage />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setShowPicker(!showPicker);
                    }}
                    className="icon-hoverable"
                >
                    <FaRegSmile />
                </button>
            </div>
            {showPicker && (
                <div className="emoji-picker">
                    <Picker
                        data={data}
                        onEmojiSelect={(emoji: any) => {
                            formik.setFieldValue("text", formik.values.text + emoji.native);
                            setShowPicker(false);
                        }}
                        previewPosition="none"
                        onClickOutside={() => setShowPicker(false)}
                    />
                </div>
            )}
            {showDropzone && <Uploader handlePhotoChange={handlePhotoChange} />}
        </div>
    );
}







