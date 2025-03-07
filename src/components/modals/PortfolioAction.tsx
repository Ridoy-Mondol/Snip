import React, { useState, useEffect } from 'react'
import {
    Dialog,
    Box,
    Button,
    Modal,
    Typography,
    TextField,
    InputAdornment,
  } from "@mui/material";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { RiCloseLine } from "react-icons/ri";
import { AiOutlineDollar } from "react-icons/ai";

import CustomSnackbar from "@/components/misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";

interface Asset {
    id: string;
    name: string;
    amount: string;
    buyPrice: string;
    date: string;
    fee: string;
    notes: string;
    authorId: string;
  }
interface PropsTypes {
    showActionModal: boolean;
    setShowActionModal: React.Dispatch<React.SetStateAction<boolean>>;
    selectedAsset: Asset | null,
    userId: string | undefined,
    onLoadingChange: (value: boolean) => void,
    isDarkMode: boolean,
  }

const PortfolioAction = ({ showActionModal, setShowActionModal, selectedAsset, userId, onLoadingChange, isDarkMode }: PropsTypes) => {
  const [updateModal, setUpdateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [coin, setCoin] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerCoin, setPricePerCoin] = useState("");
  const [totalSpent, setTotalSpent] = useState(0);
  const [fees, setFees] = useState("");
  const [notes, setNotes] = useState("");
  const [assetId, setAssetId] = useState("");
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

  const handleUpdate = () => {
    setUpdateModal(true);
    setShowActionModal(false);
    if (selectedAsset) {
      setCoin(selectedAsset.name);
      setQuantity(selectedAsset.amount);
      setPricePerCoin(selectedAsset.buyPrice);
      setFees(selectedAsset.fee);
      setNotes(selectedAsset.notes);
      setAssetId(selectedAsset.id);
    }
  }

  useEffect(() => {
    if (quantity && pricePerCoin) {
      const priceWithoutCommas = pricePerCoin.replace(/,/g, "");
      const parsedQuantity = parseFloat(quantity);
      const parsedPrice = parseFloat(priceWithoutCommas);
        setTotalSpent(parsedQuantity * parsedPrice);
    } else {
       setTotalSpent(0);
    }
  },[quantity, pricePerCoin])

  const handleSubmit = async () => {
    if ((!coin && !quantity && !pricePerCoin && !fees && !notes) || !assetId) {
      return;
    }
    onLoadingChange(true);
    try {
       const response = await fetch("/api/assets/update", {
         method: "PATCH",
         headers: {
            "assetId": assetId,
         },
         body: JSON.stringify({
          name: coin, 
          amount: parseFloat(quantity) || '', 
          buyPrice: parseFloat(pricePerCoin) || '',
          fee: fees ? parseFloat(fees) : 0, 
          notes: notes || null, 
          authorId: userId,
         }),
       })
       if (!response.ok) {
          onLoadingChange(false);
          setSnackbar({
            message: "Something went wrong!",
            severity: "error",
            open: true,
         });
       }
       const data = await response.json();
       if (data.success) {
         onLoadingChange(false);
         setUpdateModal(false);
         setSnackbar({
          message: "Asset updated successfully",
          severity: "success",
          open: true,
        });
         window.location.reload();
       } else {
         onLoadingChange(false);
         setSnackbar({
          message: "Something went wrong!",
          severity: "error",
          open: true,
       });
       }
    } catch(e) {
      onLoadingChange(false);
      setSnackbar({
        message: "Something went wrong!",
        severity: "error",
        open: true,
     });
    }
  }

  const handleDelete = async () => {
    if (!assetId) {
      return;
    }
    onLoadingChange(true);
    try {
       const response = await fetch("/api/assets/delete", {
         method: "DELETE",
         headers: {
            "assetId": assetId,
         },
       })
       if (!response.ok) {
          onLoadingChange(false);
          setSnackbar({
            message: "Something went wrong!",
            severity: "error",
            open: true,
         });
       }
       const data = await response.json();
       if (data.success) {
         onLoadingChange(false);
         setDeleteModal(false);
         setSnackbar({
          message: "Asset deleted successfully",
          severity: "success",
          open: true,
        });
         window.location.reload();
       } else {
         onLoadingChange(false);
         setSnackbar({
          message: "Something went wrong!",
          severity: "error",
          open: true,
       });
       }
    } catch(e) {
      onLoadingChange(false);
      setSnackbar({
        message: "Something went wrong!",
        severity: "error",
        open: true,
     });
    }
  }

  return (
    <>
    <Dialog
      open={showActionModal}
      onClose={() => setShowActionModal(false)}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          boxShadow: 10,
          padding: 2,
          minWidth: 260,
          background: isDarkMode 
        ? "linear-gradient(135deg, #121212, #232323)" 
        : "linear-gradient(135deg, #ffffff, #f8f8f8)",
          color: isDarkMode ? "#fff" : "#000",
        },
      }}
    >
      <Box 
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1, 
        }}
      >
    
        {/* Update Button */}
        <Button
          startIcon={<FiEdit size={18} color={isDarkMode ? "#E0E0E0" : "#333"} />}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            textTransform: "none",
            fontSize: "16px",
            color: isDarkMode ? "#E0E0E0" : "#333",
            width: "100%",
            backgroundColor: isDarkMode 
          ? "rgba(255, 255, 255, 0.05)" 
          : "rgba(0, 0, 0, 0.05)",
            padding: "12px 16px",
            "& .MuiButton-startIcon": { marginRight: 3 },
            "&:hover": { 
              backgroundColor: isDarkMode 
            ? "rgba(255, 255, 255, 0.1)" 
            : "rgba(0, 0, 0, 0.1)" 
            },
          }}
          onClick={handleUpdate}
        >
          Update
        </Button>

        {/* Delete Button */}
        <Button
          startIcon={<FiTrash2 size={18} color={isDarkMode ? "#FF5C5C" : "#D32F2F"} />}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            textTransform: "none",
            fontSize: "16px",
            color: isDarkMode ? "#FF5C5C" : "#D32F2F",
            width: "100%",
            backgroundColor: isDarkMode 
          ? "rgba(255, 255, 255, 0.05)" 
          : "rgba(0, 0, 0, 0.05)",
            padding: "12px 16px",
            "& .MuiButton-startIcon": { marginRight: 3 }, 
            "&:hover": { 
              backgroundColor: isDarkMode 
            ? "rgba(255, 255, 255, 0.1)" 
            : "rgba(0, 0, 0, 0.1)" 
            },
          }}
          onClick={() => {
            setDeleteModal(true);
            setShowActionModal(false);
            selectedAsset && setAssetId(selectedAsset.id);
          }}
        >
          Delete
        </Button>
      </Box>
    </Dialog>

    {/* Update Asset Modal */}
    <Modal
           open={updateModal}
           onClose={() => setUpdateModal(false)}
           aria-labelledby="update-asset-modal"
           aria-describedby="modal-to-update-crypto-asset"
       >
           <Box
           sx={{
               position: "absolute",
               top: "50%",
               left: "50%",
               transform: "translate(-50%, -50%)",
               width: 400,
               padding: 3,
               bgcolor: isDarkMode ? "#121212" : "#fff",
               borderRadius: 2,
               boxShadow: 24,
               color: isDarkMode ? "#fff" : "#000",
           }}
           >
           {/* Header */}
           <Box display="flex"           justifyContent="space-between"           alignItems="center" mb={2}>
               <Typography variant="h5"           fontWeight="bold">Update Asset</Typography>
               <RiCloseLine
               size={24}
               color={isDarkMode ? "#fff" : "#000"}
               style={{ cursor: "pointer" }}
               onClick={() => setUpdateModal(false)}
               />
           </Box>

           {/* Asset Name */}
           <TextField
               label="Asset Name"
               fullWidth
               variant="outlined"
               margin="normal"
               value={coin}
               required
               autoComplete="off"
               disabled
               sx={{
               bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
               color: isDarkMode ? "#fff" : "#000",
               }}
           />

           {/* Quantity & Price Per Coin */}
           <Box display="flex"           justifyContent="space-between"           alignItems="center" gap={2}>
               <TextField
               label="Quantity"
               fullWidth
               variant="outlined"
               margin="normal"
               required
               value={quantity}
               onChange={(e) => {
                   const value = e.target.value;
                   if (/^\d*\.?\d*$/.test(value)) {
                   setQuantity(value);
                   }
               }}
               autoComplete="off"
               inputProps={{ inputMode: "decimal", pattern: "[0-9]*" }}
               sx={{
                   bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
                   color: isDarkMode ? "#fff" : "#000",
               }}
               />
               <TextField
               label="Price Per Coin"
               fullWidth
               variant="outlined"
               margin="normal"
               required
               value={pricePerCoin}
               onChange={(e) => {
                   const value = e.target.value;
                   if (/^\d*\.?\d*$/.test(value)) {
                   setPricePerCoin(value);
                   }
               }}
               autoComplete="off"
               inputProps={{ inputMode: "decimal", pattern: "[0-9]*" }}
               sx={{
                   bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
                   color: isDarkMode ? "#fff" : "#000",
               }}
               InputProps={{
                   endAdornment: (
                   <InputAdornment position="end">
                       <AiOutlineDollar size={20} color={isDarkMode ? "#fff" : "#000"} />
                   </InputAdornment>
                   ),
               }}
               />
           </Box>

           {/* Total Spent */}
           <TextField
               label="Total spent"
               fullWidth
               variant="outlined"
               margin="normal"
               value={totalSpent}
               autoComplete="off"
               inputProps={{ inputMode: "decimal", pattern: "[0-9]*" }}
               sx={{
               bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
               color: isDarkMode ? "#fff" : "#000",
               }}
               InputProps={{
               endAdornment: (
                   <InputAdornment position="end">
                   <AiOutlineDollar size={20} color={isDarkMode ? "#fff" : "#000"} />
                   </InputAdornment>
               ),
               }}
           />

           {/* Fees */}
           <TextField
               label="Fees"
               fullWidth
               variant="outlined"
               margin="normal"
               value={fees}
               onChange={(e) => {
               const value = e.target.value;
               if (/^\d*\.?\d*$/.test(value)) {
                   setFees(value);
               }
               }}
               autoComplete="off"
               inputProps={{ inputMode: "decimal", pattern: "[0-9]*" }}
               sx={{
               bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
               color: isDarkMode ? "#fff" : "#000",
               }}
               InputProps={{
               endAdornment: (
                   <InputAdornment position="end">
                   <AiOutlineDollar size={20} color={isDarkMode ? "#fff" : "#000"} />
                   </InputAdornment>
               ),
               }}
           />

           {/* Notes */}
           <TextField
               label="Notes"
               fullWidth
               variant="outlined"
               margin="normal"
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               autoComplete="off"
               multiline
               rows={4}
               sx={{
               bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
               color: isDarkMode ? "#fff" : "#000",
               }}
           />

           {/* Submit Button */}
           <Button
               variant="contained"
               sx={{
               mt: 2,
               width: "100%",
               bgcolor: isDarkMode ? "#1976d2" : "#1565c0",
               color: "#fff",
               "&:hover": {
                   bgcolor: isDarkMode ? "#1565c0" : "#0d47a1",
               },
               }}
               disabled={!coin && !quantity && !pricePerCoin && !fees && !notes}
               onClick={handleSubmit}
           >
               Update Asset
           </Button>
           </Box>
       </Modal>
      
      {/* delete modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          width: '250px',
          maxWidth: '90%',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Are you sure you want to delete this asset?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <Button variant="outlined" color="primary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>

      {snackbar.open && (
        <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
      )}

      </>


  )
}

export default PortfolioAction
