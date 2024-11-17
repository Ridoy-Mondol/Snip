import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!URL || !KEY) throw new Error("Supabase credentials are not provided.");

export const supabase = createClient(URL, KEY);

export const uploadFile = async (file: File) => {
    const { data, error } = await supabase.storage.from("media").upload(`${Date.now()}`, file);
    if (error) {
        return console.log(error);
    }
    return data.path;
};

// export const uploadFile = async (file: File, userId: string) => {
//     try {
//         const { data, error } = await supabase.storage.from("media").upload(`${Date.now()}`, file, {
//             upsert: false,
//             cacheControl: "3600",
//             metadata: { owner: userId },
//         });
        
//         if (error) {
//             console.error("Supabase upload error:", error.message);
//             return null; 
//         }

//         console.log("Upload successful. File path:", data.path);
//         return data.path; 
//     } catch (err) {
//         console.error("Unexpected upload error:", err);
//         return null;
//     }
// };