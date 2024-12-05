import { Modal } from "@mui/material";
import { AiOutlineClose } from "react-icons/ai";
import Image from "next/image";

import { PreviewDialogProps } from "@/types/DialogProps";
import { getFullURL } from "@/utilities/misc/getFullURL";

export default function PreviewDialog({ open, handlePreviewClose, url }: PreviewDialogProps) {
    return (
        <Modal className="preview-dialog" open={open}>
            <div>
                <button className="btn-close icon-hoverable" onClick={handlePreviewClose}>
                    <AiOutlineClose />
                </button>
                <div className="image-wrapper">
                    <Image
                        src={url.startsWith("http://") || url.startsWith("https://") 
                            ? url 
                            : (url ? getFullURL(url) : "/assets/default-image.jpg")}                        
                        alt=""
                        fill
                        priority={false}
                    />
                </div>
            </div>
        </Modal>
    );
}
